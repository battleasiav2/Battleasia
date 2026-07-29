import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

export type MessagingProvider = {
  id: string;
  label: string;
  type: string;
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

export const mapMessagingSettings = (raw: any): MessagingSettings => ({
  builtinEnabled: raw?.builtinEnabled !== false,
  defaultProviderId: raw?.defaultProviderId || 'builtin',
  allowUserChoice: raw?.allowUserChoice !== false,
  providers: Array.isArray(raw?.providers) ? raw.providers : [],
});

export const getActiveMessagingProviders = (settings: MessagingSettings) =>
  settings.providers.filter(
    (provider) => provider.enabled && (provider.type !== 'builtin' || settings.builtinEnabled)
  );

export const resolveProviderUrl = (provider: MessagingProvider, username?: string) => {
  if (provider.type === 'builtin' || !provider.url) return '';
  return provider.url.replace(/\{username\}/gi, encodeURIComponent(username || ''));
};

export type MessagingAction = {
  provider: MessagingProvider;
  href: string;
  isBuiltin: boolean;
};

export const buildMessagingAction = (
  settings: MessagingSettings,
  options: { username?: string; userId?: string }
): MessagingAction | null => {
  const active = getActiveMessagingProviders(settings);
  if (active.length === 0) return null;

  const preferred =
    active.find((p) => p.id === settings.defaultProviderId) ||
    active.find((p) => p.type === 'builtin') ||
    active[0];

  if (preferred.type === 'builtin' && settings.builtinEnabled) {
    return {
      provider: preferred,
      href: options.userId ? paths.user.messagesWithUser(options.userId) : paths.user.messages,
      isBuiltin: true,
    };
  }

  return {
    provider: preferred,
    href: resolveProviderUrl(preferred, options.username),
    isBuiltin: false,
  };
};

export const openMessagingAction = (action: MessagingAction) => {
  if (!action.href) return;
  if (action.isBuiltin || !action.provider.openInNewTab) {
    window.location.href = action.href;
    return;
  }
  window.open(action.href, '_blank', 'noopener,noreferrer');
};
