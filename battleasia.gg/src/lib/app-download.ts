export type AppDownloadInfo = {
  enabled: boolean;
  downloadUrl: string;
  fileName: string;
  fileSize: number;
  version: string;
  updatedAt?: string;
};

const FALLBACK: AppDownloadInfo = {
  enabled: true,
  downloadUrl: '/api/uploads/app/BattleAsia.apk',
  fileName: 'BattleAsia.apk',
  fileSize: 0,
  version: '',
};

export async function fetchAppDownload(): Promise<AppDownloadInfo> {
  try {
    const res = await fetch('/api/v2/app-settings/app-download', { credentials: 'include' });
    if (!res.ok) return FALLBACK;
    const json = (await res.json()) as { data?: Partial<AppDownloadInfo> };
    const d = json.data || {};
    return {
      enabled: d.enabled !== false,
      downloadUrl: d.downloadUrl || FALLBACK.downloadUrl,
      fileName: d.fileName || FALLBACK.fileName,
      fileSize: Number(d.fileSize) || 0,
      version: typeof d.version === 'string' ? d.version : '',
      updatedAt: typeof d.updatedAt === 'string' ? d.updatedAt : undefined,
    };
  } catch {
    return FALLBACK;
  }
}

export function formatApkSize(bytes: number) {
  if (!bytes || bytes < 1) return '';
  const mb = bytes / (1024 * 1024);
  return mb >= 10 ? `${Math.round(mb)} MB` : `${mb.toFixed(1)} MB`;
}
