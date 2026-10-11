import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:battleasia_app/core/services/shop_service.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/data/models/shop_item_model.dart';
import 'package:battleasia_app/presentation/screens/shop/shop_screen.dart';
import 'package:battleasia_app/presentation/widgets/shop/shop_auth.dart';
import 'package:battleasia_app/presentation/widgets/shop/shop_auth_gate.dart';
import 'package:battleasia_app/presentation/widgets/shop/shop_buy_flow.dart';

/// Legacy deep-link / login resume entry: opens [showShopBuyFlow] then the shop grid.
class ShopDetailScreen extends StatefulWidget {
  const ShopDetailScreen({
    super.key,
    required this.itemId,
    this.preferredChannelId,
  });

  final String itemId;
  final String? preferredChannelId;

  @override
  State<ShopDetailScreen> createState() => _ShopDetailScreenState();
}

class _ShopDetailScreenState extends State<ShopDetailScreen> {
  final ShopService _shopService = ShopService();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _resumePurchase());
  }

  Future<void> _goShop() async {
    if (!mounted) return;
    await openShopRoute(context, const ShopScreen(), routeName: '/shop');
  }

  List<Map<String, dynamic>>? _channelPayload(Map<String, dynamic>? result) {
    if (result == null || result['success'] != true || result['data'] == null) {
      return null;
    }
    final data = result['data'];
    final list = data is Map
        ? (data['results'] as List? ?? [])
        : (data is List ? data : []);
    return list
        .whereType<Map>()
        .map((e) => Map<String, dynamic>.from(e))
        .where((c) => c['enabled'] == true)
        .toList();
  }

  List<Map<String, dynamic>>? _ratePayload(Map<String, dynamic>? result) {
    if (result == null || result['success'] != true || result['data'] is! List) {
      return null;
    }
    return (result['data'] as List)
        .whereType<Map>()
        .map((e) => Map<String, dynamic>.from(e))
        .toList();
  }

  ShopItemModel? _itemFromList(Map<String, dynamic> result) {
    if (result['success'] != true || result['data'] == null) return null;
    final data = result['data'] as Map<String, dynamic>;
    final payload = data['results'] ?? data;
    final items = payload is List ? payload : (payload['results'] as List? ?? []);
    for (final row in items) {
      if (row is! Map) continue;
      final id = row['_id']?.toString() ?? row['id']?.toString() ?? '';
      if (id == widget.itemId) {
        return ShopItemModel.fromJson(Map<String, dynamic>.from(row));
      }
    }
    return null;
  }

  Future<void> _resumePurchase() async {
    try {
      final results = await Future.wait<Map<String, dynamic>>([
        _shopService.getShopItemById(widget.itemId),
        _shopService.getPaymentChannels(),
        _shopService.getCurrencyRates(),
        _shopService.getShopItems(),
      ]);

      ShopItemModel? item;
      final byId = results[0];
      if (byId['success'] == true && byId['data'] is Map) {
        item = ShopItemModel.fromJson(
          Map<String, dynamic>.from(byId['data'] as Map),
        );
      } else {
        item = _itemFromList(results[3]);
      }

      if (!mounted) return;

      if (item == null || !item.isActive) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('shop.packNotFound'.tr())),
        );
        await _goShop();
        return;
      }

      await showShopBuyFlow(
        context,
        item: item,
        preferredChannelId: widget.preferredChannelId,
        preloadedChannels: _channelPayload(results[1]),
        preloadedRates: _ratePayload(results[2]),
      );

      if (!mounted) return;
      await _goShop();
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('shop.paymentDetailsFail'.tr())),
      );
      await _goShop();
    }
  }

  @override
  Widget build(BuildContext context) {
    return ShopAuthGate(
      afterLoginScreen: ShopDetailScreen(
        itemId: widget.itemId,
        preferredChannelId: widget.preferredChannelId,
      ),
      child: Scaffold(
        backgroundColor: AppTheme.backgroundColor,
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const CircularProgressIndicator(),
              const SizedBox(height: 16),
              Text(
                'shop.openingPack'.tr(),
                style: AppTheme.bodyMedium.copyWith(color: Colors.white70),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
