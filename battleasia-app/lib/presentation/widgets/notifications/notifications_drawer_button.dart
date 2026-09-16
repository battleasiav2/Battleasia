import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:battleasia_app/core/services/user_service.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/data/models/notification_model.dart';
import 'package:battleasia_app/presentation/screens/notifications/notifications_screen.dart';
import 'package:battleasia_app/presentation/widgets/notifications/notification_item.dart';

/// Header bell that opens a dark notifications sheet (web drawer parity).
class NotificationsDrawerButton extends StatefulWidget {
  const NotificationsDrawerButton({super.key});

  @override
  State<NotificationsDrawerButton> createState() =>
      _NotificationsDrawerButtonState();
}

class _NotificationsDrawerButtonState extends State<NotificationsDrawerButton> {
  final UserService _userService = UserService();
  int _unreadCount = 0;

  @override
  void initState() {
    super.initState();
    _prefetchUnread();
  }

  Future<void> _prefetchUnread() async {
    try {
      final result = await _userService.getNotifications();
      if (!mounted || result['success'] != true || result['data'] == null) {
        return;
      }
      final data = result['data'] as Map<String, dynamic>;
      final payload = data['results'] ?? data;
      final items =
          payload is List ? payload : (payload['results'] as List? ?? []);
      final list = items
          .map((item) =>
              NotificationModel.fromJson(item as Map<String, dynamic>))
          .toList();
      final unread =
          data['unread'] as int? ?? list.where((n) => n.isUnRead).length;
      setState(() => _unreadCount = unread);
    } catch (_) {}
  }

  Future<void> _openSheet() async {
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _NotificationsSheet(
        onUnreadChanged: (count) {
          if (mounted) setState(() => _unreadCount = count);
        },
      ),
    );
    _prefetchUnread();
  }

  @override
  Widget build(BuildContext context) {
    return IconButton(
      tooltip: 'account.notifications'.tr(),
      onPressed: _openSheet,
      icon: Badge(
        isLabelVisible: _unreadCount > 0,
        label: Text(
          _unreadCount > 99 ? '99+' : '$_unreadCount',
          style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800),
        ),
        backgroundColor: AppColors.gold,
        textColor: Colors.black,
        child: Icon(
          Icons.notifications_outlined,
          color: Colors.white.withValues(alpha: 0.88),
          size: 24,
        ),
      ),
    );
  }
}

class _NotificationsSheet extends StatefulWidget {
  final ValueChanged<int> onUnreadChanged;

  const _NotificationsSheet({required this.onUnreadChanged});

  @override
  State<_NotificationsSheet> createState() => _NotificationsSheetState();
}

class _NotificationsSheetState extends State<_NotificationsSheet> {
  final UserService _userService = UserService();
  List<NotificationModel> _notifications = [];
  bool _loading = true;
  int _unreadCount = 0;

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  Future<void> _fetch() async {
    setState(() => _loading = true);
    try {
      final result = await _userService.getNotifications();
      if (result['success'] == true && result['data'] != null) {
        final data = result['data'] as Map<String, dynamic>;
        final payload = data['results'] ?? data;
        final items =
            payload is List ? payload : (payload['results'] as List? ?? []);
        final list = items
            .map((item) =>
                NotificationModel.fromJson(item as Map<String, dynamic>))
            .toList();
        final unread =
            data['unread'] as int? ?? list.where((n) => n.isUnRead).length;
        setState(() {
          _notifications = list;
          _unreadCount = unread;
          _loading = false;
        });
        widget.onUnreadChanged(unread);
      } else {
        setState(() {
          _notifications = [];
          _unreadCount = 0;
          _loading = false;
        });
        widget.onUnreadChanged(0);
      }
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _notifications = [];
        _unreadCount = 0;
        _loading = false;
      });
    }
  }

  Future<void> _markAllRead() async {
    if (_unreadCount == 0) return;
    setState(() {
      _notifications = _notifications
          .map(
            (n) => NotificationModel(
              id: n.id,
              type: n.type,
              title: n.title,
              subject: n.subject,
              category: n.category,
              isUnRead: false,
              avatarUrl: n.avatarUrl,
              createdAt: n.createdAt,
            ),
          )
          .toList();
      _unreadCount = 0;
    });
    widget.onUnreadChanged(0);
    try {
      await _userService.markAllNotificationsRead();
    } catch (_) {
      _fetch();
    }
  }

  Future<void> _markRead(String id) async {
    final index = _notifications.indexWhere((n) => n.id == id);
    if (index < 0 || !_notifications[index].isUnRead) return;
    final n = _notifications[index];

    setState(() {
      _notifications = List.from(_notifications)
        ..[index] = NotificationModel(
          id: n.id,
          type: n.type,
          title: n.title,
          subject: n.subject,
          category: n.category,
          isUnRead: false,
          avatarUrl: n.avatarUrl,
          createdAt: n.createdAt,
        );
      _unreadCount = (_unreadCount - 1).clamp(0, 9999);
    });
    widget.onUnreadChanged(_unreadCount);
    try {
      await _userService.markNotificationRead(id);
    } catch (_) {
      _fetch();
    }
  }

  void _viewAll() {
    Navigator.pop(context);
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const NotificationsScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    final height = MediaQuery.sizeOf(context).height * 0.72;
    final bottom = MediaQuery.paddingOf(context).bottom;

    return Container(
      height: height,
      decoration: BoxDecoration(
        color: const Color(0xFF060607),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
        border: Border.all(color: Colors.white.withValues(alpha: 0.09)),
      ),
      child: Column(
        children: [
          Container(
            height: 3,
            margin: const EdgeInsets.fromLTRB(24, 0, 24, 0),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(2),
              gradient: LinearGradient(
                colors: [
                  Colors.transparent,
                  AppColors.gold.withValues(alpha: 0.95),
                  Colors.transparent,
                ],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 8, 8),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    'account.notifications'.tr(),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
                if (_unreadCount > 0)
                  IconButton(
                    tooltip: 'Mark all read',
                    onPressed: _markAllRead,
                    icon: Icon(Icons.done_all, color: AppColors.gold),
                  ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: Icon(
                    Icons.close,
                    color: Colors.white.withValues(alpha: 0.7),
                  ),
                ),
              ],
            ),
          ),
          Divider(height: 1, color: Colors.white.withValues(alpha: 0.08)),
          Expanded(
            child: _loading
                ? Center(
                    child: CircularProgressIndicator(
                      strokeWidth: 2.5,
                      color: AppColors.gold,
                    ),
                  )
                : _notifications.isEmpty
                    ? Center(
                        child: Text(
                          'No notifications',
                          style: TextStyle(
                            color: Colors.white.withValues(alpha: 0.5),
                          ),
                        ),
                      )
                    : ListView.builder(
                        itemCount: _notifications.length.clamp(0, 20),
                        itemBuilder: (context, index) {
                          final n = _notifications[index];
                          return NotificationItem(
                            notification: n,
                            isLast: index ==
                                _notifications.length.clamp(0, 20) - 1,
                            onMarkRead: () => _markRead(n.id),
                          );
                        },
                      ),
          ),
          Padding(
            padding: EdgeInsets.fromLTRB(16, 8, 16, 12 + bottom),
            child: SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: _viewAll,
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.gold,
                  side: BorderSide(
                    color: AppColors.gold.withValues(alpha: 0.45),
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
                child: const Text(
                  'View all',
                  style: TextStyle(fontWeight: FontWeight.w800),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
