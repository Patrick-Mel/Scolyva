class AppTranslations {
  static const Map<String, Map<String, String>> values = {
    'fr': {
      'app_name': 'Scolyva Mobile',
      'tagline': 'L\'école sait toujours qui doit quoi. Le parent sait toujours ce qu\'il doit payer.',
      'trial_banner': 'Période d\'essai gratuite active : {days} jours restants.',
      'readonly_banner': '⚠️ Établissement en mode LECTURE SEULE. Abonnement requis.',
      'upgrade_now': 'Souscrire via Mobile Money',
      'role_admin': 'Admin École',
      'role_accountant': 'Comptable',
      'role_teacher': 'Enseignant',
      'role_parent': 'Parent',
      'role_student': 'Élève',
      'pay_momo': 'Payer via Orange / MTN MoMo',
      'my_children': 'Mes Enfants',
      'report_card': 'Bulletin de Séquence',
      'take_attendance': 'Faire l\'Appel',
      'enter_grades': 'Saisir les Notes',
    },
    'en': {
      'app_name': 'Scolyva Mobile',
      'tagline': 'The school always knows who owes what. The parent always knows what to pay.',
      'trial_banner': 'Free trial active: {days} days remaining.',
      'readonly_banner': '⚠️ School in READ-ONLY mode. Subscription required.',
      'upgrade_now': 'Subscribe via Mobile Money',
      'role_admin': 'School Admin',
      'role_accountant': 'Bursar',
      'role_teacher': 'Teacher',
      'role_parent': 'Parent',
      'role_student': 'Student',
      'pay_momo': 'Pay via Orange / MTN MoMo',
      'my_children': 'My Children',
      'report_card': 'Sequence Report Card',
      'take_attendance': 'Take Attendance',
      'enter_grades': 'Enter Grades',
    }
  };

  static String get(String key, String lang, {Map<String, String>? params}) {
    String text = values[lang]?[key] ?? values['fr']![key] ?? key;
    if (params != null) {
      params.forEach((k, v) {
        text = text.replaceAll('{$k}', v);
      });
    }
    return text;
  }
}
