import { Router } from 'express';
import multer, { type FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { requireAuth, type AuthedRequest } from '../../middleware/auth.js';
import { requireAdmin } from '../../middleware/admin.js';
import { uploadsRoot } from '../../utils/uploads-path.js';

const router = Router();

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'application/pdf',
]);

const MAGIC_SIGNATURES: Array<{ mime: string; bytes: number[] }> = [
  { mime: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
  { mime: 'image/png', bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: 'image/gif', bytes: [0x47, 0x49, 0x46] },
  { mime: 'application/pdf', bytes: [0x25, 0x50, 0x44, 0x46] },
];

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function sanitizeFolder(folder: string) {
  return (folder || 'support').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || 'support';
}

function buildStorage(folder: string) {
  const dest = path.join(uploadsRoot, sanitizeFolder(folder));
  ensureDir(dest);
  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dest),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || '').slice(0, 10).toLowerCase();
      const safeExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4', '.webm', '.pdf'].includes(ext)
        ? ext
        : '.bin';
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${safeExt}`);
    },
  });
}

function fileFilter(_req: Express.Request, file: Express.Multer.File, cb: FileFilterCallback) {
  if (ALLOWED_MIME.has(file.mimetype)) {
    cb(null, true);
    return;
  }
  cb(new Error('Unsupported file type'));
}

function detectMimeFromBuffer(buffer: Buffer): string | null {
  if (buffer.length >= 12 && buffer.slice(0, 4).toString('ascii') === 'RIFF' && buffer.slice(8, 12).toString('ascii') === 'WEBP') {
    return 'image/webp';
  }
  for (const sig of MAGIC_SIGNATURES) {
    if (sig.bytes.every((byte, index) => buffer[index] === byte)) {
      return sig.mime;
    }
  }
  if (buffer.length >= 8 && buffer[4] === 0x66 && buffer[5] === 0x74 && buffer[6] === 0x79 && buffer[7] === 0x70) {
    return 'video/mp4';
  }
  if (buffer.length >= 4 && buffer[0] === 0x1a && buffer[1] === 0x45 && buffer[2] === 0xdf && buffer[3] === 0xa3) {
    return 'video/webm';
  }
  return null;
}

function validateUploadedFile(file: Express.Multer.File): string | null {
  const header = Buffer.alloc(Math.min(file.size, 16));
  const fd = fs.openSync(file.path, 'r');
  fs.readSync(fd, header, 0, header.length, 0);
  fs.closeSync(fd);

  const detected = detectMimeFromBuffer(header);
  if (!detected || !ALLOWED_MIME.has(detected)) {
    return 'File content does not match an allowed type';
  }
  if (detected !== file.mimetype && !(detected === 'image/jpeg' && file.mimetype === 'image/jpg')) {
    return 'File content does not match declared type';
  }
  return null;
}

function getUploadLimit(folder: string): number {
  if (folder === 'reels' || folder === 'stories') {
    return 100 * 1024 * 1024;
  }
  return 5 * 1024 * 1024;
}

router.post('/upload/:folder', requireAuth, (req: AuthedRequest, res) => {
  const folder = sanitizeFolder(String(req.params.folder || 'support'));
  const upload = multer({
    storage: buildStorage(folder),
    limits: { fileSize: getUploadLimit(folder) },
    fileFilter,
  }).single('file');

  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ status: false, message: err.message || 'Upload failed' });
    }
    if (!req.file) {
      return res.status(400).json({ status: false, message: 'No file uploaded' });
    }

    const validationError = validateUploadedFile(req.file);
    if (validationError) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ status: false, message: validationError });
    }

    const url = `/uploads/${folder}/${req.file.filename}`;
    return res.status(201).json({
      status: true,
      data: {
        url,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  });
});

router.post('/upload/:folder/multi', requireAuth, (req: AuthedRequest, res) => {
  const folder = sanitizeFolder(String(req.params.folder || 'support'));
  const upload = multer({
    storage: buildStorage(folder),
    limits: { fileSize: getUploadLimit(folder), files: 10 },
    fileFilter,
  }).array('files', 10);

  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ status: false, message: err.message || 'Upload failed' });
    }
    const files = (req.files as Express.Multer.File[] | undefined) || [];
    if (!files.length) {
      return res.status(400).json({ status: false, message: 'No files uploaded' });
    }

    const results = [];
    for (const file of files) {
      const validationError = validateUploadedFile(file);
      if (validationError) {
        fs.unlinkSync(file.path);
        continue;
      }
      results.push({
        url: `/uploads/${folder}/${file.filename}`,
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
      });
    }

    if (!results.length) {
      return res.status(400).json({ status: false, message: 'No valid files uploaded' });
    }

    return res.status(201).json({ status: true, data: { files: results } });
  });
});

router.delete('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { url } = req.body as { url?: string };
    if (!url?.startsWith('/uploads/')) {
      return res.status(400).json({ status: false, message: 'Invalid file url' });
    }

    const relative = url.replace(/^\/uploads\//, '');
    const filePath = path.join(uploadsRoot, relative);
    const resolved = path.resolve(filePath);
    if (!resolved.startsWith(path.resolve(uploadsRoot))) {
      return res.status(400).json({ status: false, message: 'Invalid file path' });
    }

    if (fs.existsSync(resolved)) {
      fs.unlinkSync(resolved);
    }

    return res.json({ status: true, message: 'File deleted' });
  } catch (error) {
    console.error('delete file error:', error);
    return res.status(500).json({ status: false, message: 'Failed to delete file' });
  }
});

export default router;
