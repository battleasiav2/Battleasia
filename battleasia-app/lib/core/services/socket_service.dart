import 'package:socket_io_client/socket_io_client.dart' as IO;

/// Callback type for the balance-updated event.
typedef BalanceUpdatedCallback = void Function({
  required double balance,
  required double added,
  required double previousBalance,
});

/// Callback type for the new-notification event.
typedef NewNotificationCallback = void Function(Map<String, dynamic> notification);

/// Callback type for the new-message (chat) event.
typedef NewMessageCallback = void Function(Map<String, dynamic> message);

/// Singleton Socket.IO service that mirrors the web SocketService.
///
/// Usage:
///   SocketService.instance.connect(serverUrl, token);
///   SocketService.instance.onBalanceUpdated(myCallback);
///   SocketService.instance.offBalanceUpdated(myCallback);
///   SocketService.instance.disconnect();
class SocketService {
  SocketService._();
  static final SocketService instance = SocketService._();

  IO.Socket? _socket;
  bool _isConnecting = false;
  int _reconnectAttempts = 0;
  static const int _maxReconnectAttempts = 5;

  /// All registered callbacks for the `balance-updated` event.
  final List<BalanceUpdatedCallback> _balanceUpdatedCallbacks = [];

  /// All registered callbacks for the `new-notification` event.
  final List<NewNotificationCallback> _newNotificationCallbacks = [];

  /// All registered callbacks for the `new-message` (chat) event.
  final List<NewMessageCallback> _newMessageCallbacks = [];

  /// True once the socket-level listeners have been attached,
  /// so we never attach them twice on reconnect.
  bool _socketListenerAttached = false;

  // ──────────────────────────────────────────────────────────────────────────
  // Connection management
  // ──────────────────────────────────────────────────────────────────────────

  /// Connect to the backend Socket.IO server with the user's [token].
  /// Safe to call multiple times — if already connected, no-ops.
  /// If the socket exists but is NOT connected (e.g. returned from background),
  /// tears it down and creates a fresh one so the auth token is re-sent.
  void connect(String serverUrl, String token) {
    // Already connected — nothing to do.
    if (_socket != null && _socket!.connected) return;
    if (_isConnecting) return;

    // Tear down any existing (disconnected) socket before creating a new one.
    // This is intentional: we always want to re-send the auth token on a fresh
    // connection so the server can re-join the user's room.
    if (_socket != null) {
      _socket!.dispose();
      _socket = null;
      _socketListenerAttached = false;
    }

    _isConnecting = true;
    _reconnectAttempts = 0;

    _socket = IO.io(
      serverUrl,
      IO.OptionBuilder()
          .setTransports(['websocket', 'polling'])
          .setAuth({'token': token})
          .enableReconnection()
          .setReconnectionAttempts(_maxReconnectAttempts)
          .setReconnectionDelay(1000)
          .setReconnectionDelayMax(5000)
          .disableAutoConnect()
          .build(),
    );

    // Attach the `balance-updated` socket listener exactly once for the
    // lifetime of this socket instance (before connect, so it is ready
    // immediately on the first `connect` event).
    _attachSocketListeners();

    _socket!.onConnect((_) {
      _isConnecting = false;
      _reconnectAttempts = 0;
    });

    _socket!.onDisconnect((_) {
      _isConnecting = false;
    });

    _socket!.onConnectError((_) {
      _reconnectAttempts++;
      _isConnecting = false;
      if (_reconnectAttempts >= _maxReconnectAttempts) {
        disconnect();
      }
    });

    _socket!.connect();
  }

  /// Force a reconnect regardless of the current connection state.
  /// Useful when returning from app background where the TCP connection
  /// may have been silently closed by the OS/network.
  void reconnect(String serverUrl, String token) {
    // Dispose the old socket unconditionally, then connect fresh.
    if (_socket != null) {
      _socket!.dispose();
      _socket = null;
      _socketListenerAttached = false;
      _isConnecting = false;
    }
    connect(serverUrl, token);
  }

