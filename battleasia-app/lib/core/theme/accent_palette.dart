import 'package:flutter/material.dart';

enum AccentId { gold, ember, jade, cyan, violet, rose, sky }

class AccentPalette {
  const AccentPalette({
    required this.id,
    required this.label,
    required this.gold,
    required this.goldLight,
    required this.goldDark,
    required this.ink,
  });

  final AccentId id;
  final String label;
  final Color gold;
  final Color goldLight;
  final Color goldDark;
  final Color ink;

  LinearGradient get gradient => LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [goldLight, gold, goldDark],
      );
}

const accentPalettes = <AccentId, AccentPalette>{
  AccentId.gold: AccentPalette(
    id: AccentId.gold,
    label: 'Gold',
    gold: Color(0xFFF5C518),
    goldLight: Color(0xFFFBBF24),
    goldDark: Color(0xFFD97706),
    ink: Color(0xFF111111),
  ),
  AccentId.ember: AccentPalette(
    id: AccentId.ember,
    label: 'Ember',
    gold: Color(0xFFFF8A1A),
    goldLight: Color(0xFFFFB347),
    goldDark: Color(0xFFE05D00),
    ink: Color(0xFF111111),
  ),
  AccentId.jade: AccentPalette(
    id: AccentId.jade,
    label: 'Jade',
    gold: Color(0xFF34D399),
    goldLight: Color(0xFF6EE7B7),
    goldDark: Color(0xFF059669),
    ink: Color(0xFF042F1E),
  ),
  AccentId.cyan: AccentPalette(
    id: AccentId.cyan,
    label: 'Cyan',
    gold: Color(0xFF22D3EE),
    goldLight: Color(0xFF67E8F9),
    goldDark: Color(0xFF0891B2),
    ink: Color(0xFF082F38),
  ),
  AccentId.violet: AccentPalette(
    id: AccentId.violet,
    label: 'Violet',
    gold: Color(0xFFA78BFA),
    goldLight: Color(0xFFC4B5FD),
    goldDark: Color(0xFF7C3AED),
    ink: Color(0xFF1E1038),
  ),
  AccentId.rose: AccentPalette(
    id: AccentId.rose,
    label: 'Rose',
    gold: Color(0xFFFB7185),
    goldLight: Color(0xFFFDA4AF),
    goldDark: Color(0xFFE11D48),
    ink: Color(0xFF3F0A14),
  ),
  AccentId.sky: AccentPalette(
    id: AccentId.sky,
    label: 'Sky',
    gold: Color(0xFF38BDF8),
    goldLight: Color(0xFF7DD3FC),
    goldDark: Color(0xFF0284C7),
    ink: Color(0xFF0B2838),
  ),
};
