import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';

/// Solid gold primary CTA — filled, square. Used for Sign In / Join / Buy.
class GoldButton extends StatefulWidget {
  final String label;
  final VoidCallback? onPressed;
  final bool loading;
  final bool expanded;
  final IconData? icon;
  final IconData? trailingIcon;
  final bool uppercase;
  final double height;
  final double fontSize;
  final double borderRadius;
  final bool glow;

  const GoldButton({
    super.key,
    required this.label,
    this.onPressed,
    this.loading = false,
    this.expanded = true,
    this.icon,
    this.trailingIcon,
    this.uppercase = true,
    this.height = 44,
    this.fontSize = 13,
    this.borderRadius = 0,
    this.glow = true,
  });

  @override
  State<GoldButton> createState() => _GoldButtonState();
}

class _GoldButtonState extends State<GoldButton> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final enabled = widget.onPressed != null && !widget.loading;
    final text = widget.uppercase ? widget.label.toUpperCase() : widget.label;

    final button = Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: widget.loading ? null : widget.onPressed,
        onHighlightChanged: enabled
            ? (value) => setState(() => _pressed = value)
            : null,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          height: widget.height,
          padding: const EdgeInsets.symmetric(horizontal: 16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(widget.borderRadius),
            color: enabled
                ? (_pressed ? AppColors.goldDark : AppColors.gold)
                : AppColors.gold.withValues(alpha: 0.28),
            border: Border.all(
              color: enabled
                  ? (_pressed ? AppColors.goldDark : AppColors.gold)
                  : AppColors.gold.withValues(alpha: 0.22),
            ),
            boxShadow: enabled && widget.glow
                ? [
                    BoxShadow(
                      color: AppColors.gold.withValues(alpha: 0.28),
                      blurRadius: 18,
                    ),
                  ]
                : null,
          ),
          child: Center(
            child: widget.loading
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Color(0xFF111111),
                    ),
                  )
                : Row(
                    mainAxisSize: MainAxisSize.min,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      if (widget.icon != null) ...[
                        Icon(
                          widget.icon,
                          size: 16,
                          color: enabled
                              ? const Color(0xFF111111)
                              : const Color(0xFF111111).withValues(alpha: 0.45),
                        ),
                        const SizedBox(width: 8),
                      ],
                      Text(
                        text,
                        style: TextStyle(
                          color: enabled
                              ? const Color(0xFF111111)
                              : const Color(0xFF111111).withValues(alpha: 0.45),
                          fontWeight: FontWeight.w700,
                          fontSize: widget.fontSize,
                          letterSpacing: widget.uppercase ? 1.1 : 0,
                          fontFamily: 'Poppins',
                        ),
                      ),
                      if (widget.trailingIcon != null) ...[
                        const SizedBox(width: 8),
                        Icon(
                          widget.trailingIcon,
                          size: 16,
                          color: enabled
                              ? const Color(0xFF111111)
                              : const Color(0xFF111111).withValues(alpha: 0.45),
                        ),
                      ],
                    ],
                  ),
          ),
        ),
      ),
    );

    if (widget.expanded) {
      return SizedBox(width: double.infinity, child: button);
    }
    return button;
  }
}
