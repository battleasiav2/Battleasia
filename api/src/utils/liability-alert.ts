import { User } from '../models/User.js';
import { getAppSettings } from '../models/AppSettings.js';
import { sendAuthEmail } from './mail.js';

export async function maybeAlertLiability() {
  try {
    const [users, settings] = await Promise.all([
      User.aggregate<{ total: number }>([{ $group: { _id: null, total: { $sum: '$balance' } } }]),
      getAppSettings(),
    ]);
    const liability = Number(users[0]?.total || 0);
    const reserve = Number(settings.reserveBac || 0);
    if (!(reserve > 0 && liability > reserve)) return;

    const last = Number((settings as { lastLiabilityAlertAt?: number }).lastLiabilityAlertAt || 0);
    if (Date.now() - last < 6 * 60 * 60 * 1000) return;
    (settings as { lastLiabilityAlertAt?: number }).lastLiabilityAlertAt = Date.now();
    await settings.save();

    const to = settings.mail?.fromEmail || process.env.MAIL_FROM || '';
    if (!to) return;
    await sendAuthEmail({
      to,
      subject: 'BattleAsia liability above reserve',
      html: `<p>Player balances (${liability} BAC) are above reserve (${reserve} BAC).</p>`,
      text: `Player balances ${liability} BAC exceed reserve ${reserve} BAC.`,
    });
  } catch (error) {
    console.error('liability alert failed:', error);
  }
}
