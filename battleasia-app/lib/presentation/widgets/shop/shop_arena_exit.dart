import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/presentation/screens/play/play_screen.dart';

/// Quick return to the main arena (Play) from the shop silo.
class ShopArenaExit extends StatelessWidget {
  const ShopArenaExit({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 0, 12, 4),
      child: Align(
        alignment: Alignment.centerLeft,
        child: TextButton.icon(
          onPressed: () {
            Navigator.of(context).pushAndRemoveUntil(
              MaterialPageRoute(
                builder: (_) => const PlayScreen(),
                settings: const RouteSettings(name: '/play'),
              ),
              (_) => false,
            );
          },
          icon: Icon(
            Icons.sports_esports_outlined,
            size: 18,
            color: AppColors.gold.withValues(alpha: 0.9),
          ),
          label: Text(
            'shop.backToArena'.tr(),
            style: TextStyle(
              color: AppColors.gold.withValues(alpha: 0.95),
              fontWeight: FontWeight.w700,
              fontSize: 13,
            ),
          ),
        ),
      ),
    );
  }
}
