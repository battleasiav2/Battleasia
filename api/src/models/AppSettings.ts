import mongoose, { Schema, type Document } from 'mongoose';

export type LiveChatSocialLink = {
  label: string;
  icon: string;
  color: string;
  href: string;
};

export type LiveChatSettings = {
  enabled: boolean;
  agentName: string;
  agentTitle: string;
  agentAvatar: string;
  logoUrl: string;
  welcomeMessage: string;
  socialLinks: LiveChatSocialLink[];
};

export type MessagingProviderType =
  | 'builtin'
  | 'whatsapp'
  | 'telegram'
  | 'facebook'
  | 'discord'
  | 'custom';

export type MessagingProvider = {
  id: string;
  label: string;
  type: MessagingProviderType;
  enabled: boolean;
  icon: string;
  color: string;
  url: string;
  openInNewTab: boolean;
};

export type MessagingSettings = {
  builtinEnabled: boolean;
  defaultProviderId: string;
  allowUserChoice: boolean;
  providers: MessagingProvider[];
};

export type ProfileSocialSettings = {
  showMutualFollowers: boolean;
  showSuggestedFollows: boolean;
  showRecentFollows: boolean;
  autoSuggestEnabled: boolean;
  suggestedLimit: number;
  mutualFollowersLimit: number;
  recentFollowsLimit: number;
  pinnedUserIds: string[];
};

export type MailSettings = {
  enabled: boolean;
  smtpHost: string;
  smtpPort: number;
  secure: boolean;
  smtpUser: string;
  smtpPass: string;
  fromName: string;
  fromEmail: string;
};

export type AppDownloadSettings = {
  enabled: boolean;
  downloadUrl: string;
  fileName: string;
  fileSize: number;
  version: string;
  updatedAt: string | null;
};

export const DEFAULT_MAIL_SETTINGS: MailSettings = {
  enabled: false,
  smtpHost: '',
  smtpPort: 587,
  secure: false,
  smtpUser: '',
  smtpPass: '',
  fromName: 'BattleAsia',
  fromEmail: '',
};

export const DEFAULT_APP_DOWNLOAD_SETTINGS: AppDownloadSettings = {
  enabled: true,
  downloadUrl: '/uploads/app/BattleAsia.apk',
  fileName: 'BattleAsia.apk',
  fileSize: 0,
  version: '',
  updatedAt: null,
};

export const DEFAULT_PROFILE_SOCIAL_SETTINGS: ProfileSocialSettings = {
  showMutualFollowers: true,
  showSuggestedFollows: true,
  showRecentFollows: true,
  autoSuggestEnabled: true,
  suggestedLimit: 8,
  mutualFollowersLimit: 3,
  recentFollowsLimit: 6,
  pinnedUserIds: [],
};

export const DEFAULT_LIVE_CHAT_SETTINGS: LiveChatSettings = {
  enabled: true,
  agentName: 'BattleAsia Support',
  agentTitle: 'Live Support',
  agentAvatar: '',
  logoUrl: '/logo/logo.webp',
  welcomeMessage: 'Hi! How can we help you today? Chat with our team or reach us on social.',
  socialLinks: [
    {
      label: 'Facebook',
      icon: 'mingcute:facebook-fill',
      color: '#1877F2',
      href: 'https://www.facebook.com/share/1HQV9D33ic/?mibextid=wwXIfr',
    },
    {
      label: 'YouTube',
      icon: 'mingcute:youtube-fill',
      color: '#FF0000',
      href: 'https://youtube.com/@battleasia?si=9ROsHqQNc3mVFMvl',
    },
    {
      label: 'WhatsApp',
      icon: 'mingcute:whatsapp-fill',
      color: '#25D366',
      href: 'https://whatsapp.com/channel/0029VbBDBVtGpLHQgYC7WM44',
    },
    {
      label: 'TikTok',
      icon: 'mingcute:tiktok-fill',
      color: '#000000',
      href: 'https://www.tiktok.com/@battleasia?_r=1&_t=ZN-91f9vFOUJcc',
    },
  ],
};

