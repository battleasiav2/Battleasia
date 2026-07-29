import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';

/// Full-screen semi-transparent overlay displayed while a pull-to-refresh
/// operation is in progress.  Place this as the *last* child inside a [Stack]
/// so that it renders on top of all other content.
class RefreshOverlay extends StatelessWidget {
  const RefreshOverlay({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.black.withOpacity(0.35),
      child: Center(
        child: Container(
          width: 80,
          height: 80,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.15),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: const Center(
            child: CircularProgressIndicator(
              color: AppTheme.primaryColor,
              strokeWidth: 3.0,
            ),
          ),
        ),
      ),
    );
  }
}
