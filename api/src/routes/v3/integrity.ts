import { Router } from 'express';
import { User } from '../../models/User.js';
import { SupportConversation } from '../../models/SupportConversation.js';
import { requireAuth, type AuthedRequest } from '../../middleware/auth.js';
import { requireAdmin } from '../../middleware/admin.js';
import { paginatedWithTotal, parsePagination } from '../../utils/pagination.js';
import { getAppSettings } from '../../models/AppSettings.js';
import { LoginHistory } from '../../models/LoginHistory.js';
import { FraudHold } from '../../models/FraudHold.js';
import { DepositHistory } from '../../models/DepositHistory.js';
import { WithdrawalHistory } from '../../models/WithdrawalHistory.js';
import { LabEntity } from '../../models/LabEntity.js';
import { getOpsStatus } from '../../utils/health.js';
import { AuditLog, writeAudit } from '../../models/AuditLog.js';
import { KycRecord } from '../../models/KycRecord.js';
import { DeviceFingerprint } from '../../models/DeviceFingerprint.js';
import { MatchReport } from '../../models/MatchReport.js';
import { Dispute } from '../../models/Dispute.js';
import mongoose from 'mongoose';

async function actorMeta(req: AuthedRequest) {
  if (!req.userId) return { actorId: '', actorEmail: '', actorName: '' };
  const actor = await User.findById(req.userId).select('email username');
  return {
    actorId: req.userId,
    actorEmail: actor?.email || '',
    actorName: actor?.username || '',
  };
}

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/ops', async (_req, res) => {
  return res.json({ status: true, data: await getOpsStatus() });
});

