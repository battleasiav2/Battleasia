import 'dart:io';

import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/core/services/customer_support_service.dart';
import 'package:battleasia_app/core/services/socket_service.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/image_utils.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/core/utils/time_utils.dart';
import 'package:battleasia_app/data/models/customer_support_model.dart';
import 'package:battleasia_app/presentation/widgets/common/app_header.dart';
import 'package:battleasia_app/presentation/widgets/common/bottom_menu.dart';

enum _SupportMode { list, create, detail }

class CustomerSupportScreen extends StatefulWidget {
  const CustomerSupportScreen({super.key});

  @override
  State<CustomerSupportScreen> createState() => _CustomerSupportScreenState();
}

class _CustomerSupportScreenState extends State<CustomerSupportScreen> {
  final ScrollController _scrollController = ScrollController();
  final ScrollController _messagesScrollController = ScrollController();
  final TextEditingController _messageController = TextEditingController();
  final TextEditingController _subjectController = TextEditingController();
  final TextEditingController _bodyController = TextEditingController();
  final CustomerSupportService _service = CustomerSupportService();
  final ImagePicker _picker = ImagePicker();

  _SupportMode _mode = _SupportMode.list;
  String _statusFilter = 'all';
  List<ConversationModel> _tickets = [];
  ConversationModel? _conversation;
  List<MessageModel> _messages = [];
  List<String> _pendingLocalPaths = [];
  List<String> _pendingUploadedUrls = [];

  bool _loading = true;
  bool _sending = false;
  bool _creating = false;
  bool _closing = false;
  String _createCategory = 'other';

  @override
  void initState() {
    super.initState();
    SocketService.instance.onNewMessage(_onNewMessage);
    _loadTickets();
  }

  @override
  void dispose() {
    SocketService.instance.offNewMessage(_onNewMessage);
    if (_conversation != null) {
      SocketService.instance.leaveConversation(_conversation!.id);
    }
    _scrollController.dispose();
    _messagesScrollController.dispose();
    _messageController.dispose();
    _subjectController.dispose();
    _bodyController.dispose();
    super.dispose();
  }

  void _onNewMessage(Map<String, dynamic> data) {
    if (!mounted || _mode != _SupportMode.detail) return;
    try {
      final normalized = Map<String, dynamic>.from(data);
      final incomingId = normalized['id']?.toString() ?? '';
      if (incomingId.isEmpty) return;

      setState(() {
        final tempIndex = _messages.indexWhere(
          (m) =>
              m.id.startsWith('temp-') &&
              !m.isAdmin &&
              m.body == (normalized['body']?.toString() ?? ''),
        );
        if (tempIndex != -1) {
          _messages[tempIndex] = MessageModel.fromJson(normalized);
        } else if (!_messages.any((m) => m.id == incomingId)) {
          _messages.add(MessageModel.fromJson(normalized));
          _scrollToBottom();
        }
      });
    } catch (_) {}
  }

