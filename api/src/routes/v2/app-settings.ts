import { Router } from 'express';
import type express from 'express';
import multer from 'multer';
import fs from 'fs';
import { requireAuth } from '../../middleware/auth.js';
import { requireAdmin } from '../../middleware/admin.js';
import {
  getAppSettings,
  normalizeAppDownloadSettings,
  normalizeMailSettings,
  serializeMailSettingsForAdmin,
  type AppDownloadSettings,
  type MailSettings,
} from '../../models/AppSettings.js';
import { sendTestMail } from '../../utils/mail.js';
import { appDownloadDir, appDownloadFileName, appDownloadPath } from '../../utils/uploads-path.js';

const router = Router();

function ensureAppDownloadDir() {
  if (!fs.existsSync(appDownloadDir)) {
    fs.mkdirSync(appDownloadDir, { recursive: true });
  }
}

function isApkBuffer(buffer: Buffer) {
  return buffer.length >= 4 && buffer[0] === 0x50 && buffer[1] === 0x4b;
}

const APK_MAX_BYTES = Math.max(Number(process.env.APP_APK_MAX_MB) || 500, 50) * 1024 * 1024;

const apkUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: APK_MAX_BYTES },
  fileFilter: (_req, file, cb) => {
    const allowed =
      file.mimetype === 'application/vnd.android.package-archive' ||
      file.mimetype === 'application/octet-stream' ||
      file.originalname.toLowerCase().endsWith('.apk');
    cb(null, allowed);
  },
});

function handleApkUpload(req: express.Request, res: express.Response, next: express.NextFunction) {
  apkUpload.single('apk')(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        const maxMb = Math.round(APK_MAX_BYTES / (1024 * 1024));
        return res.status(413).json({
          status: false,
          message: `APK file is too large. Maximum allowed size is ${maxMb} MB.`,
        });
      }
      return res.status(400).json({ status: false, message: error.message || 'Invalid upload' });
    }

    console.error('apk upload middleware error:', error);
    return res.status(400).json({ status: false, message: 'Failed to upload APK' });
  });
}

router.get('/mail-settings', requireAuth, requireAdmin, async (_req, res) => {
  try {
    const settings = await getAppSettings();
    return res.json({
      status: true,
      data: serializeMailSettingsForAdmin(settings.mail),
    });
  } catch (error) {
    console.error('get mail settings error:', error);
    return res.status(500).json({ status: false, message: 'Failed to load mail settings' });
  }
});

router.put('/mail-settings', requireAuth, requireAdmin, async (req, res) => {
  try {
    const settings = await getAppSettings();
    const current = normalizeMailSettings(settings.mail);
    const body = req.body as Partial<MailSettings> & { smtpPass?: string };

    const nextPass =
      body.smtpPass && body.smtpPass !== '********' ? String(body.smtpPass) : current.smtpPass;

    settings.mail = normalizeMailSettings({
      enabled: body.enabled,
      smtpHost: body.smtpHost,
      smtpPort: body.smtpPort,
      secure: body.secure,
      smtpUser: body.smtpUser,
      smtpPass: nextPass,
      fromName: body.fromName,
      fromEmail: body.fromEmail,
    });
    await settings.save();

    return res.json({
      status: true,
      message: 'Mail settings updated',
      data: serializeMailSettingsForAdmin(settings.mail),
    });
  } catch (error) {
    console.error('update mail settings error:', error);
    return res.status(500).json({ status: false, message: 'Failed to update mail settings' });
  }
});

router.post('/mail-settings/test', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { to } = req.body as { to?: string };
    if (!to || !to.includes('@')) {
      return res.status(400).json({ status: false, message: 'Valid test email is required' });
    }

    const result = await sendTestMail(to.trim().toLowerCase());
    if (!result.sent) {
      return res.status(400).json({
        status: false,
        message:
          result.reason === 'mail_disabled'
            ? 'Mail is disabled or SMTP is incomplete'
            : 'Failed to send test email',
      });
    }

    return res.json({ status: true, message: 'Test email sent' });
  } catch (error) {
    console.error('test mail error:', error);
    return res.status(500).json({ status: false, message: 'Failed to send test email' });
  }
});

router.get('/app-download', async (_req, res) => {
  try {
    const settings = await getAppSettings();
    const appDownload = normalizeAppDownloadSettings(settings.appDownload);
    const fileExists = fs.existsSync(appDownloadPath);
    const stat = fileExists ? fs.statSync(appDownloadPath) : null;

    // Keep the homepage CTA visible when download is enabled in settings,
    // even if the APK has not been uploaded yet.
    if (!appDownload.enabled) {
      return res.json({
        status: true,
        data: {
          enabled: false,
          downloadUrl: '',
          fileName: appDownloadFileName,
          fileSize: 0,
          version: appDownload.version,
          updatedAt: appDownload.updatedAt,
        } satisfies AppDownloadSettings,
      });
    }

    return res.json({
      status: true,
      data: normalizeAppDownloadSettings({
        ...appDownload,
        enabled: true,
        downloadUrl: '/uploads/app/BattleAsia.apk',
        fileName: appDownloadFileName,
        fileSize: stat?.size || 0,
      }),
    });
  } catch (error) {
    console.error('get app download error:', error);
    return res.status(500).json({ status: false, message: 'Failed to load app download settings' });
  }
});

router.put('/app-download', requireAuth, requireAdmin, async (req, res) => {
  try {
    const settings = await getAppSettings();
    const body = req.body as Partial<AppDownloadSettings>;
    const current = normalizeAppDownloadSettings(settings.appDownload);
    const fileExists = fs.existsSync(appDownloadPath);
    const stat = fileExists ? fs.statSync(appDownloadPath) : null;

    settings.appDownload = normalizeAppDownloadSettings({
      ...current,
      enabled: body.enabled,
      version: body.version,
      downloadUrl: '/uploads/app/BattleAsia.apk',
      fileName: appDownloadFileName,
      fileSize: stat?.size || current.fileSize,
      updatedAt: current.updatedAt,
    });
    await settings.save();

    return res.json({
      status: true,
      message: 'App download settings updated',
      data: normalizeAppDownloadSettings(settings.appDownload),
    });
  } catch (error) {
    console.error('update app download error:', error);
    return res.status(500).json({ status: false, message: 'Failed to update app download settings' });
  }
});

router.post('/app-download/upload', requireAuth, requireAdmin, handleApkUpload, async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ status: false, message: 'APK file is required' });
    }

    if (!isApkBuffer(file.buffer)) {
      return res.status(400).json({ status: false, message: 'Invalid APK file' });
    }

    ensureAppDownloadDir();
    fs.writeFileSync(appDownloadPath, file.buffer);

    const settings = await getAppSettings();
    const version = String((req.body as { version?: string }).version || settings.appDownload?.version || '').trim();

    settings.appDownload = normalizeAppDownloadSettings({
      enabled: true,
      downloadUrl: '/uploads/app/BattleAsia.apk',
      fileName: appDownloadFileName,
      fileSize: file.size,
      version,
      updatedAt: new Date().toISOString(),
    });
    await settings.save();

    return res.json({
      status: true,
      message: 'APK uploaded as BattleAsia.apk',
      data: normalizeAppDownloadSettings(settings.appDownload),
    });
  } catch (error) {
    console.error('upload apk error:', error);
    return res.status(500).json({ status: false, message: 'Failed to upload APK' });
  }
});

export default router;