router.get('/kyc', async (req, res) => {
  const { skip, limit } = parsePagination(req);
  const filter: Record<string, unknown> = { status: { $in: ['pending', 'approved', 'rejected'] } };
  if (req.query.status) filter.status = String(req.query.status);
  const [rows, total] = await Promise.all([
    KycRecord.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit),
    KycRecord.countDocuments(filter),
  ]);
  const users = await User.find({ _id: { $in: rows.map((r) => r.userId) } }).select('username email');
  const byId = new Map(users.map((u) => [u._id.toString(), u]));
  if (total === 0) {
    const userFilter: Record<string, unknown> = { kycStatus: { $in: ['pending', 'approved', 'rejected'] } };
    if (req.query.status) userFilter.kycStatus = String(req.query.status);
    const [legacy, legacyTotal] = await Promise.all([
      User.find(userFilter).select('username email kycStatus dateOfBirth').sort({ updatedAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(userFilter),
    ]);
    return res.json(
      paginatedWithTotal(
        legacy.map((u) => ({
          id: u._id.toString(),
          userId: u._id.toString(),
          username: u.username,
          email: u.email,
          status: u.kycStatus || 'none',
          dateOfBirth: u.dateOfBirth || null,
        })),
        legacyTotal,
      ),
    );
  }
  return res.json(
    paginatedWithTotal(
      rows.map((r) => {
        const u = byId.get(r.userId.toString());
        return {
          id: r._id.toString(),
          userId: r.userId.toString(),
          username: u?.username || '',
          email: u?.email || '',
          status: r.status,
          dateOfBirth: r.dateOfBirth || null,
        };
      }),
      total,
    ),
  );
});

router.patch('/kyc/:id', async (req: AuthedRequest, res) => {
  const status = String(req.body?.status || '').trim();
  if (!['pending', 'approved', 'rejected', 'none'].includes(status)) {
    return res.status(400).json({ status: false, message: 'Invalid KYC status' });
  }
  let rec = mongoose.isValidObjectId(req.params.id) ? await KycRecord.findById(req.params.id) : null;
  if (!rec && mongoose.isValidObjectId(req.params.id)) rec = await KycRecord.findOne({ userId: req.params.id });
  const userId = rec?.userId || req.params.id;
  const user = await User.findByIdAndUpdate(userId, { $set: { kycStatus: status } }, { new: true }).select(
    'username kycStatus dateOfBirth'
  );
  if (!user) return res.status(404).json({ status: false, message: 'User not found' });
  if (rec) {
    rec.status = status as typeof rec.status;
    rec.reviewerId = req.userId ? new mongoose.Types.ObjectId(req.userId) : undefined;
    rec.reviewedAt = new Date();
    await rec.save();
  } else {
    await KycRecord.findOneAndUpdate(
      { userId: user._id },
      {
        $set: { status, reviewerId: req.userId, reviewedAt: new Date(), dateOfBirth: user.dateOfBirth },
        $setOnInsert: { userId: user._id },
      },
      { upsert: true },
    );
  }
  const actor = await actorMeta(req);
  await writeAudit({
    ...actor,
    action: 'kyc.status',
    target: user._id.toString(),
    detail: `${user.username || 'user'} → ${status}`,
  });
  return res.json({
    status: true,
    data: { id: rec?._id.toString() || user._id.toString(), username: user.username, status },
  });
});

router.get('/fingerprints', async (req, res) => {
  const { skip, limit } = parsePagination(req);
  const grouped = await DeviceFingerprint.aggregate<{ _id: string; users: unknown[]; count: number; lastAt: Date; ip: string }>([
    { $group: { _id: '$hash', users: { $addToSet: '$userId' }, count: { $sum: 1 }, lastAt: { $max: '$lastSeen' }, ip: { $last: '$ip' } } },
    { $match: { 'users.1': { $exists: true } } },
    { $sort: { lastAt: -1 } },
    { $skip: skip },
    { $limit: limit },
  ]);
  const totalRows = await DeviceFingerprint.aggregate([
    { $group: { _id: '$hash', users: { $addToSet: '$userId' } } },
    { $match: { 'users.1': { $exists: true } } },
    { $count: 'n' },
  ]);
  if (grouped.length || totalRows[0]?.n) {
    return res.json(
      paginatedWithTotal(
        grouped.map((row) => ({
          id: row._id,
          hash: row._id,
          ip: row.ip,
          accounts: row.users.map(String),
          devices: row.count,
          updatedAt: row.lastAt,
          multiAccount: true,
        })),
        totalRows[0]?.n || 0,
      ),
    );
  }
  const legacy = await LoginHistory.aggregate<{ _id: string; users: string[]; count: number; lastAt: Date }>([
    { $match: { ip: { $ne: '' } } },
    { $group: { _id: '$ip', users: { $addToSet: '$userId' }, count: { $sum: 1 }, lastAt: { $max: '$createdAt' } } },
    { $match: { 'users.1': { $exists: true } } },
    { $sort: { lastAt: -1 } },
    { $skip: skip },
    { $limit: limit },
  ]);
  const legacyTotal = await LoginHistory.aggregate([
    { $match: { ip: { $ne: '' } } },
    { $group: { _id: '$ip', users: { $addToSet: '$userId' } } },
    { $match: { 'users.1': { $exists: true } } },
    { $count: 'n' },
  ]);
  return res.json(
    paginatedWithTotal(
      legacy.map((row) => ({
        id: row._id,
        ip: row._id,
        accounts: row.users.map(String),
        logins: row.count,
        updatedAt: row.lastAt,
        multiAccount: true,
      })),
      legacyTotal[0]?.n || 0,
    ),
  );
});

router.get('/ledger', async (_req, res) => {
  const users = await User.aggregate([{ $group: { _id: null, total: { $sum: '$balance' }, count: { $sum: 1 } } }]);
  const settings = await getAppSettings();
  const [pendingDeposits, pendingWithdrawals] = await Promise.all([
    DepositHistory.aggregate([{ $match: { status: 'pending' } }, { $group: { _id: null, total: { $sum: '$coin_amount' } } }]),
    WithdrawalHistory.aggregate([
      { $match: { status: { $in: ['pending', 'processing'] } } },
      { $group: { _id: null, total: { $sum: '$coin_amount' } } },
    ]),
  ]);
  const liability = Number(users[0]?.total || 0);
  const reserve = Number(settings.reserveBac || 0);
  const pendingIn = Number(pendingDeposits[0]?.total || 0);
  const pendingOut = Number(pendingWithdrawals[0]?.total || 0);
  const alert = reserve > 0 && liability > reserve;
  if (alert) void import('../../utils/liability-alert.js').then((m) => m.maybeAlertLiability());
  return res.json({
    status: true,
    data: {
      results: [
        {
          id: 'liability',
          label: 'Player balances',
          amount: liability,
          users: users[0]?.count || 0,
          reserve,
          pendingDeposits: pendingIn,
          pendingWithdrawals: pendingOut,
          alert,
        },
      ],
    },
  });
});

router.put('/reserve', async (req: AuthedRequest, res) => {
  const n = Number(req.body?.reserveBac);
  if (!Number.isFinite(n) || n < 0) {
    return res.status(400).json({ status: false, message: 'reserveBac must be a non-negative number' });
  }
  const settings = await getAppSettings();
  const prev = Number(settings.reserveBac || 0);
  settings.reserveBac = n;
  await settings.save();
  const actor = await actorMeta(req);
  await writeAudit({
    ...actor,
    action: 'reserve.set',
    target: 'appsettings',
    detail: `${prev} → ${n} BAC`,
  });
  return res.json({ status: true, data: { reserveBac: settings.reserveBac } });
});

router.put('/high-value', async (req: AuthedRequest, res) => {
  const n = Number(req.body?.highValueWithdrawBac);
  if (!Number.isFinite(n) || n <= 0) {
    return res.status(400).json({ status: false, message: 'highValueWithdrawBac must be a positive number' });
  }
  const settings = await getAppSettings();
  const prev = Number(settings.highValueWithdrawBac || 1000);
  settings.highValueWithdrawBac = n;
  await settings.save();
  const actor = await actorMeta(req);
  await writeAudit({
    ...actor,
    action: 'highValue.set',
    target: 'appsettings',
    detail: `${prev} → ${n} BAC`,
  });
  return res.json({ status: true, data: { highValueWithdrawBac: settings.highValueWithdrawBac } });
});

router.get('/fraud-holds', async (req, res) => {
  const { skip, limit } = parsePagination(req);
  const filter: Record<string, unknown> = {};
  if (req.query.status) filter.status = String(req.query.status);
  const [rows, total] = await Promise.all([
    FraudHold.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    FraudHold.countDocuments(filter),
  ]);
  return res.json(
    paginatedWithTotal(
      rows.map((h) => ({
        id: h._id.toString(),
        userId: h.userId.toString(),
        kind: h.kind,
        reason: h.reason,
        status: h.status,
        createdAt: h.createdAt,
      })),
      total,
    ),
  );
});

router.patch('/fraud-holds/:id', async (req: AuthedRequest, res) => {
  const hold = await FraudHold.findById(req.params.id);
  if (!hold) return res.status(404).json({ status: false, message: 'Hold not found' });
  hold.status = String(req.body?.status || 'released') === 'open' ? 'open' : 'released';
  if (hold.status === 'released') hold.releasedAt = new Date();
  await hold.save();
  const actor = await actorMeta(req);
  await writeAudit({
    ...actor,
    action: hold.status === 'released' ? 'hold.released' : 'hold.opened',
    target: hold._id.toString(),
    detail: `${hold.kind} ${hold.reason || ''}`.trim(),
  });
  return res.json({ status: true, data: { id: hold._id.toString(), status: hold.status } });
});

router.get('/match-reports', async (req, res) => {
  const { skip, limit } = parsePagination(req);
  const filter: Record<string, unknown> = {};
  if (req.query.status) filter.status = String(req.query.status);
  const [rows, total] = await Promise.all([
    MatchReport.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    MatchReport.countDocuments(filter),
  ]);
  return res.json(
    paginatedWithTotal(
      rows.map((r) => ({
        id: r._id.toString(),
        matchId: r.matchId.toString(),
        reporterId: r.reporterId.toString(),
        targetUserId: r.targetUserId.toString(),
        reason: r.reason,
        detail: r.detail,
        status: r.status,
        createdAt: r.createdAt,
      })),
      total,
    ),
  );
});

router.patch('/match-reports/:id', async (req: AuthedRequest, res) => {
  const status = String(req.body?.status || '').trim();
  if (!['open', 'reviewed', 'dismissed'].includes(status)) {
    return res.status(400).json({ status: false, message: 'Invalid report status' });
  }
  const row = await MatchReport.findByIdAndUpdate(req.params.id, { $set: { status } }, { new: true });
  if (!row) return res.status(404).json({ status: false, message: 'Report not found' });
  const actor = await actorMeta(req);
  await writeAudit({
    ...actor,
    action: 'match-report.status',
    target: row._id.toString(),
    detail: `${row.reason} → ${status}`,
  });
  return res.json({ status: true, data: { id: row._id.toString(), status: row.status } });
});

router.get('/disputes', async (req, res) => {
  const { skip, limit } = parsePagination(req);
  const filter: Record<string, unknown> = {};
  if (req.query.status) filter.status = String(req.query.status);
  const [rows, total] = await Promise.all([
    Dispute.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit),
    Dispute.countDocuments(filter),
  ]);
  if (total === 0 && !req.query.status) {
    const [legacy, legacyTotal] = await Promise.all([
      SupportConversation.find({ status: { $ne: 'closed' }, category: 'match' }).sort({ updatedAt: -1 }).skip(skip).limit(limit),
      SupportConversation.countDocuments({ status: { $ne: 'closed' }, category: 'match' }),
    ]);
    return res.json(
      paginatedWithTotal(
        legacy.map((c) => ({
          id: c._id.toString(),
          subject: c.subject,
          status: c.status,
          updatedAt: c.updatedAt,
        })),
        legacyTotal,
      ),
    );
  }
  return res.json(
    paginatedWithTotal(
      rows.map((d) => ({
        id: d._id.toString(),
        userId: d.userId.toString(),
        matchId: d.matchId?.toString() || '',
        subject: d.subject,
        evidence: d.evidenceUrls.length,
        status: d.status,
        updatedAt: d.updatedAt,
      })),
      total,
    ),
  );
});

