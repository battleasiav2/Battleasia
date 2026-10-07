import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/presentation/screens/feed/hashtag_screen.dart';

/// Post text with tappable #tags, matching the website caption links.
class CaptionText extends StatefulWidget {
  final String text;
  final TextStyle? style;
  final int? maxLines;

  const CaptionText({
    super.key,
    required this.text,
    this.style,
    this.maxLines,
  });

  @override
  State<CaptionText> createState() => _CaptionTextState();
}

class _CaptionTextState extends State<CaptionText> {
  final List<TapGestureRecognizer> _taps = [];
  static final _token = RegExp(r'(#[\w\u0980-\u09FF]+|@[\w.]+)');

  @override
  void dispose() {
    for (final tap in _taps) {
      tap.dispose();
    }
    super.dispose();
  }

  String _plain(String raw) {
    return raw
        .replaceAll(RegExp(r'<br\s*/?>', caseSensitive: false), '\n')
        .replaceAll(RegExp(r'</p>', caseSensitive: false), '\n')
        .replaceAll(RegExp(r'<[^>]+>'), '')
        .replaceAll('&nbsp;', ' ')
        .replaceAll('&amp;', '&')
        .replaceAll('&lt;', '<')
        .replaceAll('&gt;', '>')
        .replaceAll(RegExp(r'\n{3,}'), '\n\n')
        .trim();
  }

  @override
  Widget build(BuildContext context) {
    for (final tap in _taps) {
      tap.dispose();
    }
    _taps.clear();

    final clean = _plain(widget.text);
    if (clean.isEmpty) return const SizedBox.shrink();

    final base = widget.style ?? const TextStyle(color: Colors.white);
    final parts = clean.split(_token);
    return Text.rich(
      TextSpan(
        style: base,
        children: [
          for (final part in parts)
            if (part.startsWith('#'))
              TextSpan(
                text: part,
                style: base.copyWith(color: AppColors.gold, fontWeight: FontWeight.w700),
                recognizer: _fresh
                  ..onTap = () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => HashtagScreen(tag: part.substring(1))),
                    );
                  },
              )
            else if (part.startsWith('@'))
              TextSpan(
                text: part,
                style: base.copyWith(color: AppColors.gold, fontWeight: FontWeight.w700),
              )
            else
              TextSpan(text: part),
        ],
      ),
      maxLines: widget.maxLines,
      overflow: widget.maxLines == null ? TextOverflow.clip : TextOverflow.ellipsis,
    );
  }

  TapGestureRecognizer get _fresh {
    final tap = TapGestureRecognizer();
    _taps.add(tap);
    return tap;
  }
}
