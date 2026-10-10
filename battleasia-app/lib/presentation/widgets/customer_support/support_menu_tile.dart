import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:battleasia_app/core/services/customer_support_service.dart';
import 'package:battleasia_app/core/services/socket_service.dart';
import 'package:battleasia_app/presentation/screens/customer_support/customer_support_screen.dart';
import 'package:battleasia_app/presentation/widgets/common/account_menu_tile.dart';

/// Account drawer link with live admin-reply badge (web AccountLayout parity).
class SupportMenuTile extends StatefulWidget {
  const SupportMenuTile({super.key, this.nested = false, this.labelKey = 'settings.chat'});

  final bool nested;
  final String labelKey;

  @override
  State<SupportMenuTile> createState() => _SupportMenuTileState();
}

class _SupportMenuTileState extends State<SupportMenuTile> {
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

  @override
  Widget build(BuildContext context) {
    return AccountMenuTile(
      label: widget.labelKey.tr(),
      nested: widget.nested,
      icon: Icons.chat_bubble_outline,
      badgeCount: _unread,
      onTap: () {
        Navigator.pop(context);
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => const CustomerSupportScreen()),
        ).then((_) => _refresh());
      },
    );
  }
}