router.patch('/disputes/:id', async (req: AuthedRequest, res) => {
  const status = String(req.body?.status || '').trim();
  if (!['open', 'reviewing', 'resolved', 'rejected'].includes(status)) {
    return res.status(400).json({ status: false, message: 'Invalid dispute status' });
  }
  const row = await Dispute.findById(req.params.id);
  if (!row) return res.status(404).json({ status: false, message: 'Dispute not found' });
  row.status = status as typeof row.status;
  if (typeof req.body?.resolution === 'string') row.resolution = String(req.body.resolution).slice(0, 500);
  await row.save();
  const actor = await actorMeta(req);
  await writeAudit({
    ...actor,
    action: 'dispute.status',
    target: row._id.toString(),
    detail: `${row.subject || 'dispute'} → ${status}`,
  });
  return res.json({ status: true, data: { id: row._id.toString(), status: row.status } });
});

router.get('/ocr', async (req, res) => {
  const { skip, limit } = parsePagination(req);
  const [rows, total] = await Promise.all([
    LabEntity.find({ kind: 'ocr' }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    LabEntity.countDocuments({ kind: 'ocr' }),
  ]);
  return res.json(
    paginatedWithTotal(
      rows.map((r) => ({
        id: r._id.toString(),
        title: r.title,
        hostName: r.hostName,
        status: r.status,
        imageUrl: r.imageUrl,
        createdAt: r.createdAt,
      })),
      total,
    ),
  );
});

router.patch('/ocr/:id', async (req: AuthedRequest, res) => {
  const status = String(req.body?.status || '') === 'rejected' ? 'rejected' : 'accepted';
  const row = await LabEntity.findOne({ _id: req.params.id, kind: 'ocr' });
  if (!row) return res.status(404).json({ status: false, message: 'OCR ticket not found' });
  row.status = status;
  await row.save();
  await writeAudit({
    ...(await actorMeta(req)),
    action: 'ocr.status',
    target: row._id.toString(),
    detail: `${row.title} → ${status}`,
  });
  return res.json({ status: true, data: { id: row._id.toString(), status: row.status } });
});

router.get('/audit', async (req, res) => {
  const { skip, limit } = parsePagination(req);
  const [written, logins] = await Promise.all([
    AuditLog.find().sort({ createdAt: -1 }).limit(200),
    LoginHistory.find().sort({ createdAt: -1 }).limit(100).select('email username ip createdAt'),
  ]);
  const rows = [
    ...written.map((row) => ({
      id: row._id.toString(),
      action: row.action,
      actor: row.actorEmail || row.actorName || 'staff',
      target: row.target,
      detail: row.detail,
      createdAt: row.createdAt,
    })),
    ...logins.map((row) => ({
      id: `login:${row._id.toString()}`,
      action: 'auth.login',
      actor: row.email || row.username || 'user',
      target: row.username || '',
      detail: row.ip || '',
      createdAt: row.createdAt,
    })),
  ].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  const total = rows.length;
  return res.json(paginatedWithTotal(rows.slice(skip, skip + limit), total));
});

export default router;