export const DEFAULT_MESSAGING_SETTINGS: MessagingSettings = {
  builtinEnabled: true,
  defaultProviderId: 'builtin',
  allowUserChoice: true,
  providers: [
    {
      id: 'builtin',
      label: 'BattleAsia Chat',
      type: 'builtin',
      enabled: true,
      icon: 'solar:chat-round-dots-bold',
      color: '#f5c518',
      url: '',
      openInNewTab: false,
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      type: 'whatsapp',
      enabled: false,
      icon: 'mingcute:whatsapp-fill',
      color: '#25D366',
      url: 'https://wa.me/',
      openInNewTab: true,
    },
    {
      id: 'telegram',
      label: 'Telegram',
      type: 'telegram',
      enabled: false,
      icon: 'mingcute:telegram-fill',
      color: '#0088cc',
      url: 'https://t.me/',
      openInNewTab: true,
    },
    {
      id: 'facebook',
      label: 'Facebook',
      type: 'facebook',
      enabled: false,
      icon: 'mingcute:facebook-fill',
      color: '#1877F2',
      url: 'https://m.me/',
      openInNewTab: true,
    },
    {
      id: 'discord',
      label: 'Discord',
      type: 'discord',
      enabled: false,
      icon: 'mingcute:discord-fill',
      color: '#5865F2',
      url: 'https://discord.gg/',
      openInNewTab: true,
    },
  ],
};

export interface IAppSettings extends Document {
  key: string;
  premiumDuration: number;
  premiumPrice: number;
  commissionRate: number;
  liveChat: LiveChatSettings;
  messaging: MessagingSettings;
  profileSocial: ProfileSocialSettings;
  mail: MailSettings;
  appDownload: AppDownloadSettings;
}

const appSettingsSchema = new Schema<IAppSettings>(
  {
    key: { type: String, required: true, unique: true, default: 'global' },
    premiumDuration: { type: Number, default: 30 },
    premiumPrice: { type: Number, default: 100 },
    commissionRate: { type: Number, default: 10 },
    liveChat: {
      type: Schema.Types.Mixed,
      default: () => ({ ...DEFAULT_LIVE_CHAT_SETTINGS }),
    },
    messaging: {
      type: Schema.Types.Mixed,
      default: () => ({ ...DEFAULT_MESSAGING_SETTINGS, providers: DEFAULT_MESSAGING_SETTINGS.providers.map((p) => ({ ...p })) }),
    },
    profileSocial: {
      type: Schema.Types.Mixed,
      default: () => ({ ...DEFAULT_PROFILE_SOCIAL_SETTINGS, pinnedUserIds: [] }),
    },
    mail: {
      type: Schema.Types.Mixed,
      default: () => ({ ...DEFAULT_MAIL_SETTINGS }),
    },
    appDownload: {
      type: Schema.Types.Mixed,
      default: () => ({ ...DEFAULT_APP_DOWNLOAD_SETTINGS }),
    },
  },
  { timestamps: true }
);

export const AppSettings = mongoose.model<IAppSettings>('AppSettings', appSettingsSchema);

const VALID_PROVIDER_TYPES = new Set<MessagingProviderType>([
  'builtin',
  'whatsapp',
  'telegram',
  'facebook',
  'discord',
  'custom',
]);

