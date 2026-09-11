import { useMemo, useState, useEffect, useCallback } from 'react';

import { alpha } from '@mui/material/styles';
import {
  Box,
  Stack,
  Divider,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';

import { toast } from 'react-hot-toast';

import useApi from 'src/hooks/use-api';
import { useLiveSync, LIVE_SYNC_TOPICS } from 'src/hooks/use-live-sync';
import { useTranslate } from 'src/locales/use-locales';
import { useSelector } from 'src/store';
import {
  goldAlpha,
  USER_COLORS,
  userFieldSx,
  UserStatTile,
  UserPageShell,
  UserGlassCard,
  UserEmptyState,
  userMutedTextSx,
  UserActionButton,
  userFieldLabelProps,
} from 'src/layouts/user';

import { Iconify } from 'src/components/iconify';
import { CoinValue } from 'src/components/coin-value';
import { getGlassInnerSx, getDefaultGlassTokens } from 'src/components/battle-glass-card';

// ----------------------------------------------------------------------

type TransferSettings = {
  enabled: boolean;
  feePercent: number;
  minAmount: number;
  maxAmount: number;
};

type TransferHistoryItem = {
  id: string;
  direction: 'sent' | 'received' | 'unknown';
  counterpartyUsername: string;
  amount: number;
  feeAmount: number;
  feePercent: number;
  totalDebited: number;
  note: string;
  createdAt: string | Date | null;
};

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!error) return fallback;
  if (typeof error === 'string' && error.trim()) return error;
  if (typeof error === 'object') {
    const err = error as { message?: unknown; response?: { data?: { message?: unknown } } };
    const nested = err.response?.data?.message;
    if (typeof nested === 'string' && nested.trim()) return nested;
    if (typeof err.message === 'string' && err.message.trim()) return err.message;
  }
  return fallback;
}

