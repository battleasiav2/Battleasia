import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { ReferralHistory } from '../models/ReferralHistory.js';
import { getAppSettings } from '../models/AppSettings.js';
import { recordBalanceHistory } from './balance-history.js';
import { notifyBalanceChange } from './balance-notify.js';
export async function resolveReferrerId(referredBy) {
    const trimmed = referredBy.trim();
    if (!trimmed)
        return null;
    if (mongoose.Types.ObjectId.isValid(trimmed)) {
        const byId = await User.findById(trimmed);
        if (byId)
            return byId._id;
    }
    const byCode = await User.findOne({
        referralCode: { $regex: new RegExp(`^${trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
    });
    return byCode?._id ?? null;
}
function roundMoney(value) {
    return Math.round(value * 100) / 100;
}
export async function processReferralCommission(input) {
    const { depositor, depositAmount, depositId, depositSource } = input;
    if (!Number.isFinite(depositAmount) || depositAmount <= 0)
        return null;
    if (!depositor.referredBy)
        return null;
    const referrer = await User.findById(depositor.referredBy);
    if (!referrer || !referrer.status)
        return null;
    if (referrer._id.toString() === depositor._id.toString())
        return null;
    const settings = await getAppSettings();
    const commissionRate = settings.commissionRate ?? 10;
    const commissionAmount = roundMoney((depositAmount * commissionRate) / 100);
    if (commissionAmount <= 0)
        return null;
    const balanceBefore = referrer.balance ?? 0;
    referrer.balance = balanceBefore + commissionAmount;
    await referrer.save();
    const history = await ReferralHistory.create({
        referrerId: referrer._id,
        referredUserId: depositor._id,
        depositAmount,
        commissionRate,
        commissionAmount,
        depositId: depositId ? new mongoose.Types.ObjectId(String(depositId)) : undefined,
        depositSource,
        referredUsername: depositor.username,
        referredEmail: depositor.email,
        status: 'paid',
    });
    await recordBalanceHistory({
        user: referrer,
        amount: commissionAmount,
        type: 'deposit',
        balanceBefore,
        balanceAfter: referrer.balance,
        detail: {
            reason: 'referral_commission',
            referralHistoryId: history._id.toString(),
            referredUserId: depositor._id.toString(),
            referredUsername: depositor.username,
            depositAmount,
            commissionRate,
            depositSource,
            depositId: depositId ? String(depositId) : undefined,
        },
    });
    await notifyBalanceChange(referrer._id.toString(), referrer.balance, balanceBefore);
    return { commissionAmount, commissionRate, historyId: history._id.toString() };
}
