import nodemailer from 'nodemailer';
import {
  getAppSettings,
  normalizeMailSettings,
  type MailSettings,
} from '../models/AppSettings.js';
import { env } from '../config/env.js';
import { logAuthCode } from './auth-log.js';
import {
  authMailCopy,
  mailExpiresLabel,
  mailFoot,
  opsMailCopy,
  pickMailLocale,
  type AuthMailType,
  type MailLocale,
  type OpsMailKind,
} from './mail-copy.js';

export type { AuthMailType, MailLocale, OpsMailKind };

let warnedMailDisabled = false;

function envMailSettings(): MailSettings | null {
  const { mail } = env;
  if (!mail.host || !mail.fromEmail) {
    return null;
  }

  return {
    enabled: true,
    smtpHost: mail.host,
    smtpPort: mail.port,
    secure: mail.secure,
    smtpUser: mail.user,
    smtpPass: mail.pass,
    fromName: mail.fromName,
    fromEmail: mail.fromEmail,
  };
}

async function loadMailSettings(): Promise<MailSettings> {
  const settings = await getAppSettings();
  const fromDb = normalizeMailSettings(settings.mail);

  if (fromDb.enabled && fromDb.smtpHost && fromDb.fromEmail) {
    return fromDb;
  }

  return envMailSettings() ?? fromDb;
}

