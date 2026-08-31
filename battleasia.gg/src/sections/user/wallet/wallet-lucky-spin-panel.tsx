import { useMemo, useState } from 'react';

import { alpha } from '@mui/material/styles';
import { Box, LinearProgress, Stack, Typography, CircularProgress } from '@mui/material';
import toast from 'react-hot-toast';

import useApi from 'src/hooks/use-api';
import { useTranslate } from 'src/locales/use-locales';
import {
  UserGlassCard,
  UserActionButton,
  USER_COLORS,
  userMutedTextSx,
  getUserChipSx,
} from 'src/layouts/user';
import { Iconify } from 'src/components/iconify';
import { CoinValue } from 'src/components/coin-value';

import { EARN_HUB_GOLD, getEarnClaimFlashSx } from './wallet-earn-hub-styles';

export type LuckySpinPrize = {
  id: string;
  label: string;
  bacAmount: number;
  weight: number;
  icon: string;
  color: string;
  probability: number;
};

export type LuckySpinRecent = {
  prizeId: string;
  prizeLabel: string;
  bacAmount: number;
  probability: number;
  spunAt: string | Date;
};

export type LuckySpinState = {
  enabled: boolean;
  title?: string;
  description?: string;
  dailyFreeSpins?: number;
  spinsUsed?: number;
  remaining?: number;
  periodKey?: string;
  prizes?: LuckySpinPrize[];
  recent?: LuckySpinRecent[];
};

type Props = {
  luckySpin: LuckySpinState | null;
  onSpun?: (next: LuckySpinState) => void;
  onBalanceRefresh?: () => void;
};

function buildConicGradient(prizes: LuckySpinPrize[]) {
  if (!prizes.length) return `conic-gradient(${EARN_HUB_GOLD} 0deg 360deg)`;
  const total = prizes.reduce((sum, p) => sum + Math.max(p.weight, 0), 0) || 1;
  let cursor = 0;
  const parts = prizes.map((prize) => {
    const span = (Math.max(prize.weight, 0) / total) * 360;
    const start = cursor;
    cursor += span;
    return `${prize.color || '#6b7280'} ${start}deg ${cursor}deg`;
  });
  return `conic-gradient(${parts.join(', ')})`;
}

