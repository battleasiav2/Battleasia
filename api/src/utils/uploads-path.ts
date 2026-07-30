import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Shared uploads directory: `<repo>/api/uploads` */
export const uploadsRoot = path.resolve(__dirname, '../../uploads');

export const appDownloadDir = path.join(uploadsRoot, 'app');
export const appDownloadFileName = 'BattleAsia.apk';
export const appDownloadPath = path.join(appDownloadDir, appDownloadFileName);
