import 'package:flutter/material.dart';
import 'l10n/app_translations.dart';
import 'widgets/readonly_banner.dart';

void main() {
  runApp(const ScolyvaApp());
}

class ScolyvaApp extends StatefulWidget {
  const ScolyvaApp({Key? key}) : super(key: key);

  @override
  State<ScolyvaApp> createState() => _ScolyvaAppState();
}

class _ScolyvaAppState extends State<ScolyvaApp> {
  ThemeMode _themeMode = ThemeMode.light; // Default to Light mode!
  String _lang = 'fr';
  String _currentRole = 'SCHOOL_ADMIN';

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Scolyva Mobile',
      debugShowCheckedModeBanner: false,
      themeMode: _themeMode,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0284C7),
          brightness: Brightness.light,
        ),
      ),
      darkTheme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF38BDF8),
          brightness: Brightness.dark,
        ),
      ),
      home: MobileDashboard(
        lang: _lang,
        onLangChanged: (newLang) => setState(() => _lang = newLang),
        isDark: _themeMode == ThemeMode.dark,
        onThemeToggled: () => setState(() {
          _themeMode = _themeMode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark;
        }),
        currentRole: _currentRole,
        onRoleChanged: (role) => setState(() => _currentRole = role),
      ),
    );
  }
}

class MobileDashboard extends StatefulWidget {
  final String lang;
  final ValueChanged<String> onLangChanged;
  final bool isDark;
  final VoidCallback onThemeToggled;
  final String currentRole;
  final ValueChanged<String> onRoleChanged;

  const MobileDashboard({
    Key? key,
    required this.lang,
    required this.onLangChanged,
    required this.isDark,
    required this.onThemeToggled,
    required this.currentRole,
    required this.onRoleChanged,
  }) : super(key: key);

  @override
  State<MobileDashboard> createState() => _MobileDashboardState();
}