export async function sendAuthEmail(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  const mail = await loadMailSettings();

  if (!mail.enabled || !mail.smtpHost || !mail.fromEmail) {
    if (!warnedMailDisabled) {
      warnedMailDisabled = true;
      console.warn(
        '[mail] SMTP is not configured — verification codes cannot be delivered. ' +
          'Set it in Admin > Settings > Mail, or via SMTP_HOST / SMTP_USER / SMTP_PASS / MAIL_FROM.'
      );
    }
    return { sent: false, reason: 'mail_disabled' as const };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: mail.smtpHost,
      port: mail.smtpPort,
      secure: mail.secure,
      auth: mail.smtpUser
        ? {
            user: mail.smtpUser,
            pass: mail.smtpPass,
          }
        : undefined,
    });

    await transporter.sendMail({
      from: `"${mail.fromName}" <${mail.fromEmail}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    return { sent: true as const };
  } catch (error) {
    console.error('[mail] send failed:', error);
    return { sent: false, reason: 'send_failed' as const };
  }
}

function auroraHtml(title: string, body: string, locale: MailLocale = 'en') {
  return `<!doctype html><html lang="${locale}"><body style="margin:0;background:#0E0F14;color:#F4F5F7;font-family:Arial,sans-serif">
  <div style="max-width:520px;margin:24px auto;padding:32px;background:#171922;border:1px solid rgba(255,255,255,.1);border-radius:16px">
    <p style="margin:0 0 8px;font-size:12px;letter-spacing:.2em;color:#21D4FD">BATTLE ASIA 2.0</p>
    <h1 style="margin:0 0 16px;font-size:22px;background:linear-gradient(90deg,#7C5CFF,#21D4FD);-webkit-background-clip:text;color:transparent">${title}</h1>
    ${body}
    <p style="margin:24px 0 0;color:#9AA0B4;font-size:12px">${mailFoot(locale)}</p>
  </div></body></html>`;
}

export async function sendVerificationCodeEmail(
  email: string,
  code: string,
  type: AuthMailType,
  localeRaw?: string | string[] | null
) {
  const locale = pickMailLocale(localeRaw);
  const copy = authMailCopy(locale, type);
  const html = auroraHtml(
    copy.subject,
    `<p>${copy.intro}</p><p style="font-size:28px;font-weight:700;letter-spacing:6px;margin:16px 0">${code}</p><p>${mailExpiresLabel(locale)} ${copy.ttl}.</p>`,
    locale
  );

  const result = await sendAuthEmail({
    to: email,
    subject: copy.subject,
    html,
    text: `${copy.intro} ${code}. ${mailExpiresLabel(locale)} ${copy.ttl}.`,
  });

  if (!result.sent) {
    logAuthCode(`${type} code`, email, code);
  }

  return result;
}

export async function sendTestMail(to: string) {
  return sendAuthEmail({
    to,
    subject: 'BattleAsia SMTP test',
    html: auroraHtml('SMTP test', '<p>Your BattleAsia mail configuration is working.</p>', 'en'),
    text: 'Your BattleAsia mail configuration is working.',
  });
}

export async function sendOpsEmail(
  to: string,
  kind: OpsMailKind,
  detail: string,
  localeRaw?: string | string[] | null
) {
  const locale = pickMailLocale(localeRaw);
  const copy = opsMailCopy(locale, kind);
  return sendAuthEmail({
    to,
    subject: copy.subject,
    html: auroraHtml(copy.subject, `<p>${copy.intro}</p><p>${detail}</p>`, locale),
    text: `${copy.intro} ${detail}`,
  });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function absolutePublicUrl(pathOrUrl: string): string {
  const raw = String(pathOrUrl || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  const base = (env.appUrl || env.corsOrigins[0] || '').replace(/\/$/, '');
  if (!base) return raw.startsWith('/') ? raw : `/${raw}`;
  const path = raw.startsWith('/') ? raw : `/${raw}`;
  return `${base}${path}`;
}

export type SiteNoticeMailPayload = {
  title: string;
  message: string;
  imageUrl?: string;
  ctaLabel?: string;
  ctaUrl?: string;
};

export async function sendSiteNoticeEmail(to: string, notice: SiteNoticeMailPayload) {
  const title = String(notice.title || 'BattleAsia Notice').trim() || 'BattleAsia Notice';
  const message = String(notice.message || '').trim();
  const imageUrl = absolutePublicUrl(String(notice.imageUrl || ''));
  const ctaLabel = String(notice.ctaLabel || '').trim();
  const ctaUrl = absolutePublicUrl(String(notice.ctaUrl || '')) || absolutePublicUrl('/dashboard');

  const safeTitle = escapeHtml(title);
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br/>');
  const imageBlock = imageUrl
    ? `<p style="margin:0 0 16px"><img src="${escapeHtml(imageUrl)}" alt="" style="display:block;width:100%;max-width:456px;border-radius:12px;border:1px solid rgba(255,255,255,.08)"/></p>`
    : '';
  const ctaBlock =
    ctaLabel && ctaUrl
      ? `<p style="margin:20px 0 0"><a href="${escapeHtml(ctaUrl)}" style="display:inline-block;padding:12px 20px;border-radius:10px;background:linear-gradient(90deg,#7C5CFF,#21D4FD);color:#0E0F14;font-weight:700;text-decoration:none">${escapeHtml(ctaLabel)}</a></p>`
      : '';

  const html = auroraHtml(
    safeTitle,
    `${imageBlock}<p style="margin:0;line-height:1.55;color:#D7DBE8">${safeMessage || 'A new notice is waiting for you in BattleAsia.'}</p>${ctaBlock}`,
    'en'
  );

  return sendAuthEmail({
    to,
    subject: title.slice(0, 120),
    html,
    text: [title, message, ctaLabel && ctaUrl ? `${ctaLabel}: ${ctaUrl}` : ''].filter(Boolean).join('\n\n'),
  });
}

/** Email all non-admin players. Runs in batches; returns counts (does not throw on per-user failures). */
export async function broadcastSiteNoticeEmail(notice: SiteNoticeMailPayload) {
  const { User } = await import('../models/User.js');
  const users = await User.find({ 'role.type': { $ne: 'admin' }, email: { $exists: true, $ne: '' } })
    .select('email')
    .lean();

  const emails = [
    ...new Set(
      users
        .map((u) => String((u as { email?: string }).email || '').trim().toLowerCase())
        .filter((e) => e.includes('@'))
    ),
  ];

  let sent = 0;
  let failed = 0;
  const batchSize = 20;
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map((email) =>
        sendSiteNoticeEmail(email, notice).catch(() => ({ sent: false as const, reason: 'send_failed' as const }))
      )
    );
    for (const result of results) {
      if (result.sent) sent += 1;
      else failed += 1;
    }
  }

  return { total: emails.length, sent, failed };
}
