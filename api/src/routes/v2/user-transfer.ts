import { Router } from 'express';
import { requireAuth, type AuthedRequest } from '../../middleware/auth.js';
import { UserTransferHistory, serializeUserTransferHistory } from '../../models/UserTransferHistory.js';
import { paginatedResults, parsePagination } from '../../utils/pagination.js';
import {
  executeUserTransfer,
  getTransferSettingsForClient,
} from '../../utils/user-transfer.js';

const router = Router();

router.get('/settings', requireAuth, async (_req, res) => {
  try {
    const settings = await getTransferSettingsForClient();
    return res.json({ status: true, data: settings });
  } catch (error) {
    console.error('transfer settings error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch transfer settings' });
  }
});

router.post('/', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { recipientUsername, amount, note } = req.body as {
      recipientUsername?: string;
      amount?: number;
      note?: string;
    };

    const result = await executeUserTransfer({
      senderId: String(req.userId),
      recipientUsername: String(recipientUsername || ''),
      amount: Number(amount),
      note,
    });

    return res.json({
      status: true,
      message: 'Transfer completed successfully',
      data: result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Transfer failed';
    const statusCode = message === 'Unauthorized' ? 401 : 400;
    if (statusCode >= 500) {
      console.error('transfer error:', error);
    }
    return res.status(statusCode).json({ status: false, message });
  }
});

router.get('/history', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ status: false, message: 'Unauthorized' });
    }

    const { skip, limit } = parsePagination(req);

    const filter = {
      $or: [{ senderId: userId }, { recipientId: userId }],
      status: 'completed',
    };

    const [records, count] = await Promise.all([
      UserTransferHistory.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      UserTransferHistory.countDocuments(filter),
    ]);

    const results = records.map((item) => serializeUserTransferHistory(item, userId));
    return res.json(paginatedResults(results, count));
  } catch (error) {
    console.error('transfer history error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch transfer history' });
  }
});

export default router;
