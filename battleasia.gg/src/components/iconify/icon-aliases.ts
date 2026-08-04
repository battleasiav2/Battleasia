/**
 * Map icons that are not in the offline Iconify bundle to available sets.
 * Especially remixicon (`ri:*`) used by API live-chat / messaging defaults.
 */
export const ICON_ALIASES: Record<string, string> = {
  'ri:facebook-fill': 'mingcute:facebook-fill',
  'ri:facebook-line': 'mingcute:facebook-line',
  'ri:youtube-fill': 'mingcute:youtube-fill',
  'ri:youtube-line': 'mingcute:youtube-line',
  'ri:whatsapp-fill': 'mingcute:whatsapp-fill',
  'ri:whatsapp-line': 'mingcute:whatsapp-line',
  'ri:tiktok-fill': 'mingcute:tiktok-fill',
  'ri:tiktok-line': 'mingcute:tiktok-line',
  'ri:discord-fill': 'mingcute:discord-fill',
  'ri:discord-line': 'mingcute:discord-line',
  'ri:telegram-fill': 'mingcute:telegram-fill',
  'ri:telegram-line': 'mingcute:telegram-line',
  'ri:instagram-fill': 'mingcute:instagram-fill',
  'ri:instagram-line': 'mingcute:instagram-line',
  'ri:twitter-fill': 'mingcute:twitter-fill',
  'ri:twitter-x-fill': 'mingcute:twitter-fill',
  'mynaui:chat-messages': 'solar:chat-round-dots-bold',
};

export function resolveIconName(icon: string): string {
  return ICON_ALIASES[icon] ?? icon;
}
