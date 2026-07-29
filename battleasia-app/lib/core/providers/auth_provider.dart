import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:battleasia_app/core/config/app_config.dart';
import 'package:battleasia_app/core/services/auth_service.dart';
import 'package:battleasia_app/core/services/socket_service.dart';
import 'package:battleasia_app/core/services/user_service.dart';
import 'package:battleasia_app/data/models/user_model.dart';
import 'package:battleasia_app/data/models/session_model.dart';

class AuthProvider with ChangeNotifier, WidgetsBindingObserver {
  final AuthService _authService = AuthService();
  final UserService _userService = UserService();

  UserModel? _user;
  SessionModel? _session;
  bool _isLoading = false;
  bool _isAuthenticated = false;
  // Pending avatar file selected by the user — displayed immediately in the UI
  // before the server confirms the save.
  File? _pendingAvatarFile;

  UserModel? get user => _user;
  SessionModel? get session => _session;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _isAuthenticated;
  File? get pendingAvatarFile => _pendingAvatarFile;

  /// Set a pending avatar file to preview immediately in the header / banner.
  void setPendingAvatar(File? file) {
    _pendingAvatarFile = file;
    notifyListeners();
  }

  /// Clear the pending avatar (call after server confirms save).
  void clearPendingAvatar() {
    _pendingAvatarFile = null;
    notifyListeners();
  }