export function normalizeLiveChatSettings(raw?: Partial<LiveChatSettings> | null): LiveChatSettings {
  const socialLinks = Array.isArray(raw?.socialLinks)
    ? raw!.socialLinks
        .filter((item) => item && typeof item.href === 'string' && item.href.trim())
        .map((item) => ({
          label: String(item.label || 'Link').slice(0, 40),
          icon: String(item.icon || 'solar:link-bold').slice(0, 80),
          color: String(item.color || '#f5c518').slice(0, 20),
          href: String(item.href).trim().slice(0, 500),
        }))
    : DEFAULT_LIVE_CHAT_SETTINGS.socialLinks;

  return {
    enabled: raw?.enabled !== false,
    agentName: String(raw?.agentName || DEFAULT_LIVE_CHAT_SETTINGS.agentName).slice(0, 80),
    agentTitle: String(raw?.agentTitle || DEFAULT_LIVE_CHAT_SETTINGS.agentTitle).slice(0, 80),
    agentAvatar: String(raw?.agentAvatar || '').slice(0, 500),
    logoUrl: String(raw?.logoUrl || DEFAULT_LIVE_CHAT_SETTINGS.logoUrl).slice(0, 500),
    welcomeMessage: String(raw?.welcomeMessage || DEFAULT_LIVE_CHAT_SETTINGS.welcomeMessage).slice(0, 500),
    socialLinks: socialLinks.length ? socialLinks : DEFAULT_LIVE_CHAT_SETTINGS.socialLinks,
  };
}

export function normalizeMessagingSettings(raw?: Partial<MessagingSettings> | null): MessagingSettings {
  const defaultsById = new Map(DEFAULT_MESSAGING_SETTINGS.providers.map((p) => [p.id, p]));
  const incoming = Array.isArray(raw?.providers) ? raw!.providers : [];

  const providers: MessagingProvider[] = incoming
    .filter((item) => item && typeof item.id === 'string')
    .map((item) => {
      const fallback = defaultsById.get(String(item.id)) || defaultsById.get('custom')!;
      const type = VALID_PROVIDER_TYPES.has(item.type as MessagingProviderType)
        ? (item.type as MessagingProviderType)
        : fallback.type;

      return {
        id: String(item.id).slice(0, 40),
        label: String(item.label || fallback.label).slice(0, 60),
        type,
        enabled: item.enabled !== false,
        icon: String(item.icon || fallback.icon).slice(0, 80),
        color: String(item.color || fallback.color).slice(0, 20),
        url: type === 'builtin' ? '' : String(item.url || fallback.url).trim().slice(0, 500),
        openInNewTab: type === 'builtin' ? false : item.openInNewTab !== false,
      };
    });

  const mergedProviders = DEFAULT_MESSAGING_SETTINGS.providers.map((defaultProvider) => {
    const found = providers.find((p) => p.id === defaultProvider.id);
    return found || { ...defaultProvider };
  });

  const customProviders = providers.filter((p) => !defaultsById.has(p.id));
  const allProviders = [...mergedProviders, ...customProviders];

  const builtinProvider = allProviders.find((p) => p.id === 'builtin');
  const builtinEnabled = raw?.builtinEnabled !== false && builtinProvider?.enabled !== false;

  let defaultProviderId = String(raw?.defaultProviderId || DEFAULT_MESSAGING_SETTINGS.defaultProviderId);
  const defaultProvider = allProviders.find((p) => p.id === defaultProviderId && p.enabled);
  if (!defaultProvider || (defaultProvider.type === 'builtin' && !builtinEnabled)) {
    const firstEnabled = allProviders.find((p) => p.enabled && (p.type !== 'builtin' || builtinEnabled));
    defaultProviderId = firstEnabled?.id || 'builtin';
  }

  return {
    builtinEnabled,
    defaultProviderId,
    allowUserChoice: raw?.allowUserChoice !== false,
    providers: allProviders,
  };
}

export function normalizeMailSettings(raw?: Partial<MailSettings> | null): MailSettings {
  return {
    enabled: raw?.enabled === true,
    smtpHost: String(raw?.smtpHost || '').trim().slice(0, 200),
    smtpPort: Math.min(Math.max(Number(raw?.smtpPort) || DEFAULT_MAIL_SETTINGS.smtpPort, 1), 65535),
    secure: raw?.secure === true,
    smtpUser: String(raw?.smtpUser || '').trim().slice(0, 200),
    smtpPass: String(raw?.smtpPass || ''),
    fromName: String(raw?.fromName || DEFAULT_MAIL_SETTINGS.fromName).trim().slice(0, 80),
    fromEmail: String(raw?.fromEmail || '').trim().slice(0, 200),
  };
}

