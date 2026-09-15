import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:battleasia_app/core/services/socket_service.dart';
import 'package:battleasia_app/core/services/user_service.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_scroll_behavior.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/data/models/notification_model.dart';
import 'package:battleasia_app/presentation/widgets/common/app_header.dart';
import 'package:battleasia_app/presentation/widgets/common/bottom_menu.dart';
import 'package:battleasia_app/presentation/widgets/notifications/notification_item.dart';
import 'package:battleasia_app/presentation/widgets/play/play_tabs.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final ScrollController _scrollController = ScrollController();
  final UserService _userService = UserService();

  List<NotificationModel> _notifications = [];
  bool _loading = true;
  String _currentTab = 'all';
  int _unreadCount = 0;

  static const Color _panelBg = Color(0xD906090E);

  @override
  void initState() {
    super.initState();
    _fetchNotifications();
    SocketService.instance.onNewNotification(_onNewNotification);
  }

  @override
  void dispose() {
    SocketService.instance.offNewNotification(_onNewNotification);
    _scrollController.dispose();
    super.dispose();
  }

  void _onNewNotification(Map<String, dynamic> data) {
    if (!mounted) return;
    try {
      final merged = Map<String, dynamic>.from(data);
      merged.putIfAbsent('isUnRead', () => true);
      final notification = NotificationModel.fromJson(merged);
      setState(() {
        _notifications.insert(0, notification);
        _unreadCount++;
      });
    } catch (_) {}
  }

  Future<void> _fetchNotifications({bool silent = false}) async {
    if (!silent) {
      setState(() {
        _loading = true;
      });
    }

    try {
      final result = await _userService.getNotifications();
      if (result['success'] == true && result['data'] != null) {
        final data = result['data'] as Map<String, dynamic>;
        final payload = data['results'] ?? data;
        final items =
            payload is List ? payload : (payload['results'] as List? ?? []);

        final notificationsList = items
            .map((item) =>
                NotificationModel.fromJson(item as Map<String, dynamic>))
            .toList();

        final unread = data['unread'] as int? ??
            notificationsList.where((n) => n.isUnRead).length;

        setState(() {
          _notifications = notificationsList;
          _unreadCount = unread;
        });
      } else {
        setState(() {
          _notifications = [];
          _unreadCount = 0;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to load notifications: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
      setState(() {
        _notifications = [];
        _unreadCount = 0;
      });
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  Future<void> _handleMarkAllAsRead() async {
    if (_unreadCount == 0) return;

    setState(() {
      _notifications = _notifications.map((n) {
        return NotificationModel(
          id: n.id,
          type: n.type,
          title: n.title,
          subject: n.subject,
          category: n.category,
          isUnRead: false,
          avatarUrl: n.avatarUrl,
          createdAt: n.createdAt,
        );
      }).toList();
      _unreadCount = 0;
    });

    try {
      await _userService.markAllNotificationsRead();
    } catch (e) {
      _fetchNotifications();
    }
  }

  Future<void> _handleMarkNotificationRead(String notificationId) async {
    final notification = _notifications.firstWhere(
      (n) => n.id == notificationId,
      orElse: () => _notifications.first,
    );

    if (!notification.isUnRead) return;

    setState(() {
      _notifications = _notifications.map((n) {
        if (n.id == notificationId) {
          return NotificationModel(
            id: n.id,
            type: n.type,
            title: n.title,
            subject: n.subject,
            category: n.category,
            isUnRead: false,
            avatarUrl: n.avatarUrl,
            createdAt: n.createdAt,
          );
        }
        return n;
      }).toList();
      _unreadCount = (_unreadCount - 1).clamp(0, double.infinity).toInt();
    });

    try {
      await _userService.markNotificationRead(notificationId);
    } catch (e) {
      _fetchNotifications();
    }
  }

  List<NotificationModel> get _filteredNotifications {
    switch (_currentTab) {
      case 'unread':
        return _notifications.where((n) => n.isUnRead).toList();
      case 'archived':
        return _notifications.where((n) => !n.isUnRead).toList();
      default:
        return _notifications;
    }
  }

  int get _archivedCount => _notifications.length - _unreadCount;

  BoxDecoration get _panelDecoration => BoxDecoration(
        color: _panelBg,
        border: Border(
          top: BorderSide(color: AppColors.gold, width: 2),
          left: BorderSide(color: AppColors.gold.withValues(alpha: 0.28)),
          right: BorderSide(color: AppColors.gold.withValues(alpha: 0.28)),
          bottom: BorderSide(color: AppColors.gold.withValues(alpha: 0.28)),
        ),
      );

  Future<void> _onRefresh() async {
    await _fetchNotifications(silent: true);
  }

  @override
  Widget build(BuildContext context) {
    final isMobile = ResponsiveUtils.isMobile(context);
    final horizontalPadding = isMobile ? 16.0 : 24.0;
    final bottomPadding = 80.0 + MediaQuery.of(context).padding.bottom;
    final spacing16 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 20.0);
    final spacing24 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 24.0,
    ).clamp(16.0, 24.0);
    final titleFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 22.0,
      min: 20.0,
      max: 26.0,
    );
    final tabFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 14.0,
      min: 12.0,
      max: 16.0,
    );

    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      body: Stack(
        fit: StackFit.expand,
        children: [
          CustomScrollView(
            controller: _scrollController,
            physics: appScrollPhysics,
            slivers: [
              CupertinoSliverRefreshControl(onRefresh: _onRefresh),
              const SliverToBoxAdapter(child: SizedBox(height: 100)),
              SliverToBoxAdapter(
                child: Padding(
                  padding:
                      EdgeInsets.symmetric(horizontal: horizontalPadding),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SizedBox(height: spacing16),
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              'NOTIFICATIONS',
                              style: AppTheme.heading2.copyWith(
                                color: AppColors.textPrimary,
                                fontWeight: FontWeight.w800,
                                fontSize: titleFontSize,
                                letterSpacing: 1,
                              ),
                            ),
                          ),
                          if (_unreadCount > 0)
                            TextButton(
                              onPressed: _handleMarkAllAsRead,
                              style: TextButton.styleFrom(
                                foregroundColor: AppColors.gold,
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 10,
                                  vertical: 6,
                                ),
                              ),
                              child: Text(
                                'Mark all read',
                                style: TextStyle(
                                  color: AppColors.gold,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                        ],
                      ),
                      SizedBox(height: spacing24),
                      if (_loading)
                        Center(
                          child: Padding(
                            padding: const EdgeInsets.all(32),
                            child: CircularProgressIndicator(
                              color: AppColors.gold,
                            ),
                          ),
                        )
                      else ...[
                        _buildStatsPanel(),
                        SizedBox(height: spacing24),
                        PlayTabs(
                          tabs: [
                            {
                              'label': 'ALL (${_notifications.length})',
                              'value': 'all',
                            },
                            {
                              'label': 'UNREAD ($_unreadCount)',
                              'value': 'unread',
                            },
                            {
                              'label': 'ARCHIVED ($_archivedCount)',
                              'value': 'archived',
                            },
                          ],
                          activeTab: _currentTab,
                          onTabChanged: (tab) {
                            setState(() => _currentTab = tab);
                          },
                          fontSize: tabFontSize,
                        ),
                        SizedBox(height: spacing16),
                        if (_filteredNotifications.isEmpty)
                          _buildEmptyState()
                        else
                          _buildListPanel(),
                      ],
                    ],
                  ),
                ),
              ),
              SliverToBoxAdapter(child: SizedBox(height: bottomPadding)),
            ],
          ),
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: AppHeader(scrollController: _scrollController),
          ),
          const FloatingBottomNav(),
        ],
      ),
    );
  }

  Widget _buildStatsPanel() {
    final cells = [
      ('All', '${_notifications.length}'),
      ('Unread', '$_unreadCount'),
      ('Archived', '$_archivedCount'),
    ];

    return Container(
      decoration: _panelDecoration,
      child: IntrinsicHeight(
        child: Row(
          children: List.generate(cells.length, (i) {
            final cell = cells[i];
            return Expanded(
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                decoration: BoxDecoration(
                  border: Border(
                    right: BorderSide(
                      color: Colors.white
                          .withValues(alpha: i < cells.length - 1 ? 0.08 : 0),
                    ),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      cell.$1.toUpperCase(),
                      style: AppTheme.bodySmall.copyWith(
                        color: Colors.white.withValues(alpha: 0.45),
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.6,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      cell.$2,
                      style: AppTheme.heading3.copyWith(
                        color: AppColors.textPrimary,
                        fontWeight: FontWeight.w700,
                        fontSize: 18,
                      ),
                    ),
                  ],
                ),
              ),
            );
          }),
        ),
      ),
    );
  }

  Widget _buildListPanel() {
    final items = _filteredNotifications;
    return Container(
      decoration: _panelDecoration,
      child: Column(
        children: List.generate(items.length, (index) {
          final notification = items[index];
          return NotificationItem(
            notification: notification,
            isLast: index == items.length - 1,
            onMarkRead: () => _handleMarkNotificationRead(notification.id),
          );
        }),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          children: [
            Icon(
              Icons.notifications_none,
              size: 56,
              color: AppColors.textMuted.withValues(alpha: 0.5),
            ),
            const SizedBox(height: 16),
            Text(
              'No notifications found',
              style: AppTheme.heading3.copyWith(color: AppColors.textMuted),
            ),
          ],
        ),
      ),
    );
  }
}
