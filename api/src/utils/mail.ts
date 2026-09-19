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
