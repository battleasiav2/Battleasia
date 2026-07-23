import { Router } from 'express';
import { PaymentChannel } from '../../../models/PaymentChannel.js';
import { requireAuth } from '../../../middleware/auth.js';
import { requireAdmin } from '../../../middleware/admin.js';
import {
  buildSearchFilter,
  paginatedResults,
  parsePagination,
} from '../../../utils/pagination.js';

const router = Router();

router.get('/', requireAdmin, async (req, res) => {
  try {
    const { skip, limit, search } = parsePagination(req);
    const filter = buildSearchFilter(search, ['channel_name', 'description']);

    const [channels, count] = await Promise.all([
      PaymentChannel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      PaymentChannel.countDocuments(filter),
    ]);

    const results = channels.map((ch) => ({
      _id: ch._id.toString(),
      id: ch._id.toString(),
      channel_name: ch.channel_name,
      description: ch.description || '',
      icon: ch.icon || '',
      enabled: ch.enabled,
      createdAt: ch.createdAt,
      updatedAt: ch.updatedAt,
    }));

    return res.json(paginatedResults(results, count));
  } catch (error) {
    console.error('payment channels error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch payment channels' });
  }
});

router.get('/public', requireAuth, async (req, res) => {
  try {
    const { skip, limit } = parsePagination(req);
    const filter = { enabled: true };

    const [channels, count] = await Promise.all([
      PaymentChannel.find(filter).sort({ channel_name: 1 }).skip(skip).limit(limit),
      PaymentChannel.countDocuments(filter),
    ]);

    const results = channels.map((ch) => ({
      _id: ch._id.toString(),
      id: ch._id.toString(),
      channel_name: ch.channel_name,
      description: ch.description || '',
      icon: ch.icon || '',
      enabled: ch.enabled,
    }));

    return res.json(paginatedResults(results, count));
  } catch (error) {
    console.error('public payment channels error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch payment channels' });
  }
});

router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const channel = await PaymentChannel.findById(req.params.id);
    if (!channel) {
      return res.status(404).json({ status: false, message: 'Payment channel not found' });
    }
    return res.json({
      status: true,
      data: {
        _id: channel._id.toString(),
        channel_name: channel.channel_name,
        description: channel.description,
        icon: channel.icon,
        enabled: channel.enabled,
      },
    });
  } catch (error) {
    console.error('get channel error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch payment channel' });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  try {
    const { channel_name, description = '', icon = '' } = req.body;
    if (!channel_name) {
      return res.status(400).json({ status: false, message: 'Channel name is required' });
    }

    const channel = await PaymentChannel.create({ channel_name, description, icon });
    return res.status(201).json({
      status: true,
      data: { _id: channel._id.toString(), channel_name: channel.channel_name, enabled: channel.enabled },
    });
  } catch (error) {
    console.error('create channel error:', error);
    return res.status(500).json({ status: false, message: 'Failed to create payment channel' });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const channel = await PaymentChannel.findById(req.params.id);
    if (!channel) {
      return res.status(404).json({ status: false, message: 'Payment channel not found' });
    }

    const { channel_name, description, icon, enabled } = req.body;
    if (channel_name) channel.channel_name = channel_name;
    if (typeof description === 'string') channel.description = description;
    if (typeof icon === 'string') channel.icon = icon;
    if (typeof enabled === 'boolean') channel.enabled = enabled;

    await channel.save();
    return res.json({ status: true, data: channel });
  } catch (error) {
    console.error('update channel error:', error);
    return res.status(500).json({ status: false, message: 'Failed to update payment channel' });
  }
});

router.patch('/:id/toggle', requireAdmin, async (req, res) => {
  try {
    const channel = await PaymentChannel.findById(req.params.id);
    if (!channel) {
      return res.status(404).json({ status: false, message: 'Payment channel not found' });
    }
    channel.enabled = !channel.enabled;
    await channel.save();
    return res.json({ status: true, data: { enabled: channel.enabled } });
  } catch (error) {
    console.error('toggle channel error:', error);
    return res.status(500).json({ status: false, message: 'Failed to toggle payment channel' });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const channel = await PaymentChannel.findById(req.params.id);
    if (!channel) {
      return res.status(404).json({ status: false, message: 'Payment channel not found' });
    }
    await channel.deleteOne();
    return res.json({ status: true, message: 'Payment channel deleted' });
  } catch (error) {
    console.error('delete channel error:', error);
    return res.status(500).json({ status: false, message: 'Failed to delete payment channel' });
  }
});

export default router;
