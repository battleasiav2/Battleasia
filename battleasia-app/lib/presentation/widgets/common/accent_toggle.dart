import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:provider/provider.dart';
import 'package:battleasia_app/core/providers/accent_provider.dart';
import 'package:battleasia_app/core/theme/accent_palette.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';

class AccentToggle extends StatelessWidget {
  const AccentToggle({super.key});

  @override
  Widget build(BuildContext context) {
    final current = context.watch<AccentProvider>();

    return PopupMenuButton<AccentId>(
      tooltip: 'nav.siteColor'.tr(),
      onSelected: (id) => context.read<AccentProvider>().setAccent(id),
      offset: const Offset(0, 36),
      color: AppColors.surfaceElevated,
      itemBuilder: (context) => AccentId.values
          .map(
            (id) {
              final palette = accentPalettes[id]!;
              final selected = current.id == id;
              return PopupMenuItem<AccentId>(
                value: id,
                child: Row(
                  children: [
                    Container(
                      width: 16,
                      height: 16,
                      decoration: BoxDecoration(
                        color: palette.gold,
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: selected ? Colors.white : Colors.white24,
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Text(
                      palette.label,
                      style: AppTheme.bodySmall.copyWith(
                        color: selected ? palette.gold : AppColors.textPrimary,
                        fontWeight: selected ? FontWeight.w800 : FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              );
            },
          )
          .toList(),
      child: Container(
        width: 32,
        height: 32,
        alignment: Alignment.center,
        child: Container(
          width: 14,
          height: 14,
          decoration: BoxDecoration(
            color: AppColors.gold,
            shape: BoxShape.circle,
          ),
        ),
      ),
    );
  }
}