function formatTransferDate(value: string | Date | null, locale: string) {
  if (!value) return 'â€”';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return 'â€”';
  return date.toLocaleString(locale, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ----------------------------------------------------------------------

export function ShopWalletView() {
  const { user } = useSelector((state) => state.auth);
  const { getTransferSettingsApi, submitCoinTransferApi, getTransferHistoryApi } = useApi();
  const { t, currentLang } = useTranslate();
  const tokens = getDefaultGlassTokens();

  const [settings, setSettings] = useState<TransferSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [history, setHistory] = useState<TransferHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [recipientUsername, setRecipientUsername] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const balance = Number(user?.balance ?? 0);

  const parsedAmount = useMemo(() => {
    const value = Number(amount);
    return Number.isFinite(value) && value > 0 ? value : 0;
  }, [amount]);

  const feePreview = useMemo(() => {
    if (!settings || parsedAmount <= 0) {
      return { feeAmount: 0, totalDebited: 0 };
    }
    const feeAmount = Math.round(((parsedAmount * settings.feePercent) / 100) * 100) / 100;
    return {
      feeAmount,
      totalDebited: Math.round((parsedAmount + feeAmount) * 100) / 100,
    };
  }, [parsedAmount, settings]);

  const loadSettings = useCallback(async () => {
    try {
      setSettingsLoading(true);
      const res = await getTransferSettingsApi();
      setSettings(res?.data?.data ?? null);
    } catch {
      setSettings(null);
    } finally {
      setSettingsLoading(false);
    }
  }, [getTransferSettingsApi]);

  const loadHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      const res = await getTransferHistoryApi({ limit: 20 });
      const results = res?.data?.results ?? res?.data?.data?.results ?? [];
      setHistory(
        results.map((item: any) => ({
          id: item.id || item._id,
          direction: item.direction || 'unknown',
          counterpartyUsername: item.counterpartyUsername || '',
          amount: Number(item.amount) || 0,
          feeAmount: Number(item.feeAmount) || 0,
          feePercent: Number(item.feePercent) || 0,
          totalDebited: Number(item.totalDebited) || 0,
          note: item.note || '',
          createdAt: item.createdAt ?? null,
        }))
      );
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [getTransferHistoryApi]);

  useEffect(() => {
    loadSettings();
    loadHistory();
  }, [loadSettings, loadHistory]);

  useLiveSync(loadHistory, LIVE_SYNC_TOPICS.wallet);

  const handleSubmit = async () => {
    if (!settings?.enabled) {
      toast.error(t('shop.transferDisabled'));
      return;
    }

    if (!recipientUsername.trim()) {
      toast.error(t('shop.transferRecipientRequired'));
      return;
    }

    if (parsedAmount <= 0) {
      toast.error(t('shop.transferAmountRequired'));
      return;
    }

    if (feePreview.totalDebited > balance) {
      toast.error(t('shop.transferInsufficientBalance'));
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitCoinTransferApi({
        recipientUsername: recipientUsername.trim(),
        amount: parsedAmount,
        note: note.trim() || undefined,
      });

      if (res?.data?.status === false) {
        throw new Error(res?.data?.message || t('shop.transferFailed'));
      }

      toast.success(t('shop.transferSuccess'));
      setRecipientUsername('');
      setAmount('');
      setNote('');
      await loadHistory();
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('shop.transferFailed')));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <UserPageShell>
      <Stack spacing={{ xs: 3, md: 4 }}>
        <Box>
          <Typography
            className="font-tr"
            sx={{
              fontSize: { xs: 22, md: 28 },
              fontWeight: 900,
              textTransform: 'uppercase',
              color: USER_COLORS.textPrimary,
              letterSpacing: 0.8,
              textShadow: `0 0 20px ${goldAlpha(0.25)}`,
            }}
          >
            {t('shop.transferTitle')}
          </Typography>
          <Typography sx={{ ...userMutedTextSx, fontSize: 13.5, maxWidth: 580, lineHeight: 1.6 }}>
            {t('shop.transferSubtitle')}
          </Typography>
        </Box>

        {/* Telemetry Stat Tiles Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
            gap: 1.75,
          }}
        >
          <UserStatTile label={t('shop.transferYourBalance')} value={String(balance)} suffix="BAC" />
          <UserStatTile
            label={t('shop.transferFeeRate')}
            value={settingsLoading ? 'â€¦' : `${settings?.feePercent ?? 0}%`}
          />
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <UserStatTile
              label={t('shop.transferLimit')}
              value={settings ? `${settings.minAmount}â€“${settings.maxAmount}` : 'â€”'}
            />
          </Box>
        </Box>

        {/* Transfer Form Vault Card */}
        <Box
          sx={{
            p: { xs: 2.25, md: 3 },
            bgcolor: alpha('#06090e', 0.75),
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            border: `1px solid ${goldAlpha(0.28)}`,
            borderTop: `2px solid ${USER_COLORS.gold}`,
            boxShadow: `0 12px 36px ${alpha('#000000', 0.7)}, inset 0 0 20px ${goldAlpha(0.04)}`,
            clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)',
          }}
        >
          {settingsLoading ? (
            <Stack alignItems="center" py={4}>
              <CircularProgress size={32} sx={{ color: USER_COLORS.gold }} />
            </Stack>
          ) : !settings?.enabled ? (
            <UserEmptyState
              icon="solar:transfer-horizontal-bold-duotone"
              title={t('shop.transferDisabledTitle')}
              description={t('shop.transferDisabled')}
            />
          ) : (
            <Stack spacing={2.25}>
              <Stack direction="row" alignItems="center" spacing={1.25}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: goldAlpha(0.16),
                    border: `1px solid ${goldAlpha(0.35)}`,
                    color: USER_COLORS.gold,
                  }}
                >
                  <Iconify icon="solar:transfer-horizontal-bold" width={18} />
                </Box>
                <Typography sx={{ fontSize: 16, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5, color: USER_COLORS.textPrimary }}>
                  {t('shop.transferFormTitle')}
                </Typography>
              </Stack>

              <TextField
                fullWidth
                label={t('shop.transferRecipient')}
                placeholder={t('shop.transferRecipientPlaceholder')}
                value={recipientUsername}
                onChange={(e) => setRecipientUsername(e.target.value)}
                sx={userFieldSx}
                InputLabelProps={userFieldLabelProps}
              />

              <TextField
                fullWidth
                type="number"
                label={t('shop.transferAmount')}
                placeholder={t('shop.transferAmountPlaceholder')}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputProps={{ min: settings.minAmount, max: settings.maxAmount, step: 0.01 }}
                sx={userFieldSx}
                InputLabelProps={userFieldLabelProps}
              />

              <TextField
                fullWidth
                label={t('shop.transferNote')}
                placeholder={t('shop.transferNotePlaceholder')}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                multiline
                minRows={2}
                sx={userFieldSx}
                InputLabelProps={userFieldLabelProps}
              />

              {parsedAmount > 0 ? (
                <Box
                  sx={{
                    p: 2,
                    bgcolor: alpha('#000000', 0.65),
                    border: `1px solid ${goldAlpha(0.35)}`,
                    clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
                    boxShadow: `0 8px 24px ${alpha('#000000', 0.6)}, inset 0 0 14px ${goldAlpha(0.06)}`,
                  }}
                >
                  <Stack spacing={1.25}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography sx={{ ...userMutedTextSx, fontSize: 12.5 }}>{t('shop.transferAmount')}</Typography>
                      <CoinValue value={parsedAmount} />
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography sx={{ ...userMutedTextSx, fontSize: 12.5 }}>
                        {t('shop.transferFee', { percent: settings.feePercent })}
                      </Typography>
                      <CoinValue value={feePreview.feeAmount} />
                    </Stack>
                    <Divider sx={{ borderColor: alpha('#ffffff', 0.12) }} />
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography sx={{ fontSize: 13.5, fontWeight: 900, color: USER_COLORS.textPrimary, letterSpacing: 0.5 }}>
                        {t('shop.transferTotalDebit')}
                      </Typography>
                      <CoinValue value={feePreview.totalDebited} sx={{ fontWeight: 900, color: USER_COLORS.gold, fontSize: 17 }} />
                    </Stack>
                  </Stack>
                </Box>
              ) : null}

              <UserActionButton
                actionVariant="gold"
                size="large"
                fullWidth
                disabled={submitting}
                onClick={handleSubmit}
                startIcon={
                  submitting ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <Iconify icon="solar:plain-bold" width={18} />
                  )
                }
                sx={{
                  height: { xs: 50, md: 54 },
                  fontSize: 14,
                  fontWeight: 900,
                  letterSpacing: 1,
                  borderRadius: 0,
                  clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
                  boxShadow: `0 8px 24px ${goldAlpha(0.35)}`,
                }}
              >
                {submitting ? t('shop.transferSending') : t('shop.transferSend')}
              </UserActionButton>
            </Stack>
          )}
        </Box>

        {/* Transfer History Card */}
        <Box
          sx={{
            p: { xs: 2.25, md: 3 },
            bgcolor: alpha('#06090e', 0.75),
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            border: `1px solid ${goldAlpha(0.28)}`,
            borderTop: `2px solid ${USER_COLORS.gold}`,
            boxShadow: `0 12px 36px ${alpha('#000000', 0.7)}, inset 0 0 20px ${goldAlpha(0.04)}`,
            clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)',
          }}
        >
          <Typography
            className="font-tr"
            sx={{
              fontSize: { xs: 16, md: 18 },
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              color: USER_COLORS.gold,
              mb: 2.5,
            }}
          >
            {t('shop.transferHistoryTitle')}
          </Typography>

          {historyLoading ? (
            <Typography sx={{ ...userMutedTextSx, textAlign: 'center', py: 4 }}>
              {t('common.loading')}
            </Typography>
          ) : history.length === 0 ? (
            <UserEmptyState
              icon="solar:history-bold-duotone"
              title={t('shop.transferHistoryEmpty')}
              description={t('shop.transferHistoryEmptyHint')}
            />
          ) : (
            <Stack spacing={1.5}>
              {history.map((item) => {
                const isSent = item.direction === 'sent';
                return (
                  <Box key={item.id} sx={getGlassInnerSx(tokens, { p: 1.75, borderRadius: 0 })}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
                      <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                        <Stack direction="row" alignItems="center" spacing={0.8}>
                          <Iconify
                            icon={isSent ? 'solar:arrow-right-up-bold' : 'solar:arrow-left-down-bold'}
                            width={16}
                            sx={{ color: isSent ? '#f87171' : USER_COLORS.gold, flexShrink: 0 }}
                          />
                          <Typography sx={{ fontSize: 13.5, fontWeight: 800, color: USER_COLORS.textPrimary }}>
                            {isSent ? t('shop.transferSentTo') : t('shop.transferReceivedFrom')}{' '}
                            @{item.counterpartyUsername}
                          </Typography>
                        </Stack>
                        <Typography sx={{ ...userMutedTextSx, fontSize: 11.5 }}>
                          {formatTransferDate(item.createdAt, currentLang.value)}
                        </Typography>
                        {item.note ? (
                          <Typography sx={{ ...userMutedTextSx, fontSize: 11.5, fontStyle: 'italic' }}>
                            {item.note}
                          </Typography>
                        ) : null}
                        {isSent && item.feeAmount > 0 ? (
                          <Typography sx={{ ...userMutedTextSx, fontSize: 11 }}>
                            {t('shop.transferFeeLine', { fee: item.feeAmount, percent: item.feePercent })}
                          </Typography>
                        ) : null}
                      </Stack>
                      <Stack alignItems="flex-end" spacing={0.25} sx={{ flexShrink: 0 }}>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <Typography
                            component="span"
                            sx={{
                              fontWeight: 900,
                              fontSize: 15,
                              color: isSent ? '#f87171' : USER_COLORS.gold,
                            }}
                          >
                            {isSent ? 'âˆ’' : '+'}
                          </Typography>
                          <CoinValue
                            value={isSent ? item.totalDebited : item.amount}
                            textSx={{
                              fontWeight: 900,
                              fontSize: 15,
                              color: isSent ? '#f87171' : USER_COLORS.gold,
                            }}
                          />
                        </Stack>
                        <Typography sx={{ ...userMutedTextSx, fontSize: 10, fontWeight: 700 }}>BAC</Typography>
                      </Stack>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Box>
      </Stack>
    </UserPageShell>
  );
}