class _MobileDashboardState extends State<MobileDashboard> {
  bool _isReadOnly = false;
  int _daysRemaining = 14;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: Colors.sky.shade600,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Text('S', style: TextStyle(fontWeight: FontWeight.black, color: Colors.white)),
            ),
            const SizedBox(width: 8),
            const Text('Scolyva Mobile', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
          ],
        ),
        actions: [
          IconButton(
            icon: Icon(widget.lang == 'fr' ? Icons.language : Icons.g_translate),
            onPressed: () => widget.onLangChanged(widget.lang == 'fr' ? 'en' : 'fr'),
            tooltip: 'Basculer Langue FR/EN',
          ),
          IconButton(
            icon: Icon(widget.isDark ? Icons.light_mode : Icons.dark_mode),
            onPressed: widget.onThemeToggled,
            tooltip: 'Thème Clair/Sombre',
          ),
        ],
      ),
      body: Column(
        children: [
          ReadonlyBannerWidget(
            isReadOnly: _isReadOnly,
            daysRemaining: _daysRemaining,
            lang: widget.lang,
            onUpgradePressed: () {
              setState(() {
                _isReadOnly = false;
                _daysRemaining = 365;
              });
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Abonnement Pro activé pour 1 an via CinetPay !')),
              );
            },
          ),

          // Role selector bar
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                _buildRoleChip('SCHOOL_ADMIN', AppTranslations.get('role_admin', widget.lang), Icons.shield),
                _buildRoleChip('ACCOUNTANT', AppTranslations.get('role_accountant', widget.lang), Icons.payments),
                _buildRoleChip('TEACHER', AppTranslations.get('role_teacher', widget.lang), Icons.menu_book),
                _buildRoleChip('PARENT', AppTranslations.get('role_parent', widget.lang), Icons.family_restroom),
                _buildRoleChip('STUDENT', AppTranslations.get('role_student', widget.lang), Icons.person),
              ],
            ),
          ),

          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                if (widget.currentRole == 'SCHOOL_ADMIN') _buildSchoolAdminView(),
                if (widget.currentRole == 'ACCOUNTANT') _buildAccountantView(),
                if (widget.currentRole == 'TEACHER') _buildTeacherView(),
                if (widget.currentRole == 'PARENT') _buildParentView(),
                if (widget.currentRole == 'STUDENT') _buildStudentView(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRoleChip(String role, String label, IconData icon) {
    final bool active = widget.currentRole == role;
    return Padding(
      padding: const EdgeInsets.only(right: 8.0),
      child: ChoiceChip(
        avatar: Icon(icon, size: 16, color: active ? Colors.white : Colors.grey),
        label: Text(label),
        selected: active,
        onSelected: (selected) {
          if (selected) widget.onRoleChanged(role);
        },
      ),
    );
  }

  Widget _buildSchoolAdminView() {
    return Column(
      children: [
        _buildStatCard('Collège Excellence Douala', 'Système Francophone (6e → Tle)', Icons.school, Colors.sky),
        const SizedBox(height: 12),
        _buildStatCard('480 Élèves Inscrits', '82% Taux de Recouvrement', Icons.people, Colors.emerald),
        const SizedBox(height: 12),
        ElevatedButton.icon(
          onPressed: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Bulletins de séquence générés avec succès !')),
            );
          },
          icon: const Icon(Icons.picture_as_pdf),
          label: Text(AppTranslations.get('report_card', widget.lang)),
          style: ElevatedButton.styleFrom(minimumSize: const Size.fromHeight(50)),
        ),
      ],
    );
  }

  Widget _buildAccountantView() {
    return Column(
      children: [
        _buildStatCard('32,400,000 FCFA Encaissés', 'Reste à recouvrer: 7,500,000 FCFA', Icons.account_balance, Colors.emerald),
        const SizedBox(height: 12),
        Card(
          child: ListTile(
            title: const Text('Junior Mballa (6ème A)', style: TextStyle(fontWeight: FontWeight.bold)),
            subtitle: const Text('Solde restant: 25,000 FCFA'),
            trailing: ElevatedButton(
              onPressed: () => _showPaymentDialog('Junior Mballa', 25000),
              child: const Text('Payer MoMo'),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildTeacherView() {
    return Column(
      children: [
        ElevatedButton.icon(
          onPressed: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Appel de la classe 6ème A enregistré !')),
            );
          },
          icon: const Icon(Icons.check_box),
          label: Text(AppTranslations.get('take_attendance', widget.lang)),
          style: ElevatedButton.styleFrom(minimumSize: const Size.fromHeight(50)),
        ),
        const SizedBox(height: 12),
        _buildStatCard('Mathématiques — 6ème A', 'Séquence 1 (Coef: 4.0)', Icons.edit_note, Colors.indigo),
      ],
    );
  }

  Widget _buildParentView() {
    return Column(
      children: [
        Card(
          elevation: 4,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.between,
                  children: [
                    const Text('Junior Mballa (6ème A)', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(color: Colors.emerald.shade900, borderRadius: BorderRadius.circular(12)),
                      child: const Text('Moy: 15.14/20', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                const Text('Frais de scolarité: 50,000 / 75,000 FCFA', style: TextStyle(fontSize: 13)),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () => _showPaymentDialog('Junior Mballa', 25000),
                    icon: const Icon(Icons.phone_android),
                    label: Text(AppTranslations.get('pay_momo', widget.lang)),
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.sky.shade700, foregroundColor: Colors.white),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildStudentView() {
    return Column(
      children: [
        _buildStatCard('Moyenne Séquence 1: 15.14 / 20', 'Rang: 2ème de la classe (6ème A)', Icons.emoji_events, Colors.amber),
        const SizedBox(height: 12),
        _buildStatCard('Présences: 100%', '0 absence non justifiée', Icons.verified_user, Colors.emerald),
      ],
    );
  }

  Widget _buildStatCard(String title, String subtitle, IconData icon, Color color) {
    return Card(
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: color.withOpacity(0.2),
          child: Icon(icon, color: color),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text(subtitle),
      ),
    );
  }

  void _showPaymentDialog(String studentName, int defaultAmount) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Paiement CinetPay ($studentName)'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Montant: ${defaultAmount.toString()} FCFA'),
            const SizedBox(height: 12),
            const Text('Modes acceptés: Orange Money, MTN MoMo, Carte Bancaire'),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Annuler')),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Paiement de $defaultAmount FCFA validé via CinetPay !')),
              );
            },
            child: const Text('Valider MoMo'),
          ),
        ],
      ),
    );
  }
}