export function serializeMailSettingsForAdmin(raw?: Partial<MailSettings> | null): MailSettings {
  const normalized = normalizeMailSettings(raw);
  return {
    ...normalized,
    smtpPass: normalized.smtpPass ? '********' : '',
  };
}

export function normalizeAppDownloadSettings(raw?: Partial<AppDownloadSettings> | null): AppDownloadSettings {
  const fileName = String(raw?.fileName || DEFAULT_APP_DOWNLOAD_SETTINGS.fileName).trim().slice(0, 120) || 'BattleAsia.apk';
  const downloadUrl = String(raw?.downloadUrl || DEFAULT_APP_DOWNLOAD_SETTINGS.downloadUrl).trim().slice(0, 500);

  return {
    enabled: raw?.enabled !== false,
    downloadUrl,
    fileName,
    fileSize: Math.max(Number(raw?.fileSize) || 0, 0),
    version: String(raw?.version || '').trim().slice(0, 40),
    updatedAt: raw?.updatedAt ? String(raw.updatedAt) : null,
  };
}

export function normalizeProfileSocialSettings(raw?: Partial<ProfileSocialSettings> | null): ProfileSocialSettings {
  const pinnedUserIds = Array.isArray(raw?.pinnedUserIds)
    ? raw!.pinnedUserIds
        .map((id) => String(id).trim())
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .slice(0, 20)
    : [];

  return {
    showMutualFollowers: raw?.showMutualFollowers !== false,
    showSuggestedFollows: raw?.showSuggestedFollows !== false,
    showRecentFollows: raw?.showRecentFollows !== false,
    autoSuggestEnabled: raw?.autoSuggestEnabled !== false,
    suggestedLimit: Math.min(Math.max(Number(raw?.suggestedLimit) || DEFAULT_PROFILE_SOCIAL_SETTINGS.suggestedLimit, 1), 20),
    mutualFollowersLimit: Math.min(Math.max(Number(raw?.mutualFollowersLimit) || DEFAULT_PROFILE_SOCIAL_SETTINGS.mutualFollowersLimit, 1), 10),
    recentFollowsLimit: Math.min(Math.max(Number(raw?.recentFollowsLimit) || DEFAULT_PROFILE_SOCIAL_SETTINGS.recentFollowsLimit, 1), 20),
    pinnedUserIds,
  };
}

export async function getAppSettings() {
  let settings = await AppSettings.findOne({ key: 'global' });
  if (!settings) {
    settings = await AppSettings.create({
      key: 'global',
      liveChat: { ...DEFAULT_LIVE_CHAT_SETTINGS },
      messaging: normalizeMessagingSettings(DEFAULT_MESSAGING_SETTINGS),
      profileSocial: normalizeProfileSocialSettings(DEFAULT_PROFILE_SOCIAL_SETTINGS),
      mail: { ...DEFAULT_MAIL_SETTINGS },
      appDownload: { ...DEFAULT_APP_DOWNLOAD_SETTINGS },
    });
  }

  let dirty = false;

  if (!settings.liveChat) {
    settings.liveChat = { ...DEFAULT_LIVE_CHAT_SETTINGS };
    dirty = true;
  }

  if (!settings.messaging) {
    settings.messaging = normalizeMessagingSettings(DEFAULT_MESSAGING_SETTINGS);
    dirty = true;
  }

  if (!settings.profileSocial) {
    settings.profileSocial = normalizeProfileSocialSettings(DEFAULT_PROFILE_SOCIAL_SETTINGS);
    dirty = true;
  }

  if (!settings.mail) {
    settings.mail = { ...DEFAULT_MAIL_SETTINGS };
    dirty = true;
  }

  if (!settings.appDownload) {
    settings.appDownload = { ...DEFAULT_APP_DOWNLOAD_SETTINGS };
    dirty = true;
  }

  if (dirty) {
    await settings.save();
  }

  return settings;
}
