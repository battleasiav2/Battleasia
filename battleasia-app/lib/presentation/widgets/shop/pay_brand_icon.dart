import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';

/// bKash, Nagad, or USDT mark. `null` when the channel name is something else.
String? payKindOf(String name) {
  final n = name.toLowerCase();
  if (n.contains('bkash') || n.contains('b-kash')) return 'bkash';
  if (n.contains('nagad')) return 'nagad';
  if (n.contains('crypto') || n.contains('usdt') || n.contains('tether')) {
    return 'crypto';
  }
  return null;
}

class PayBrandIcon extends StatelessWidget {
  final String kind;
  final double size;

  const PayBrandIcon({super.key, required this.kind, this.size = 52});

  String get _asset {
    switch (kind) {
      case 'bkash':
        return 'assets/images/pay-bkash.png';
      case 'nagad':
        return 'assets/images/pay-nagad.png';
      default:
        return 'assets/images/pay-usdt.png';
    }
  }

  @override
  Widget build(BuildContext context) {
    final radius = kind == 'crypto' ? size / 2 : size * 0.26;
    return ClipRRect(
      borderRadius: BorderRadius.circular(radius),
      child: Image.asset(
        _asset,
        width: size,
        height: size,
        fit: BoxFit.cover,
        filterQuality: FilterQuality.high,
      ),
    );
  }
}

class PayBrandTile extends StatelessWidget {
  final String kind;
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const PayBrandTile({
    super.key,
    required this.kind,
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.surfaceElevated,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          constraints: const BoxConstraints(minHeight: 76, minWidth: 78),
          padding: const EdgeInsets.fromLTRB(6, 8, 6, 6),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: selected ? AppColors.gold : Colors.white.withValues(alpha: 0.08),
              width: selected ? 1.5 : 1,
            ),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              PayBrandIcon(kind: kind, size: 36),
              const SizedBox(height: 6),
              Text(
                label,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: Color(0xFFF4F4F1),
                  fontWeight: FontWeight.w700,
                  fontSize: 13,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