  AuthProvider() {
    WidgetsBinding.instance.addObserver(this);
    _checkAuthStatus();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  // ── App lifecycle ──────────────────────────────────────────────────────────
  // When the app returns to foreground:
  //   1. Re-ensure the socket is connected (it may have been dropped while
  //      the app was suspended).
  //   2. Fetch a fresh copy of the user's profile so the balance reflects
  //      any changes that happened while the app was in the background.
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed && _isAuthenticated) {
      _ensureSocketConnected();
      _fetchFreshBalance();
    }
  }

  // Check authentication status on init
  Future<void> _checkAuthStatus() async {
    _isLoading = true;
    notifyListeners();

    final isAuth = await _authService.isAuthenticated();
    if (isAuth) {
      _user = await _authService.getUser();
      final token = await _authService.getToken();
      if (token != null) {
        _session = SessionModel(accessToken: token);
        _connectSocket(token);
      }
      _isAuthenticated = true;
    } else {
      _isAuthenticated = false;
    }

    _isLoading = false;
    notifyListeners();
  }

  // Sign in
  Future<Map<String, dynamic>> signIn({
    required String email,
    required String password,
  }) async {
    _isLoading = true;
    notifyListeners();

    final result = await _authService.signIn(email: email, password: password);

    _isLoading = false;

    if (result['success'] == true) {
      // Check if email verification is required
      if (result['emailVerificationRequired'] == true) {
        // Don't set user/session - return verification required
        notifyListeners();
        return result;
      }
      
      _user = result['user'] as UserModel?;
      _session = result['session'] as SessionModel?;
      if (_session != null) {
        _isAuthenticated = true;
        _connectSocket(_session!.accessToken);
      }
      notifyListeners();
    }

    return result;
  }

  // Sign up
  Future<Map<String, dynamic>> signUp({
    required String email,
    required String password,
    required String username,
    String? countryCode,
    String? mobileNo,
    String? pubgId,
    String? gameServer,
    String? referralCode,
    String? referredBy,
  }) async {
    _isLoading = true;
    notifyListeners();

    final result = await _authService.signUp(
      email: email,
      password: password,
      username: username,
      countryCode: countryCode,
      mobileNo: mobileNo,
      pubgId: pubgId,
      gameServer: gameServer,
      referralCode: referralCode,
      referredBy: referredBy,
    );

    _isLoading = false;

    if (result['success'] == true) {
      // Check if email verification is required
      if (result['emailVerificationRequired'] == true) {
        // Don't set user/session - return verification required
        notifyListeners();
        return result;
      }
      
      _user = result['user'] as UserModel?;
      _session = result['session'] as SessionModel?;
      if (_session != null) {
        _isAuthenticated = true;
      }
      notifyListeners();
    }

    return result;
  }

  // Refresh user data
  Future<void> refreshUser() async {
    _isLoading = true;
    notifyListeners();

    final isAuth = await _authService.isAuthenticated();
    if (isAuth) {
      _user = await _authService.getUser();
      final token = await _authService.getToken();
      if (token != null) {
        _session = SessionModel(accessToken: token);
      }
      _isAuthenticated = true;
    } else {
      _isAuthenticated = false;
    }

    _isLoading = false;
    notifyListeners();
  }

  // Update user data
  void updateUser(UserModel user) {
    _user = user;
    notifyListeners();
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Balance-change notification (used for animations)
  // ──────────────────────────────────────────────────────────────────────────

  /// The most recent balance delta received from the backend.
  /// Positive = gain (deposit / prize), negative = loss (withdrawal / join fee).
  double _lastBalanceDelta = 0.0;
  double get lastBalanceDelta => _lastBalanceDelta;

  /// Update user's balance in memory and notify listeners.
  /// Called by socket events so the header and wallet screen update instantly.
  void updateBalance(double newBalance, {double? delta}) {
    if (_user == null) return;
    _lastBalanceDelta = delta ?? (newBalance - (_user!.balance ?? 0.0));
    _user = UserModel(
      id: _user!.id,
      email: _user!.email,
      username: _user!.username,
      inGameUserName: _user!.inGameUserName,
      countryCode: _user!.countryCode,
      mobileNo: _user!.mobileNo,
      pubgId: _user!.pubgId,
      gameServer: _user!.gameServer,
      referralCode: _user!.referralCode,
      twitterLink: _user!.twitterLink,
      facebookLink: _user!.facebookLink,
      instagramLink: _user!.instagramLink,
      status: _user!.status,
      avatar: _user!.avatar,
      followers: _user!.followers,
      following: _user!.following,
      createdAt: _user!.createdAt,
      updatedAt: _user!.updatedAt,
      role: _user!.role,
      balance: newBalance,
      isPremium: _user!.isPremium,
      premiumSince: _user!.premiumSince,
      premiumExpiresAt: _user!.premiumExpiresAt,
    );
    notifyListeners();
  }

  // Sign out
  Future<void> signOut() async {
    SocketService.instance.offBalanceUpdated(_onSocketBalanceUpdated);
    SocketService.instance.disconnect();
    await _authService.signOut();
    _user = null;
    _session = null;
    _isAuthenticated = false;
    notifyListeners();
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Socket helpers
  // ──────────────────────────────────────────────────────────────────────────

  void _connectSocket(String token) {
    final serverUrl = AppConfig.serverUrl;
    // Tear down any previous listener before connecting, so we never stack
    // duplicate callbacks when the user logs out and back in.
    SocketService.instance.offBalanceUpdated(_onSocketBalanceUpdated);
    SocketService.instance.connect(serverUrl, token);
    SocketService.instance.onBalanceUpdated(_onSocketBalanceUpdated);
  }

  /// Re-connect the socket if it is not currently connected.
  /// Called on app resume and after any network interruption.
  /// Uses [reconnect] (force) so that a stale-but-"connected" socket object
  /// from before the app was suspended is always replaced with a fresh one.
  void _ensureSocketConnected() {
    final token = _session?.accessToken;
    if (token == null) return;
    final serverUrl = AppConfig.serverUrl;
    // Always use reconnect() on resume — the OS may have killed the TCP
    // connection while the app was in the background even if the Dart-side
    // socket object still reports connected = true.
    SocketService.instance.offBalanceUpdated(_onSocketBalanceUpdated);
    SocketService.instance.reconnect(serverUrl, token);
    SocketService.instance.onBalanceUpdated(_onSocketBalanceUpdated);
  }

  /// Fetch live user profile from the server and update the in-memory balance.
  /// Called on app resume so that any balance changes that happened while the
  /// app was in the background are reflected immediately.
  Future<void> _fetchFreshBalance() async {
    try {
      final result = await _userService.getMe();
      if (result['success'] == true && result['data'] != null) {
        final userData = result['data'] as Map<String, dynamic>;
        final liveBalance = (userData['balance'] as num?)?.toDouble();
        if (liveBalance != null && liveBalance != (_user?.balance ?? 0.0)) {
          updateBalance(liveBalance);
        }
      }
    } catch (_) {
      // Silently ignore — the socket will still deliver live events.
    }
  }

  /// Named handler so it can be cleanly registered / removed by reference.
  void _onSocketBalanceUpdated({
    required double balance,
    required double added,
    required double previousBalance,
  }) {
    updateBalance(balance, delta: added);
  }
}
