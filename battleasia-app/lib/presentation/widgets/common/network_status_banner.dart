import 'package:flutter/material.dart';
import 'package:battleasia_app/core/config/app_config.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/utils/api_client.dart';

/// Thin signal bar when the API is slow or unreachable.
class NetworkStatusBanner extends StatefulWidget {
  const NetworkStatusBanner({super.key});

  @override
  State<NetworkStatusBanner> createState() => _NetworkStatusBannerState();
}

class _NetworkStatusBannerState extends State<NetworkStatusBanner> {
  bool _weak = false;

  @override
  void initState() {
    super.initState();
    _ping();
  }

  Future<void> _ping() async {
    try {
      final uri = Uri.parse('${AppConfig.serverUrl}/api/health');
      final res = await ApiClient.get(uri).timeout(const Duration(seconds: 4));
      if (!mounted) return;
      setState(() => _weak = res.statusCode != 200);
    } catch (_) {
      if (!mounted) return;
      setState(() => _weak = true);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (!_weak) return const SizedBox.shrink();

    return Material(
      color: const Color(0xFF7A1F1F),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        child: Row(
            children: [
              Icon(Icons.signal_wifi_statusbar_connected_no_internet_4,
                  color: AppColors.gold, size: 18),
              const SizedBox(width: 8),
              const Expanded(
                child: Text(
                  'Weak network — check your signal',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              TextButton(
                onPressed: _ping,
                child: Text(
                  'RETRY',
                  style: TextStyle(
                    color: AppColors.gold,
                    fontWeight: FontWeight.w800,
                    fontSize: 11,
                  ),
                ),
              ),
            ],
        ),
      ),
    );
  }
}
