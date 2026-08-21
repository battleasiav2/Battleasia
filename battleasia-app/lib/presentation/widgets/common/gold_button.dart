import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';

/// Gold outline CTA — dark fill, gold border, gold text. Used for Sign In / Join / Buy.
class GoldButton extends StatefulWidget {
  final String label;
  final VoidCallback? onPressed;
  final bool loading;
  final bool expanded;
  final IconData? icon;
  final bool uppercase;
  final double height;
  final double fontSize;

  const GoldButton({
    super.key,
    required this.label,
    this.onPressed,
    this.loading = false,
    this.expanded = true,
    this.icon,
    this.uppercase = true,
    this.height = 44,
    this.fontSize = 13,
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
    final gold = AppColors.gold;
    final goldLight = const Color(0xFFFBBF24);

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
            color: enabled
                ? (_pressed
                    ? const Color(0xFF121214).withValues(alpha: 0.88)
                    : const Color(0xFF0A0A0C).withValues(alpha: 0.72))
                : Colors.black.withValues(alpha: 0.4),
            border: Border.all(
              color: enabled
                  ? (_pressed ? goldLight : gold)
                  : gold.withValues(alpha: 0.22),
              width: 1.5,
            ),
            boxShadow: enabled
                ? [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.4),
                      blurRadius: 18,
                      offset: const Offset(0, 6),
                    ),
                    if (_pressed)
                      BoxShadow(
                        color: gold.withValues(alpha: 0.16),
                        blurRadius: 16,
                      ),
                  ]
                : null,
          ),
          child: Center(
            child: widget.loading
                ? SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: gold,
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
                              ? (_pressed ? goldLight : gold)
                              : gold.withValues(alpha: 0.35),
                        ),
                        const SizedBox(width: 8),
                      ],
                      Text(
                        text,
                        style: TextStyle(
                          color: enabled
                              ? (_pressed ? goldLight : gold)
                              : gold.withValues(alpha: 0.35),
                          fontWeight: FontWeight.w800,
                          fontSize: widget.fontSize,
                          letterSpacing: 1.1,
                          fontFamily: 'Poppins',
                        ),
                      ),
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
