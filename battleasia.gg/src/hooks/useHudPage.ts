import { useEffect, useRef } from 'react';
import { useHud, type HudHandlers } from '../contexts/HudContext';
import { useI18n } from '../lib/i18n';

export function useHudPage(extra?: Partial<HudHandlers>) {
  const { toast, register } = useHud();
  const { t } = useI18n();
  const extraRef = useRef(extra);
  extraRef.current = extra;

  useEffect(() => {
    return register({
      quickJoin: () => extraRef.current?.quickJoin?.() ?? toast(t('wallet.openPlay')),
      copyRoom: () => extraRef.current?.copyRoom?.() ?? toast(t('play.roomSoon')),
      ready: () => extraRef.current?.ready?.() ?? toast(t('play.joinLobby')),
      leave: () => extraRef.current?.leave?.() ?? toast(t('play.notInMatch')),
      matchDetails: () => extraRef.current?.matchDetails?.() ?? toast(t('play.openMatch')),
      openChat: () => extraRef.current?.openChat?.() ?? toast(t('play.joinChat')),
      share: async () => {
        if (extraRef.current?.share) return extraRef.current.share();
        await navigator.clipboard.writeText(window.location.href);
        toast(t('play.copied'));
      },
      leaderboard: () =>
        extraRef.current?.leaderboard?.() ?? window.location.assign('/user/account/leader-board'),
      follow: () => extraRef.current?.follow?.() ?? toast(t('hud.noFocus')),
    });
  }, [register, t, toast]);

  return { toast };
}