  /// Disconnect and clean up.
  void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
    _socketListenerAttached = false;
    _isConnecting = false;
    _reconnectAttempts = 0;
  }

  bool get isConnected => _socket?.connected ?? false;

  // ──────────────────────────────────────────────────────────────────────────
  // balance-updated event
  // ──────────────────────────────────────────────────────────────────────────

  /// Register [callback] to be invoked whenever the backend emits a
  /// `balance-updated` event for this user.  Duplicate registrations are
  /// silently ignored.
  void onBalanceUpdated(BalanceUpdatedCallback callback) {
    if (!_balanceUpdatedCallbacks.contains(callback)) {
      _balanceUpdatedCallbacks.add(callback);
    }
  }

  /// Remove a specific [callback], or all callbacks when called with no
  /// argument.
  void offBalanceUpdated([BalanceUpdatedCallback? callback]) {
    if (callback != null) {
      _balanceUpdatedCallbacks.remove(callback);
    } else {
      _balanceUpdatedCallbacks.clear();
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // new-notification event
  // ──────────────────────────────────────────────────────────────────────────

  /// Register [callback] to be invoked whenever the backend emits a
  /// `new-notification` event for this user.  Duplicate registrations are
  /// silently ignored.
  void onNewNotification(NewNotificationCallback callback) {
    if (!_newNotificationCallbacks.contains(callback)) {
      _newNotificationCallbacks.add(callback);
    }
  }

  /// Remove a specific [callback], or all callbacks when called with no
  /// argument.
  void offNewNotification([NewNotificationCallback? callback]) {
    if (callback != null) {
      _newNotificationCallbacks.remove(callback);
    } else {
      _newNotificationCallbacks.clear();
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // new-message (support chat) event
  // ──────────────────────────────────────────────────────────────────────────

  /// Register [callback] to be invoked whenever the backend emits a
  /// `new-message` event for the joined conversation room.
  /// Duplicate registrations are silently ignored.
  void onNewMessage(NewMessageCallback callback) {
    if (!_newMessageCallbacks.contains(callback)) {
      _newMessageCallbacks.add(callback);
    }
  }

  /// Remove a specific [callback], or all callbacks when called with no
  /// argument.
  void offNewMessage([NewMessageCallback? callback]) {
    if (callback != null) {
      _newMessageCallbacks.remove(callback);
    } else {
      _newMessageCallbacks.clear();
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Conversation room management (support chat)
  // ──────────────────────────────────────────────────────────────────────────

  /// Ask the server to add this socket to the `conversation:<id>` room.
  /// Safe to call before the socket is fully connected — queued until connect.
  void joinConversation(String conversationId) {
    if (_socket == null) return;
    if (_socket!.connected) {
      _socket!.emit('join-conversation', conversationId);
    } else {
      _socket!.once('connect', (_) {
        _socket?.emit('join-conversation', conversationId);
      });
    }
  }

  /// Ask the server to remove this socket from the `conversation:<id>` room.
  void leaveConversation(String conversationId) {
    if (_socket?.connected == true) {
      _socket!.emit('leave-conversation', conversationId);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Internal helpers
  // ──────────────────────────────────────────────────────────────────────────

  /// Attaches the raw Socket.IO `balance-updated` handler to [_socket].
  /// Called once per socket instance — guarded by [_socketListenerAttached].
  void _attachSocketListeners() {
    if (_socket == null || _socketListenerAttached) return;
    _socketListenerAttached = true;

    _socket!.on('balance-updated', (data) {
      if (data is! Map) return;

      final balance = (data['balance'] as num?)?.toDouble() ?? 0.0;
      final added = (data['added'] as num?)?.toDouble() ?? 0.0;
      final previousBalance =
          (data['previousBalance'] as num?)?.toDouble() ?? 0.0;

      // Iterate over a copy so callbacks can safely remove themselves.
      for (final cb in List.of(_balanceUpdatedCallbacks)) {
        cb(
          balance: balance,
          added: added,
          previousBalance: previousBalance,
        );
      }
    });

    _socket!.on('new-notification', (data) {
      if (data is! Map) return;
      final notification = Map<String, dynamic>.from(data);
      // Iterate over a copy so callbacks can safely remove themselves.
      for (final cb in List.of(_newNotificationCallbacks)) {
        cb(notification);
      }
    });

    _socket!.on('new-message', (data) {
      if (data is! Map) return;
      final message = Map<String, dynamic>.from(data);
      // Iterate over a copy so callbacks can safely remove themselves.
      for (final cb in List.of(_newMessageCallbacks)) {
        cb(message);
      }
    });
  }
}
