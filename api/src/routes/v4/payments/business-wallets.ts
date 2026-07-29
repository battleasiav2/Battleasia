import { Router } from 'express';
import { BusinessWallet } from '../../../models/BusinessWallet.js';
import { PaymentChannel } from '../../../models/PaymentChannel.js';
import { requireAuth } from '../../../middleware/auth.js';
import { requireAdmin } from '../../../middleware/admin.js';
import { paginatedResults, parsePagination } from '../../../utils/pagination.js';

const router = Router();

function serializeWallet(wallet: InstanceType<typeof BusinessWallet>) {
  const channel = wallet.channel_id as unknown as InstanceType<typeof PaymentChannel> | null;
  return {
    _id: wallet._id.toString(),
    id: wallet._id.toString(),
    channel_id: channel
      ? {
          _id: channel._id.toString(),
          channel_name: channel.channel_name,
          icon: channel.icon || '',
        }
      : wallet.channel_id,
    wallet_address: wallet.wallet_address,
    currency_type: wallet.currency_type,
    enabled: wallet.enabled,
    qr_code: wallet.qr_code || '',
    createdAt: wallet.createdAt,
    updatedAt: wallet.updatedAt,
  };
}

router.get('/', requireAdmin, async (req, res) => {
  try {
    const { skip, limit } = parsePagination(req);
    const filter: Record<string, unknown> = {};
    if (req.query.channelId) filter.channel_id = req.query.channelId;
    if (req.query.currencyType) filter.currency_type = req.query.currencyType;

    const [wallets, count] = await Promise.all([
      BusinessWallet.find(filter)
        .populate('channel_id')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      BusinessWallet.countDocuments(filter),
    ]);

    return res.json(paginatedResults(wallets.map(serializeWallet), count));
  } catch (error) {
    console.error('business wallets error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch business wallets' });
  }
});

router.get('/public', requireAuth, async (req, res) => {
  try {
    const { skip, limit } = parsePagination(req);
    const filter: Record<string, unknown> = { enabled: true };
    const channelId = req.query.channel || req.query.channelId;
    const currency = req.query.currency || req.query.currencyType;
    if (channelId) filter.channel_id = channelId;
    if (currency) filter.currency_type = String(currency).toUpperCase();

    const [wallets, count] = await Promise.all([
      BusinessWallet.find(filter)
        .populate('channel_id')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      BusinessWallet.countDocuments(filter),
    ]);

    return res.json(paginatedResults(wallets.map(serializeWallet), count));
  } catch (error) {
    console.error('public business wallets error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch business wallets' });
  }
});

router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const wallet = await BusinessWallet.findById(req.params.id).populate('channel_id');
    if (!wallet) {
      return res.status(404).json({ status: false, message: 'Business wallet not found' });
    }
    return res.json({ status: true, data: serializeWallet(wallet) });
  } catch (error) {
    console.error('get wallet error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch business wallet' });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  try {
    const { channel_id, wallet_address, currency_type } = req.body;
    if (!channel_id || !wallet_address || !currency_type) {
      return res.status(400).json({ status: false, message: 'channel_id, wallet_address and currency_type are required' });
    }

    const channel = await PaymentChannel.findById(channel_id);
    if (!channel) {
      return res.status(404).json({ status: false, message: 'Payment channel not found' });
    }

    const wallet = await BusinessWallet.create({ channel_id, wallet_address, currency_type });
    await wallet.populate('channel_id');
    return res.status(201).json({ status: true, data: serializeWallet(wallet) });
  } catch (error) {
    console.error('create wallet error:', error);
    return res.status(500).json({ status: false, message: 'Failed to create business wallet' });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const wallet = await BusinessWallet.findById(req.params.id);
    if (!wallet) {
      return res.status(404).json({ status: false, message: 'Business wallet not found' });
    }

    const { channel_id, wallet_address, currency_type, enabled } = req.body;
    if (channel_id) wallet.channel_id = channel_id;
    if (wallet_address) wallet.wallet_address = wallet_address;
    if (currency_type) wallet.currency_type = currency_type;
    if (typeof enabled === 'boolean') wallet.enabled = enabled;

    await wallet.save();
    await wallet.populate('channel_id');
    return res.json({ status: true, data: serializeWallet(wallet) });
  } catch (error) {
    console.error('update wallet error:', error);
    return res.status(500).json({ status: false, message: 'Failed to update business wallet' });
  }
});

router.patch('/:id/toggle', requireAdmin, async (req, res) => {
  try {
    const wallet = await BusinessWallet.findById(req.params.id);
    if (!wallet) {
      return res.status(404).json({ status: false, message: 'Business wallet not found' });
    }
    wallet.enabled = !wallet.enabled;
    await wallet.save();
    return res.json({ status: true, data: { enabled: wallet.enabled } });
  } catch (error) {
    console.error('toggle wallet error:', error);
    return res.status(500).json({ status: false, message: 'Failed to toggle business wallet' });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const wallet = await BusinessWallet.findById(req.params.id);
    if (!wallet) {
      return res.status(404).json({ status: false, message: 'Business wallet not found' });
    }
    await wallet.deleteOne();
    return res.json({ status: true, message: 'Business wallet deleted' });
  } catch (error) {
    console.error('delete wallet error:', error);
    return res.status(500).json({ status: false, message: 'Failed to delete business wallet' });
  }
});

export default router;
