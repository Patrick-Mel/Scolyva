import 'package:flutter/material.dart';
import '../l10n/app_translations.dart';

class ReadonlyBannerWidget extends StatelessWidget {
  final bool isReadOnly;
  final int daysRemaining;
  final String lang;
  final VoidCallback onUpgradePressed;

  const ReadonlyBannerWidget({
    Key? key,
    required this.isReadOnly,
    required this.daysRemaining,
    required this.lang,
    required this.onUpgradePressed,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: isReadOnly
              ? [Colors.amber.shade800, Colors.red.shade800]
              : [Colors.sky.shade700, Colors.indigo.shade800],
        ),
      ),
      child: SafeArea(
        bottom: false,
        child: Row(
          children: [
            Icon(
              isReadOnly ? Icons.warning_amber_rounded : Icons.star_rounded,
              color: Colors.white,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                isReadOnly
                    ? AppTranslations.get('readonly_banner', lang)
                    : AppTranslations.get('trial_banner', lang, params: {'days': daysRemaining.toString()}),
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                ),
              ),
            ),
            ElevatedButton(
              onPressed: onUpgradePressed,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: Colors.black87,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              ),
              child: Text(
                AppTranslations.get('upgrade_now', lang),
                style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
