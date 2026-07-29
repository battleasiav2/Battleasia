import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:battleasia_app/core/services/socket_service.dart';
import 'package:battleasia_app/core/services/user_service.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/data/models/notification_model.dart';
import 'package:battleasia_app/presentation/widgets/common/app_header.dart';
import 'package:battleasia_app/presentation/widgets/common/bottom_menu.dart';
import 'package:battleasia_app/presentation/widgets/common/refresh_overlay.dart';
import 'package:battleasia_app/presentation/widgets/notifications/notification_item.dart';

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
  bool _isRefreshing = false;
  double _overscrollAccumulator = 0.0;
  double _dragStartY = 0.0;
  bool _dragStartedAtTop = false;
  bool _dragStartedAtBottom = false;
  double _wheelAccumulator = 0.0;

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

  /// Called when the backend pushes a `new-notification` socket event.
  /// Prepends the notification to the list so users see it immediately.
  void _onNewNotification(Map<String, dynamic> data) {
    if (!mounted) return;
    try {
      // Ensure the isUnRead flag is set for freshly pushed notifications.
      final merged = Map<String, dynamic>.from(data);
      merged.putIfAbsent('isUnRead', () => true);
      final notification = NotificationModel.fromJson(merged);
      setState(() {
        _notifications.insert(0, notification);
        _unreadCount++;
      });
    } catch (_) {
      // If parsing fails, silently ignore — user can pull-to-refresh manually.
    }
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
        final items = payload is List ? payload : (payload['results'] as List? ?? []);

        final notificationsList = items
            .map((item) => NotificationModel.fromJson(
                item as Map<String, dynamic>))
            .toList();

        // Calculate unread count
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

    // Optimistically update UI
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
      // Revert on error
      _fetchNotifications();
    }
  }

  Future<void> _handleMarkNotificationRead(String notificationId) async {
    final notification = _notifications.firstWhere(
      (n) => n.id == notificationId,
      orElse: () => _notifications.first,
    );

    if (!notification.isUnRead) return;

    // Optimistically update UI
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
      // Revert on error
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

  int get _archivedCount {
    return _notifications.length - _unreadCount;
  }

  Future<void> _onRefresh() async {
    await _fetchNotifications(silent: true);
  }

  bool _atTop() =>
      _scrollController.hasClients &&
      _scrollController.position.pixels <= 0;

  bool _atBottom() =>
      _scrollController.hasClients &&
      _scrollController.position.pixels >=
          _scrollController.position.maxScrollExtent;

  void _onPointerDown(PointerDownEvent e) {
    _dragStartY = e.position.dy;
    _dragStartedAtTop = _atTop();
    _dragStartedAtBottom = _atBottom();
  }

  void _onPointerMove(PointerMoveEvent e) {
    if (_isRefreshing) return;
    final dy = e.position.dy - _dragStartY;
    if ((dy > 0 && _dragStartedAtTop) || (dy < 0 && _dragStartedAtBottom)) {
      if (dy.abs() >= 70) _triggerRefresh();
    }
  }

  void _onPointerSignal(PointerSignalEvent e) {
    if (_isRefreshing) return;
    if (e is PointerScrollEvent) {
      final scrollingUp = e.scrollDelta.dy < 0;
      final scrollingDown = e.scrollDelta.dy > 0;
      if (scrollingDown && _atTop()) {
        _wheelAccumulator += e.scrollDelta.dy.abs();
      } else if (scrollingUp && _atBottom()) {
        _wheelAccumulator += e.scrollDelta.dy.abs();
      } else {
        _wheelAccumulator = 0;
      }
      if (_wheelAccumulator >= 60) {
        _wheelAccumulator = 0;
        _triggerRefresh();
      }
    }
  }

  Future<void> _triggerRefresh() async {
    if (_isRefreshing || !mounted) return;
    setState(() => _isRefreshing = true);
    await _onRefresh();
    if (mounted) setState(() => _isRefreshing = false);
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
    ).clamp(20.0, 32.0);
    final loadingPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 32.0,
    ).clamp(24.0, 40.0);

    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      body: Listener(
        onPointerDown: _onPointerDown,
        onPointerMove: _onPointerMove,
        onPointerSignal: _onPointerSignal,
        child: Stack(
          fit: StackFit.expand,
          children: [
            CustomScrollView(
              controller: _scrollController,
              physics: const ClampingScrollPhysics(),
              slivers: [
                const SliverToBoxAdapter(child: SizedBox(height: 100)),
              SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SizedBox(height: spacing16),
                      // Header
                      _buildHeader(),
                      SizedBox(height: spacing24),
                      // Tabs
                      _buildTabs(),
                      SizedBox(height: spacing16),
                    ],
                  ),
                ),
              ),
              // Notifications List
              if (_loading)
                SliverToBoxAdapter(
                  child: Center(
                    child: Padding(
                      padding: EdgeInsets.all(loadingPadding),
                      child: const CircularProgressIndicator(),
                    ),
                  ),
                )
              else if (_filteredNotifications.isEmpty)
                SliverToBoxAdapter(
                  child: _buildEmptyState(),
                )
              else
                SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final notification = _filteredNotifications[index];
                      return NotificationItem(
                        notification: notification,
                        onMarkRead: () =>
                            _handleMarkNotificationRead(notification.id),
                      );
                    },
                    childCount: _filteredNotifications.length,
                  ),
                ),
                // Bottom padding for floating nav
                SliverToBoxAdapter(child: SizedBox(height: bottomPadding)),
              ],
            ),
            Positioned(
              top: 0,
              left: 0,
              right: 0,
              child: AppHeader(scrollController: _scrollController),
            ),

            // Bottom menu
            const FloatingBottomNav(),
            if (_isRefreshing) const RefreshOverlay(),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    final titleFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 28.0,
      min: 24.0,
      max: 36.0,
    );
    final buttonFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 14.0,
      min: 12.0,
      max: 16.0,
    );
    final buttonIconSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 18.0,
    ).clamp(16.0, 20.0);
    final buttonPaddingH = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 12.0,
    ).clamp(10.0, 16.0);
    final buttonPaddingV = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 8.0,
    ).clamp(6.0, 12.0);

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          'Notifications',
          style: AppTheme.heading2.copyWith(
            color: Colors.black,
            fontWeight: FontWeight.w700,
            fontSize: titleFontSize,
            letterSpacing: 1,
          ),
        ),
        if (_unreadCount > 0)
          TextButton.icon(
            onPressed: _handleMarkAllAsRead,
            icon: Icon(
              Icons.done_all,
              size: buttonIconSize,
              color: AppTheme.primaryColor,
            ),
            label: Text(
              'Mark all as read',
              style: AppTheme.bodyMedium.copyWith(
                color: AppTheme.primaryColor,
                fontSize: buttonFontSize,
              ),
            ),
            style: TextButton.styleFrom(
              padding: EdgeInsets.symmetric(
                horizontal: buttonPaddingH,
                vertical: buttonPaddingV,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
                side: BorderSide(color: AppTheme.primaryColor),
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildTabs() {
    final tabs = [
      {'value': 'all', 'label': 'All', 'count': _notifications.length},
      {'value': 'unread', 'label': 'Unread', 'count': _unreadCount},
      {'value': 'archived', 'label': 'Archived', 'count': _archivedCount},
    ];
    final tabFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 14.0,
      min: 12.0,
      max: 16.0,
    );
    final badgeFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 12.0,
      min: 10.0,
      max: 14.0,
    );
    final tabPaddingH = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 20.0,
    ).clamp(16.0, 24.0);
    final tabPaddingV = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 20.0);
    final spacing8 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 8.0,
    ).clamp(6.0, 12.0);
    final badgePaddingH = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 8.0,
    ).clamp(6.0, 12.0);
    final badgePaddingV = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 2.0,
    ).clamp(1.0, 4.0);

    return Container(
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(
            color: AppTheme.textSecondary.withOpacity(0.2),
            width: 1,
          ),
        ),
      ),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: tabs.map((tab) {
            final isActive = _currentTab == tab['value'];
            return InkWell(
              onTap: () {
                setState(() {
                  _currentTab = tab['value'] as String;
                });
              },
              child: Container(
                padding: EdgeInsets.symmetric(
                  horizontal: tabPaddingH,
                  vertical: tabPaddingV,
                ),
                decoration: BoxDecoration(
                  color: isActive ? AppTheme.surfaceColor : Colors.transparent,
                  border: isActive
                      ? const Border(
                          bottom: BorderSide(
                            color: AppTheme.primaryColor,
                            width: 2,
                          ),
                        )
                      : null,
                ),
                child: Row(
                  children: [
                    Text(
                      tab['label'] as String,
                      style: AppTheme.bodyMedium.copyWith(
                        color: isActive
                            ? AppTheme.primaryColor
                            : AppTheme.textSecondary,
                        fontWeight:
                            isActive ? FontWeight.w700 : FontWeight.normal,
                        fontSize: tabFontSize,
                      ),
                    ),
                    SizedBox(width: spacing8),
                    Container(
                      padding: EdgeInsets.symmetric(
                        horizontal: badgePaddingH,
                        vertical: badgePaddingV,
                      ),
                      decoration: BoxDecoration(
                        color: isActive
                            ? AppTheme.primaryColor
                            : AppTheme.textSecondary.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        (tab['count'] as int).toString(),
                        style: TextStyle(
                          color: isActive ? Colors.white : AppTheme.textSecondary,
                          fontSize: badgeFontSize,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    final emptyStatePadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 32.0,
    ).clamp(24.0, 40.0);
    final iconSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 64.0,
    ).clamp(48.0, 80.0);
    final spacing16 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 20.0);
    final headingFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 20.0,
      min: 18.0,
      max: 24.0,
    );

    return Center(
      child: Padding(
        padding: EdgeInsets.all(emptyStatePadding),
        child: Column(
          children: [
            Icon(
              Icons.notifications_none,
              size: iconSize,
              color: Colors.grey[400],
            ),
            SizedBox(height: spacing16),
            Text(
              'No notifications found',
              style: AppTheme.heading3.copyWith(
                fontSize: headingFontSize,
                color: Colors.grey,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

