import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';

enum AuthAlertType { error, success, info }

class AuthAlert extends StatelessWidget {
  final String message;
  final AuthAlertType type;

  const AuthAlert({
    super.key,
    required this.message,
    this.type = AuthAlertType.error,
  });

  Color get _color {
    switch (type) {
      case AuthAlertType.success:
        return AppColors.success;
      case AuthAlertType.info:
        return AppColors.info;
      case AuthAlertType.error:
        return AppColors.error;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.black.withValues(alpha: 0.45),
        borderRadius: BorderRadius.circular(2),
        border: Border.all(color: _color.withValues(alpha: 0.45)),
      ),
      child: Text(
        message,
        style: AppTheme.bodyMedium.copyWith(color: AppColors.textPrimary),
      ),
    );
  }
}
