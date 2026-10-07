import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';

/// Six-digit code row, same behavior as the website OTP inputs.
class OtpRow extends StatefulWidget {
  final ValueChanged<String> onChanged;
  final bool disabled;

  const OtpRow({super.key, required this.onChanged, this.disabled = false});

  @override
  State<OtpRow> createState() => _OtpRowState();
}

class _OtpRowState extends State<OtpRow> {
  final _nodes = List.generate(6, (_) => FocusNode());
  final _boxes = List.generate(6, (_) => TextEditingController());

  @override
  void dispose() {
    for (final node in _nodes) {
      node.dispose();
    }
    for (final box in _boxes) {
      box.dispose();
    }
    super.dispose();
  }

  void _emit() {
    widget.onChanged(_boxes.map((box) => box.text).join());
  }

  void _fill(String raw) {
    final digits = raw.replaceAll(RegExp(r'\D'), '');
    for (var i = 0; i < 6; i++) {
      _boxes[i].text = i < digits.length ? digits[i] : '';
    }
    final next = digits.length >= 6 ? 5 : digits.length;
    if (next < 6) _nodes[next].requestFocus();
    _emit();
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        for (var i = 0; i < 6; i++) ...[
          if (i > 0) const SizedBox(width: 8),
          Expanded(
            child: TextField(
              controller: _boxes[i],
              focusNode: _nodes[i],
              enabled: !widget.disabled,
              textAlign: TextAlign.center,
              keyboardType: TextInputType.number,
              autofillHints: i == 0 ? const [AutofillHints.oneTimeCode] : null,
              style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800),
              inputFormatters: [FilteringTextInputFormatter.digitsOnly],
              decoration: InputDecoration(
                counterText: '',
                filled: true,
                fillColor: const Color(0xFF0E0E0E),
                contentPadding: const EdgeInsets.symmetric(vertical: 14),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.16)),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: BorderSide(color: AppColors.gold),
                ),
              ),
              onChanged: (value) {
                final digits = value.replaceAll(RegExp(r'\D'), '');
                if (digits.length > 1) {
                  _fill(digits);
                  return;
                }
                if (_boxes[i].text != digits) {
                  _boxes[i].value = TextEditingValue(
                    text: digits,
                    selection: TextSelection.collapsed(offset: digits.length),
                  );
                }
                if (digits.isNotEmpty && i < 5) _nodes[i + 1].requestFocus();
                if (digits.isEmpty && i > 0) _nodes[i - 1].requestFocus();
                _emit();
              },
            ),
          ),
        ],
      ],
    );
  }
}
