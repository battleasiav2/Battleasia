import 'package:flutter/material.dart';

/// Dark PUBG-style arena image behind screens — not a flat black fill.
class GamingBackdrop extends StatelessWidget {
  const GamingBackdrop({super.key});

  static const String _primary = 'assets/images/gs-bg.webp';
  static const String _fallback = 'assets/images/war2.webp';

  @override
  Widget build(BuildContext context) {
    return const Positioned.fill(
      child: IgnorePointer(
        child: Stack(
          fit: StackFit.expand,
          children: [
            ColoredBox(color: Color(0xFF050506)),
            _GamingPhoto(src: _primary, fallback: _fallback),
            ColoredBox(color: Color(0xB3050508)),
            DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Color(0x66000000),
                    Color(0x33000000),
                    Color(0x99000000),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _GamingPhoto extends StatelessWidget {
  const _GamingPhoto({required this.src, required this.fallback});

  final String src;
  final String fallback;

  @override
  Widget build(BuildContext context) {
    return Image.asset(
      src,
      fit: BoxFit.cover,
      alignment: const Alignment(0, -0.15),
      filterQuality: FilterQuality.low,
      errorBuilder: (_, __, ___) => Image.asset(
        fallback,
        fit: BoxFit.cover,
        alignment: Alignment.center,
        filterQuality: FilterQuality.low,
        errorBuilder: (_, __, ___) => const SizedBox.shrink(),
      ),
    );
  }
}
