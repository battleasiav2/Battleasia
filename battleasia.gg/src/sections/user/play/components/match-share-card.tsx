import { useCallback, useEffect, useState } from 'react';

import { alpha } from '@mui/material/styles';
import { Box, Stack, Typography, CircularProgress } from '@mui/material';
import toast from 'react-hot-toast';

import useApi from 'src/hooks/use-api';
import { useTranslate } from 'src/locales/use-locales';
import { useSelector } from 'src/store';
import {
  UserGlassCard,
  UserActionButton,
  USER_COLORS,
  userMutedTextSx,
  getUserChipSx,
  goldAlpha,
} from 'src/layouts/user';
import { Iconify } from 'src/components/iconify';
import { CoinValue } from 'src/components/coin-value';

import { EARN_HUB_GOLD, getEarnClaimFlashSx } from '../../wallet/wallet-earn-hub-styles';

export type ShareToEarnState = {
  enabled: boolean;
  bacAmount?: number;
  title?: string;
  description?: string;
  icon?: string;
  cooldownHours?: number;
  claimedForMatch?: boolean;
  claimedCount?: number;
};

type Props = {
  matchId: string;
  matchName?: string;
};

export function MatchShareCard({ matchId, matchName }: Props) {
  const { t } = useTranslate();
  const user = useSelector((state) => state.auth.user);
  const { getShareStatusApi, claimShareRewardApi } = useApi();

  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [flash, setFlash] = useState(false);
  const [share, setShare] = useState<ShareToEarnState | null>(null);

  const loadStatus = useCallback(async () => {
    if (!user || !matchId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await getShareStatusApi(matchId);
      if (response?.data?.status) {
        setShare(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load share status:', error);
    } finally {
      setLoading(false);
    }
  }, [getShareStatusApi, matchId, user]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const performShare = async () => {
    if (!matchId || claiming) return;

    const url = window.location.href;
    const title = matchName
      ? t('match.shareTextNamed', { name: matchName })
      : t('match.shareText');
    let platform = 'copy';

    try {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        await navigator.share({ title, text: title, url });
        platform = 'native';
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        toast.success(t('match.shareCopied'));
        platform = 'copy';
      } else {
        toast.error(t('match.shareFailed'));
        return;
      }
    } catch (error: any) {
      // User cancelled native share — do not claim
      if (error?.name === 'AbortError') return;
      try {
        await navigator.clipboard.writeText(url);
        toast.success(t('match.shareCopied'));
        platform = 'copy';
      } catch {
        toast.error(t('match.shareFailed'));
        return;
      }
    }

    setClaiming(true);
    try {
      const response = await claimShareRewardApi(matchId, platform);
      if (response?.data?.status) {
        const rewardAmount = Number(response.data.data?.rewardAmount) || 0;
        setShare(response.data.data?.shareToEarn || { ...share, claimedForMatch: true, enabled: true });
        setFlash(true);
        window.setTimeout(() => setFlash(false), 650);
        if (rewardAmount > 0) {
          toast.success(t('match.shareClaimSuccess', { amount: rewardAmount }));
        } else {
          toast.success(t('match.shareThanks'));
        }
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || t('match.shareClaimFailed');
      // Already claimed is fine UX — just refresh state
      if (String(message).toLowerCase().includes('already')) {
        setShare((prev) => (prev ? { ...prev, claimedForMatch: true } : prev));
      }
      toast.error(message);
    } finally {
      setClaiming(false);
    }
  };

  if (!user) return null;
  if (loading) {
    return (
      <UserGlassCard sx={{ p: 2, display: 'grid', placeItems: 'center', minHeight: 72 }}>
        <CircularProgress size={22} sx={{ color: EARN_HUB_GOLD }} />
      </UserGlassCard>
    );
  }
  if (!share?.enabled) return null;

  const claimed = Boolean(share.claimedForMatch);
  const bacAmount = share.bacAmount ?? 0;

  return (
    <UserGlassCard sx={{ p: { xs: 1.75, md: 2.25 }, ...getEarnClaimFlashSx(flash) }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 1.25,
            display: 'grid',
            placeItems: 'center',
            bgcolor: goldAlpha( 0.12),
            border: `1px solid ${goldAlpha( 0.28)}`,
            color: EARN_HUB_GOLD,
            flexShrink: 0,
          }}
        >
          <Iconify icon={share.icon || 'solar:share-bold'} width={22} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Typography
              className="font-tr"
              sx={{ fontSize: { xs: 15, md: 16 }, fontWeight: 800, color: USER_COLORS.textPrimary }}
            >
              {share.title || t('match.shareTitle')}
            </Typography>
            {bacAmount > 0 ? (
              <Box component="span" sx={{ ...getUserChipSx('gold'), fontSize: 10, px: 0.75, py: 0.15, height: 'auto' }}>
                <Stack direction="row" spacing={0.35} alignItems="center">
                  <span>+</span>
                  <CoinValue value={bacAmount} size={12} />
                </Stack>
              </Box>
            ) : null}
          </Stack>
          <Typography sx={{ ...userMutedTextSx, fontSize: 12.5, mt: 0.35 }}>
            {claimed
              ? t('match.shareAlreadyClaimed')
              : share.description || t('match.shareHint')}
          </Typography>
        </Box>

        <UserActionButton
          onClick={performShare}
          disabled={claiming || claimed}
          sx={{ minWidth: { sm: 140 }, flexShrink: 0 }}
        >
          {claiming ? (
            <CircularProgress size={16} sx={{ color: '#000' }} />
          ) : claimed ? (
            t('match.shareDone')
          ) : (
            <>
              <Iconify icon="solar:share-bold" width={16} />
              {t('match.shareCta')}
            </>
          )}
        </UserActionButton>
      </Stack>
    </UserGlassCard>
  );
}
