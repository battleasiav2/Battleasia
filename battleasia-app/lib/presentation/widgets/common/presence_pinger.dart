import 'dart:async';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/core/services/user_service.dart';

/// Keeps lastSeen fresh the same way the website pings every 45 seconds.
class PresencePinger extends StatefulWidget {
  const PresencePinger({super.key});

  @override
  State<PresencePinger> createState() => _PresencePingerState();
}

class _PresencePingerState extends State<PresencePinger> {
  final _users = UserService();
  Timer? _timer;
  AuthProvider? _auth;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      _auth = context.read<AuthProvider>();
      _auth!.addListener(_sync);
      _sync();
    });
  }

  void _sync() {
    _timer?.cancel();
    _timer = null;
    final authed = _auth?.isAuthenticated == true;
    if (!authed) return;
    _users.pingPresence();
    _timer = Timer.periodic(const Duration(seconds: 45), (_) {
      _users.pingPresence();
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _auth?.removeListener(_sync);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => const SizedBox.shrink();
}