export function WalletLuckySpinPanel({ luckySpin, onSpun, onBalanceRefresh }: Props) {
  const { t } = useTranslate();
  const { spinLuckySpinApi } = useApi();
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [flash, setFlash] = useState(false);
  const [lastPrize, setLastPrize] = useState<LuckySpinPrize | null>(null);

  const prizes = luckySpin?.prizes || [];
  const remaining = luckySpin?.remaining ?? 0;
  const wheelBg = useMemo(() => buildConicGradient(prizes), [prizes]);

  if (!luckySpin?.enabled) return null;

  const handleSpin = async () => {
    if (spinning || remaining <= 0) return;
    setSpinning(true);
    setLastPrize(null);

    try {
      const response = await spinLuckySpinApi();
      if (!response?.data?.status) {
        toast.error(response?.data?.message || t('wallet.spinFailed'));
        setSpinning(false);
        return;
      }

      const prizeIndex = Number(response.data.data?.prizeIndex) || 0;
      const prize = response.data.data?.prize as LuckySpinPrize;
      const segment = 360 / Math.max(prizes.length, 1);
      const targetCenter = prizeIndex * segment + segment / 2;
      const extraTurns = 4 + Math.floor(Math.random() * 2);
      const nextRotation = rotation + extraTurns * 360 + (360 - targetCenter);

      setRotation(nextRotation);

      window.setTimeout(() => {
        setLastPrize(prize);
        setFlash(true);
        window.setTimeout(() => setFlash(false), 650);
        if (response.data.data?.luckySpin) {
          onSpun?.(response.data.data.luckySpin);
        }
        const reward = Number(response.data.data?.rewardAmount) || 0;
        if (reward > 0) {
          toast.success(t('wallet.spinWin', { amount: reward, label: prize?.label || '' }));
          onBalanceRefresh?.();
        } else {
          toast(t('wallet.spinMiss', { label: prize?.label || t('wallet.spinTryAgain') }));
        }
        setSpinning(false);
      }, 3200);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('wallet.spinFailed'));
      setSpinning(false);
    }
  };

  return (
    <UserGlassCard sx={{ p: { xs: 1.75, md: 2.25 }, ...getEarnClaimFlashSx(flash) }}>
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Iconify icon="solar:wheel-bold" width={20} sx={{ color: EARN_HUB_GOLD }} />
          <Typography
            className="font-tr"
            sx={{ fontSize: { xs: 15, md: 16 }, fontWeight: 800, color: USER_COLORS.textPrimary }}
          >
            {luckySpin.title || t('wallet.spinTitle')}
          </Typography>
          <Box
            component="span"
            sx={{
              ...getUserChipSx(remaining > 0 ? 'gold' : 'neutral'),
              fontSize: 10,
              px: 0.75,
              py: 0.15,
              height: 'auto',
            }}
          >
            {t('wallet.spinRemaining', { count: remaining })}
          </Box>
        </Stack>

        <Typography sx={{ ...userMutedTextSx, fontSize: 12.5 }}>
          {luckySpin.description || t('wallet.spinHint')}
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <Box sx={{ position: 'relative', width: 168, height: 168, flexShrink: 0 }}>
            <Box
              sx={{
                position: 'absolute',
                top: -6,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: `14px solid ${EARN_HUB_GOLD}`,
                zIndex: 2,
              }}
            />
            <Box
              sx={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                border: `3px solid ${alpha(EARN_HUB_GOLD, 0.55)}`,
                background: wheelBg,
                transform: `rotate(${rotation}deg)`,
                transition: spinning
                  ? 'transform 3.1s cubic-bezier(0.12, 0.75, 0.12, 1)'
                  : 'none',
                boxShadow: `inset 0 0 0 10px ${alpha('#0a0a0a', 0.35)}`,
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                inset: '38%',
                borderRadius: '50%',
                bgcolor: '#161618',
                border: `1px solid ${alpha(EARN_HUB_GOLD, 0.35)}`,
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Iconify icon="solar:star-bold" width={18} sx={{ color: EARN_HUB_GOLD }} />
            </Box>
          </Box>

          <Stack spacing={1.25} sx={{ flex: 1, width: '100%' }}>
            <UserActionButton
              onClick={handleSpin}
              disabled={spinning || remaining <= 0}
              sx={{ alignSelf: { sm: 'flex-start' }, minWidth: 140 }}
            >
              {spinning ? (
                <CircularProgress size={16} sx={{ color: '#000' }} />
              ) : (
                <>
                  <Iconify icon="solar:play-bold" width={16} />
                  {remaining > 0 ? t('wallet.spinCta') : t('wallet.spinDone')}
                </>
              )}
            </UserActionButton>

            {lastPrize ? (
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: USER_COLORS.textPrimary }}>
                {t('wallet.spinResult', { label: lastPrize.label })}
                {lastPrize.bacAmount > 0 ? (
                  <>
                    {' · '}
                    <CoinValue value={lastPrize.bacAmount} size={14} />
                  </>
                ) : null}
              </Typography>
            ) : null}

            {spinning ? (
              <LinearProgress
                sx={{
                  height: 4,
                  borderRadius: 999,
                  bgcolor: alpha('#fff', 0.08),
                  '& .MuiLinearProgress-bar': { bgcolor: EARN_HUB_GOLD },
                }}
              />
            ) : null}
          </Stack>
        </Stack>

        <Box
          sx={{
            borderTop: `1px solid ${alpha('#fff', 0.08)}`,
            pt: 1.25,
          }}
        >
          <Typography
            sx={{
              ...userMutedTextSx,
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              mb: 0.75,
            }}
          >
            {t('wallet.spinOdds')}
          </Typography>
          <Stack spacing={0.65}>
            {prizes.map((prize) => (
              <Stack
                key={prize.id}
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{
                  px: 1,
                  py: 0.55,
                  borderRadius: 1,
                  bgcolor: alpha(prize.color || '#fff', 0.08),
                }}
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: prize.color || EARN_HUB_GOLD,
                    flexShrink: 0,
                  }}
                />
                <Typography sx={{ flex: 1, fontSize: 12.5, color: USER_COLORS.textPrimary }}>
                  {prize.label}
                </Typography>
                {prize.bacAmount > 0 ? <CoinValue value={prize.bacAmount} size={12} /> : null}
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: EARN_HUB_GOLD, minWidth: 48, textAlign: 'right' }}>
                  {prize.probability}%
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Stack>
    </UserGlassCard>
  );
}