  Future<void> _loadTickets() async {
    setState(() => _loading = true);
    final result = await _service.getMyTickets(
      limit: 50,
      status: _statusFilter == 'all' ? null : _statusFilter,
    );
    if (!mounted) return;
    if (result['success'] == true) {
      final data = result['data'] as Map<String, dynamic>;
      setState(() {
        _tickets = (data['results'] as List).cast<ConversationModel>();
        _loading = false;
      });
    } else {
      setState(() => _loading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result['message']?.toString() ?? 'Failed to load tickets'),
        ),
      );
    }
  }

  Future<void> _openTicket(ConversationModel ticket) async {
    if (_conversation != null) {
      SocketService.instance.leaveConversation(_conversation!.id);
    }
    setState(() {
      _mode = _SupportMode.detail;
      _conversation = ticket;
      _messages = [];
      _loading = true;
      _pendingLocalPaths = [];
      _pendingUploadedUrls = [];
    });
    await _loadMessages(ticket.id);
    SocketService.instance.joinConversation(ticket.id);
    if (mounted) setState(() => _loading = false);
  }

  Future<void> _loadMessages(String conversationId) async {
    final messagesResult = await _service.getMessages(conversationId, limit: 100);
    if (!mounted) return;
    if (messagesResult['success'] == true && messagesResult['data'] != null) {
      final data = messagesResult['data'] as Map<String, dynamic>;
      final results = data['results'] as List? ?? [];
      final messages = results.map((item) {
        final map = item is Map<String, dynamic>
            ? item
            : Map<String, dynamic>.from(item as Map);
        return MessageModel.fromJson(map);
      }).toList();
      setState(() => _messages = messages);
      _scrollToBottom();
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_messagesScrollController.hasClients) {
        _messagesScrollController.animateTo(
          _messagesScrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _pickAttachments({bool forCreate = false}) async {
    final files = await _picker.pickMultiImage(
      maxWidth: 1600,
      maxHeight: 1600,
      imageQuality: 85,
    );
    if (files.isEmpty) return;
    setState(() {
      _pendingLocalPaths = [
        ..._pendingLocalPaths,
        ...files.map((f) => f.path),
      ];
    });
    // Upload immediately so send/create can use URLs
    final upload = await _service.uploadFiles(files.map((f) => f.path).toList());
    if (!mounted) return;
    if (upload['success'] == true) {
      final urls = ((upload['data'] as Map)['files'] as List).cast<String>();
      setState(() => _pendingUploadedUrls = [..._pendingUploadedUrls, ...urls]);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(upload['message']?.toString() ?? 'Upload failed'),
        ),
      );
    }
  }

  Future<void> _createTicket() async {
    final subject = _subjectController.text.trim();
    final body = _bodyController.text.trim();
    if ((body.isEmpty && _pendingUploadedUrls.isEmpty) || _creating) return;

    setState(() => _creating = true);
    final result = await _service.createTicket(
      subject: subject.isEmpty ? 'Support Ticket' : subject,
      category: _createCategory,
      body: body.isEmpty ? 'See attached' : body,
      attachments: _pendingUploadedUrls,
    );
    if (!mounted) return;
    setState(() => _creating = false);

    if (result['success'] == true) {
      final ticket = result['data'] as ConversationModel;
      _subjectController.clear();
      _bodyController.clear();
      _pendingLocalPaths = [];
      _pendingUploadedUrls = [];
      await _openTicket(ticket);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result['message']?.toString() ?? 'Failed to create ticket'),
        ),
      );
    }
  }

  Future<void> _closeTicket() async {
    if (_conversation == null || _closing || _conversation!.isClosed) return;
    setState(() => _closing = true);
    final result = await _service.closeConversation(_conversation!.id);
    if (!mounted) return;
    setState(() => _closing = false);
    if (result['success'] == true) {
      setState(() {
        _conversation = _conversation!.copyWith(status: 'closed');
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Ticket closed')),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result['message']?.toString() ?? 'Failed to close'),
        ),
      );
    }
  }

  Future<void> _handleSendMessage(AuthProvider authProvider) async {
    final text = _messageController.text.trim();
    if ((text.isEmpty && _pendingUploadedUrls.isEmpty) ||
        _sending ||
        _conversation == null ||
        _conversation!.isClosed) {
      return;
    }

    final user = authProvider.user;
    final attachments = List<String>.from(_pendingUploadedUrls);
    final optimistic = MessageModel(
      id: 'temp-${DateTime.now().millisecondsSinceEpoch}',
      body: text.isEmpty ? ' ' : text,
      senderId: user?.id ?? '',
      senderName: user?.username ?? user?.email ?? 'You',
      senderAvatar: ImageUtils.getImageUrl(user?.avatar),
      isAdmin: false,
      createdAt: DateTime.now().toIso8601String(),
      attachments: attachments,
    );

    setState(() {
      _messages.add(optimistic);
      _messageController.clear();
      _pendingLocalPaths = [];
      _pendingUploadedUrls = [];
      _sending = true;
    });
    _scrollToBottom();

    final result = await _service.sendMessage(
      body: text.isEmpty ? 'See attached' : text,
      conversationId: _conversation!.id,
      attachments: attachments.isEmpty ? null : attachments,
    );

    if (!mounted) return;
    if (result['success'] != true) {
      setState(() {
        _messages.removeWhere((m) => m.id == optimistic.id);
        _messageController.text = text;
        _pendingUploadedUrls = attachments;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result['message']?.toString() ?? 'Failed to send'),
        ),
      );
    }
    setState(() => _sending = false);
  }

  void _backToList() {
    if (_conversation != null) {
      SocketService.instance.leaveConversation(_conversation!.id);
    }
    setState(() {
      _mode = _SupportMode.list;
      _conversation = null;
      _messages = [];
      _pendingLocalPaths = [];
      _pendingUploadedUrls = [];
    });
    _loadTickets();
  }

  @override
  Widget build(BuildContext context) {
    final headerHeight = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 100.0,
    ).clamp(80.0, 100.0);
    final horizontalPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 16.0);
    final bottomNavHeight = 80.0 + MediaQuery.of(context).padding.bottom;

    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      body: Stack(
        fit: StackFit.expand,
        children: [
          Column(
            children: [
              SizedBox(height: headerHeight),
              Expanded(
                child: Padding(
                  padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
                  child: Consumer<AuthProvider>(
                    builder: (context, authProvider, _) {
                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const SizedBox(height: 16),
                          _buildTitle(),
                          const SizedBox(height: 16),
                          Expanded(child: _buildBody(authProvider)),
                          SizedBox(height: bottomNavHeight),
                        ],
                      );
                    },
                  ),
                ),
              ),
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

  Widget _buildTitle() {
    final title = switch (_mode) {
      _SupportMode.list => 'support.title'.tr(),
      _SupportMode.create => 'support.newTicket'.tr(),
      _SupportMode.detail => _conversation?.subject ?? 'support.title'.tr(),
    };
    return Row(
      children: [
        if (_mode != _SupportMode.list)
          IconButton(
            onPressed: () {
              if (_mode == _SupportMode.detail) {
                _backToList();
              } else {
                setState(() => _mode = _SupportMode.list);
              }
            },
            icon: const Icon(Icons.arrow_back, color: Colors.black),
          ),
        Expanded(
          child: Text(
            title,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: AppTheme.heading2.copyWith(
              color: Colors.black,
              fontWeight: FontWeight.w700,
              fontSize: 24,
            ),
          ),
        ),
        if (_mode == _SupportMode.list)
          TextButton.icon(
            onPressed: () {
              setState(() {
                _mode = _SupportMode.create;
                _pendingLocalPaths = [];
                _pendingUploadedUrls = [];
                _createCategory = 'other';
              });
            },
            icon: const Icon(Icons.add, color: AppColors.gold),
            label: Text(
              'support.newTicket'.tr(),
              style: AppTheme.bodySmall.copyWith(
                color: AppColors.gold,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
        if (_mode == _SupportMode.detail &&
            _conversation != null &&
            !_conversation!.isClosed)
          TextButton(
            onPressed: _closing ? null : _closeTicket,
            child: Text(
              _closing ? '...' : 'support.close'.tr(),
              style: AppTheme.bodySmall.copyWith(
                color: Colors.redAccent,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildBody(AuthProvider authProvider) {
    return switch (_mode) {
      _SupportMode.list => _buildList(),
      _SupportMode.create => _buildCreateForm(),
      _SupportMode.detail => _buildDetail(authProvider),
    };
  }

  Widget _buildList() {
    const filters = ['all', 'open', 'pending', 'closed'];
    return Column(
      children: [
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: filters.map((f) {
              final selected = _statusFilter == f;
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: ChoiceChip(
                  label: Text(f[0].toUpperCase() + f.substring(1)),
                  selected: selected,
                  onSelected: (_) {
                    setState(() => _statusFilter = f);
                    _loadTickets();
                  },
                  selectedColor: AppColors.gold.withValues(alpha: 0.25),
                  labelStyle: TextStyle(
                    color: selected ? Colors.black : Colors.black54,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              );
            }).toList(),
          ),
        ),
        const SizedBox(height: 12),
        Expanded(
          child: _loading
              ? const Center(
                  child: CircularProgressIndicator(color: AppColors.gold),
                )
              : _tickets.isEmpty
                  ? Center(
                      child: Text(
                        'No tickets yet. Tap New to create one.',
                        style: AppTheme.bodyMedium
                            .copyWith(color: AppTheme.textSecondary),
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: _loadTickets,
                      child: ListView.separated(
                        itemCount: _tickets.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 10),
                        itemBuilder: (context, index) {
                          final t = _tickets[index];
                          return Material(
                            color: AppTheme.surfaceColor,
                            borderRadius: BorderRadius.circular(8),
                            child: InkWell(
                              onTap: () => _openTicket(t),
                              borderRadius: BorderRadius.circular(8),
                              child: Padding(
                                padding: const EdgeInsets.all(14),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Expanded(
                                          child: Text(
                                            t.subject,
                                            style: AppTheme.bodyLarge.copyWith(
                                              fontWeight: FontWeight.w700,
                                              color: Colors.black,
                                            ),
                                          ),
                                        ),
                                        _StatusChip(status: t.status),
                                      ],
                                    ),
                                    const SizedBox(height: 6),
                                    Text(
                                      t.category.toUpperCase(),
                                      style: AppTheme.bodySmall.copyWith(
                                        color: AppColors.gold,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                    if ((t.previewBody ?? '').isNotEmpty) ...[
                                      const SizedBox(height: 6),
                                      Text(
                                        t.previewBody!,
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis,
                                        style: AppTheme.bodySmall.copyWith(
                                          color: AppTheme.textSecondary,
                                        ),
                                      ),
                                    ],
                                    if (t.attachmentCount > 0) ...[
                                      const SizedBox(height: 6),
                                      Text(
                                        '${t.attachmentCount} attachment(s)',
                                        style: AppTheme.bodySmall.copyWith(
                                          color: AppTheme.textSecondary,
                                        ),
                                      ),
                                    ],
                                  ],
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
        ),
      ],
    );
  }

  Widget _buildCreateForm() {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          TextField(
            controller: _subjectController,
            decoration: const InputDecoration(
              labelText: 'Subject',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(
            value: _createCategory,
            decoration: const InputDecoration(
              labelText: 'Category',
              border: OutlineInputBorder(),
            ),
            items: kTicketCategories
                .map(
                  (c) => DropdownMenuItem(
                    value: c,
                    child: Text(c[0].toUpperCase() + c.substring(1)),
                  ),
                )
                .toList(),
            onChanged: (v) {
              if (v != null) setState(() => _createCategory = v);
            },
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _bodyController,
            minLines: 4,
            maxLines: 8,
            decoration: const InputDecoration(
              labelText: 'Describe your issue',
              border: OutlineInputBorder(),
              alignLabelWithHint: true,
            ),
          ),
          const SizedBox(height: 12),
          OutlinedButton.icon(
            onPressed: _creating ? null : () => _pickAttachments(forCreate: true),
            icon: const Icon(Icons.attach_file),
            label: Text(
              _pendingLocalPaths.isEmpty
                  ? 'Add attachments'
                  : '${_pendingLocalPaths.length} file(s) attached',
            ),
          ),
          if (_pendingLocalPaths.isNotEmpty) ...[
            const SizedBox(height: 8),
            SizedBox(
              height: 72,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: _pendingLocalPaths.length,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (_, i) => ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: Image.file(
                    File(_pendingLocalPaths[i]),
                    width: 72,
                    height: 72,
                    fit: BoxFit.cover,
                  ),
                ),
              ),
            ),
          ],
          const SizedBox(height: 16),
          FilledButton(
            onPressed: _creating ? null : _createTicket,
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.gold,
              foregroundColor: Colors.black,
              padding: const EdgeInsets.symmetric(vertical: 14),
            ),
            child: _creating
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Text('Submit ticket'),
          ),
        ],
      ),
    );
  }

  Widget _buildDetail(AuthProvider authProvider) {
    final closed = _conversation?.isClosed == true;
    return Card(
      color: AppTheme.surfaceColor,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          children: [
            Row(
              children: [
                if (_conversation != null) _StatusChip(status: _conversation!.status),
                const SizedBox(width: 8),
                Text(
                  (_conversation?.category ?? 'other').toUpperCase(),
                  style: AppTheme.bodySmall.copyWith(
                    color: AppColors.gold,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const Spacer(),
                IconButton(
                  onPressed: _conversation == null
                      ? null
                      : () => _loadMessages(_conversation!.id),
                  icon: const Icon(Icons.refresh, color: AppColors.gold),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                  color: AppTheme.backgroundColor,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: _loading
                    ? const Center(
                        child: CircularProgressIndicator(color: AppColors.gold),
                      )
                    : _messages.isEmpty
                        ? Center(
                            child: Text(
                              'No messages yet',
                              style: AppTheme.bodyMedium.copyWith(
                                color: AppTheme.textSecondary,
                              ),
                            ),
                          )
                        : ListView.builder(
                            controller: _messagesScrollController,
                            padding: const EdgeInsets.all(8),
                            itemCount: _messages.length,
                            itemBuilder: (context, index) => _buildBubble(
                              authProvider,
                              _messages[index],
                            ),
                          ),
              ),
            ),
            if (_pendingLocalPaths.isNotEmpty) ...[
              const SizedBox(height: 8),
              SizedBox(
                height: 56,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: _pendingLocalPaths.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 6),
                  itemBuilder: (_, i) => ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: Image.file(
                      File(_pendingLocalPaths[i]),
                      width: 56,
                      height: 56,
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
              ),
            ],
            const SizedBox(height: 8),
            if (closed)
              Padding(
                padding: const EdgeInsets.all(8),
                child: Text(
                  'This ticket is closed',
                  style: AppTheme.bodySmall.copyWith(color: Colors.redAccent),
                ),
              )
            else
              Row(
                children: [
                  IconButton(
                    onPressed: _sending ? null : () => _pickAttachments(),
                    icon: const Icon(Icons.attach_file, color: AppColors.gold),
                  ),
                  Expanded(
                    child: TextField(
                      controller: _messageController,
                      minLines: 1,
                      maxLines: 3,
                      enabled: !_sending,
                      decoration: InputDecoration(
                        hintText: 'Type your message...',
                        filled: true,
                        fillColor: AppTheme.backgroundColor,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24),
                          borderSide: BorderSide.none,
                        ),
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 10,
                        ),
                      ),
                      onSubmitted: (_) => _handleSendMessage(authProvider),
                    ),
                  ),
                  IconButton(
                    onPressed: _sending
                        ? null
                        : () => _handleSendMessage(authProvider),
                    icon: _sending
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.send, color: AppColors.gold),
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildBubble(AuthProvider authProvider, MessageModel message) {
    final isMe = !message.isAdmin;
    final user = authProvider.user;
    final userAvatarUrl = ImageUtils.getImageUrl(user?.avatar);

    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        mainAxisAlignment:
            isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (!isMe)
            const CircleAvatar(
              radius: 16,
              backgroundColor: AppColors.gold,
              child: Text('S', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          if (!isMe) const SizedBox(width: 8),
          Flexible(
            child: Column(
              crossAxisAlignment:
                  isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
              children: [
                Text(
                  isMe ? 'You' : 'Support Admin',
                  style: AppTheme.bodySmall.copyWith(
                    color: AppTheme.textSecondary,
                  ),
                ),
                const SizedBox(height: 4),
                if (message.body.trim().isNotEmpty)
                  Container(
                    decoration: BoxDecoration(
                      color: isMe ? AppTheme.primaryColor : AppTheme.surfaceColor,
                      borderRadius: BorderRadius.circular(14),
                    ),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 10,
                    ),
                    child: Text(
                      message.body,
                      style: AppTheme.bodyMedium.copyWith(
                        color: isMe ? Colors.white : Colors.black,
                      ),
                    ),
                  ),
                ...message.attachments.map((attachment) {
                  final fileUrl =
                      ImageUtils.getImageUrl(attachment) ?? attachment;
                  final isImage = RegExp(
                    r'\.(jpg|jpeg|png|gif|webp)$',
                    caseSensitive: false,
                  ).hasMatch(attachment);
                  return Padding(
                    padding: const EdgeInsets.only(top: 6),
                    child: isImage
                        ? ConstrainedBox(
                            constraints: const BoxConstraints(maxHeight: 180),
                            child: Image.network(
                              fileUrl,
                              fit: BoxFit.contain,
                              errorBuilder: (_, __, ___) => Text(
                                attachment.split('/').last,
                                style: AppTheme.bodySmall,
                              ),
                            ),
                          )
                        : Text(
                            attachment.split('/').last,
                            style: AppTheme.bodySmall,
                          ),
                  );
                }),
                const SizedBox(height: 4),
                Text(
                  message.createdAt != null
                      ? TimeUtils.timeAgo(message.createdAt!)
                      : 'Just now',
                  style: AppTheme.bodySmall.copyWith(
                    color: AppTheme.textSecondary,
                    fontSize: 11,
                  ),
                ),
              ],
            ),
          ),
          if (isMe) const SizedBox(width: 8),
          if (isMe)
            CircleAvatar(
              radius: 16,
              backgroundColor: AppTheme.primaryColor,
              backgroundImage: userAvatarUrl != null && userAvatarUrl.isNotEmpty
                  ? NetworkImage(userAvatarUrl)
                  : null,
              child: (userAvatarUrl == null || userAvatarUrl.isEmpty)
                  ? Text(
                      (user?.username ?? 'U').substring(0, 1).toUpperCase(),
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    )
                  : null,
            ),
        ],
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  final String status;
  const _StatusChip({required this.status});

  @override
  Widget build(BuildContext context) {
    final s = status.toLowerCase();
    final color = switch (s) {
      'open' => Colors.green,
      'pending' => Colors.orange,
      'closed' => Colors.grey,
      _ => Colors.blueGrey,
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: color.withValues(alpha: 0.5)),
      ),
      child: Text(
        s.toUpperCase(),
        style: TextStyle(
          color: color,
          fontSize: 10,
          fontWeight: FontWeight.w800,
        ),
      ),
    );
  }
}
