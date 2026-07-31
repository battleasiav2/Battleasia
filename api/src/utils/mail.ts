import nodemailer from 'nodemailer';
import {
  getAppSettings,
  normalizeMailSettings,
  type MailSettings,
} from '../models/AppSettings.js';
import { env } from '../config/env.js';
import { logAuthCode } from './auth-log.js';

type AuthMailType = 'signup' | 'reset' | 'admin_login';

let warnedMailDisabled = false;

const MAIL_COPY: Record<AuthMailType, { subject: string; intro: string; ttl: string }> = {
  signup: {
    subject: 'Verify your BattleAsia email',
    intro: 'Use this code to verify your BattleAsia account:',
    ttl: '15 minutes',
  },
  reset: {
    subject: 'BattleAsia password reset code',
    intro: 'Use this code to reset your BattleAsia password:',
    ttl: '15 minutes',
  },
  admin_login: {
    subject: 'BattleAsia admin login code',
    intro: 'Use this code to complete your admin sign in:',
    ttl: '10 minutes',
  },
};

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

export async function sendVerificationCodeEmail(
  email: string,
  code: string,
  type: AuthMailType
) {
  const copy = MAIL_COPY[type];
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;">
      <p>${copy.intro}</p>
      <p style="font-size:28px;font-weight:700;letter-spacing:4px;margin:16px 0;">${code}</p>
      <p>This code expires in ${copy.ttl}.</p>
      <p style="color:#666;font-size:13px;">If you did not request this, you can ignore this email.</p>
    </div>
  `;

  const result = await sendAuthEmail({
    to: email,
    subject: copy.subject,
    html,
    text: `${copy.intro} ${code}. Expires in ${copy.ttl}.`,
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
    html: '<p>Your BattleAsia mail configuration is working.</p>',
    text: 'Your BattleAsia mail configuration is working.',
  });
}
