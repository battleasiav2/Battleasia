import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:battleasia_app/core/services/customer_support_service.dart';
import 'package:battleasia_app/core/services/socket_service.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/presentation/screens/customer_support/customer_support_screen.dart';

/// Header support chat with unread badge (drawer tile parity).
class SupportHeaderButton extends StatefulWidget {
  const SupportHeaderButton({super.key});

  @override
  State<SupportHeaderButton> createState() => _SupportHeaderButtonState();
}

class _SupportHeaderButtonState extends State<SupportHeaderButton> {
  final CustomerSupportService _service = CustomerSupportService();
  int _unread = 0;

  @override
  void initState() {
    super.initState();
    _refresh();
    SocketService.instance.onSupportPlayerUnread(_onUnread);
  }

  @override
  void dispose() {
    SocketService.instance.offSupportPlayerUnread(_onUnread);
    super.dispose();
  }

  void _onUnread(int count) {
    if (mounted) setState(() => _unread = count.clamp(0, 99));
  }

  Future<void> _refresh() async {
    final count = await _service.getPlayerUnreadCount();
    if (mounted) setState(() => _unread = count.clamp(0, 99));
  }

  Future<void> _open() async {
    await Navigator.push<void>(
      context,
      MaterialPageRoute(builder: (_) => const CustomerSupportScreen()),
    );
    await _refresh();
  }

  @override
  Widget build(BuildContext context) {
    final isMobile = MediaQuery.sizeOf(context).width < 600;
    return Stack(
      clipBehavior: Clip.none,
      children: [
        IconButton(
          tooltip: 'settings.chat'.tr(),
          visualDensity: isMobile ? VisualDensity.compact : VisualDensity.standard,
          padding: EdgeInsets.all(isMobile ? 8 : 10),
          constraints: BoxConstraints(
            minWidth: isMobile ? 42 : 48,
            minHeight: isMobile ? 42 : 48,
          ),
          onPressed: _open,
          icon: Icon(
            Icons.support_agent_outlined,
            color: Colors.white.withValues(alpha: 0.88),
            size: 24,
          ),
        ),
        if (_unread > 0)
          Positioned(
            right: isMobile ? 4 : 6,
            top: isMobile ? 4 : 6,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
              decoration: BoxDecoration(
                color: AppColors.error,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFF0B0C10), width: 1.5),
              ),
              child: Text(
                _unread > 99 ? '99+' : '$_unread',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 9,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ),
      ],
    );
  }
}
