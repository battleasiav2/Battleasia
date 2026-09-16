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
import { useTranslate } from 'src/locales/use-locales';
import { useSelector, useDispatch } from 'src/store';
import { balanceAction } from 'src/store/reducers/auth';
import {
  USER_COLORS,
  UserStatTile,
  UserPageShell,
  UserEmptyState,
  userMutedTextSx,
  UserActionButton,
} from 'src/layouts/user';
import { goldAlpha } from 'src/theme/accent-presets';

import { Iconify } from 'src/components/iconify';
import CoinValue from 'src/components/coin-value';
import { SHOP_PANEL_SX, SHOP_FIELD_SX, SHOP_FIELD_LABEL_PROPS } from '../shop/shop-styles';
import { WalletHero } from './wallet-hero';

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
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(locale, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ----------------------------------------------------------------------

export function TransferView() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { getTransferSettingsApi, submitCoinTransferApi, getTransferHistoryApi, initialize } =
    useApi();
  const { t, currentLang } = useTranslate();

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
      const data = res?.data?.data ?? res?.data ?? {};
      setSettings({
        enabled: data.enabled !== false,
        feePercent: Number(data.feePercent ?? 0),
        minAmount: Number(data.minAmount ?? 1),
        maxAmount: Number(data.maxAmount ?? 10000),
      });
    } catch {
      setSettings({ enabled: false, feePercent: 0, minAmount: 1, maxAmount: 10000 });
    } finally {
      setSettingsLoading(false);
    }
  }, [getTransferSettingsApi]);

  const loadHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      const res = await getTransferHistoryApi({ limit: 20 });
      const payload = res?.data?.data ?? res?.data ?? {};
      const results = Array.isArray(payload?.results) ? payload.results : Array.isArray(payload) ? payload : [];
      setHistory(
        results.map((row: any) => ({
          id: String(row.id ?? row._id ?? Math.random()),
          direction: row.direction === 'sent' || row.direction === 'received' ? row.direction : 'unknown',
          counterpartyUsername: String(row.counterpartyUsername ?? row.username ?? 'player'),
          amount: Number(row.amount ?? 0),
          feeAmount: Number(row.feeAmount ?? 0),
          feePercent: Number(row.feePercent ?? 0),
          totalDebited: Number(row.totalDebited ?? row.amount ?? 0),
          note: String(row.note ?? ''),
          createdAt: row.createdAt ?? null,
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

  const handleSubmit = async () => {
    if (!settings?.enabled) {
      toast.error(t('transfer.disabled'));
      return;
    }
    if (!recipientUsername.trim()) {
      toast.error(t('transfer.recipientRequired'));
      return;
    }
    if (parsedAmount <= 0) {
      toast.error(t('transfer.amountRequired'));
      return;
    }
    if (feePreview.totalDebited > balance) {
      toast.error(t('transfer.insufficientBalance'));
      return;
    }

    try {
      setSubmitting(true);
      const res = await submitCoinTransferApi({
        recipientUsername: recipientUsername.trim(),
        amount: parsedAmount,
        note: note.trim() || undefined,
      });
      if (res?.data?.status === false) {
        throw new Error(res?.data?.message || t('transfer.failed'));
      }
      toast.success(t('transfer.success'));
      setRecipientUsername('');
      setAmount('');
      setNote('');
      await loadHistory();
      try {
        const me = await initialize();
        const nextBalance = me?.data?.user?.balance ?? me?.data?.balance;
        if (typeof nextBalance === 'number') dispatch(balanceAction(nextBalance));
      } catch {
        // ignore refresh errors
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('transfer.failed')));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <UserPageShell>
      <Stack spacing={{ xs: 3, md: 3.5 }}>
        <WalletHero
          title={t('transfer.title')}
          subtitle={t('transfer.subtitle')}
        />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
            gap: 1.75,
          }}
        >
          <UserStatTile label={t('transfer.yourBalance')} value={String(balance)} suffix="BAC" />
          <UserStatTile
            label={t('transfer.feeRate')}
            value={settingsLoading ? '…' : `${settings?.feePercent ?? 0}%`}
          />
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <UserStatTile
              label={t('transfer.limit')}
              value={settings ? `${settings.minAmount}–${settings.maxAmount}` : '—'}
            />
          </Box>
        </Box>

        <Box sx={{ ...SHOP_PANEL_SX, p: { xs: 2.25, md: 3 } }}>
          {settingsLoading ? (
            <Stack alignItems="center" py={4}>
              <CircularProgress size={32} sx={{ color: USER_COLORS.gold }} />
            </Stack>
          ) : !settings?.enabled ? (
            <UserEmptyState
              icon="solar:transfer-horizontal-bold-duotone"
              title={t('transfer.disabledTitle')}
              description={t('transfer.disabled')}
            />
          ) : (
            <Stack spacing={2.25}>
              <Stack direction="row" alignItems="center" spacing={1.25}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '10px',
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
                <Typography
                  sx={{
                    fontSize: 16,
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    color: USER_COLORS.textPrimary,
                  }}
                >
                  {t('transfer.formTitle')}
                </Typography>
              </Stack>

              <TextField
                fullWidth
                label={t('transfer.recipient')}
                placeholder={t('transfer.recipientPlaceholder')}
                value={recipientUsername}
                onChange={(e) => setRecipientUsername(e.target.value)}
                sx={SHOP_FIELD_SX}
                InputLabelProps={SHOP_FIELD_LABEL_PROPS}
              />
              <TextField
                fullWidth
                type="number"
                label={t('transfer.amount')}
                placeholder={t('transfer.amountPlaceholder')}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputProps={{ min: settings.minAmount, max: settings.maxAmount, step: 0.01 }}
                sx={SHOP_FIELD_SX}
                InputLabelProps={SHOP_FIELD_LABEL_PROPS}
              />
              <TextField
                fullWidth
                label={t('transfer.note')}
                placeholder={t('transfer.notePlaceholder')}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                multiline
                minRows={2}
                sx={SHOP_FIELD_SX}
                InputLabelProps={SHOP_FIELD_LABEL_PROPS}
              />

              {parsedAmount > 0 ? (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    bgcolor: alpha('#000000', 0.45),
                    border: `1px solid ${goldAlpha(0.28)}`,
                  }}
                >
                  <Stack spacing={1.25}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography sx={{ ...userMutedTextSx, fontSize: 12.5 }}>{t('transfer.amount')}</Typography>
                      <CoinValue value={parsedAmount} />
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography sx={{ ...userMutedTextSx, fontSize: 12.5 }}>
                        {t('transfer.fee', { percent: settings.feePercent })}
                      </Typography>
                      <CoinValue value={feePreview.feeAmount} />
                    </Stack>
                    <Divider sx={{ borderColor: alpha('#ffffff', 0.12) }} />
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography sx={{ fontSize: 13.5, fontWeight: 900, color: USER_COLORS.textPrimary }}>
                        {t('transfer.totalDebit')}
                      </Typography>
                      <CoinValue value={feePreview.totalDebited} />
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
                    <Iconify icon="solar:card-transfer-bold" width={18} />
                  )
                }
                sx={{ height: { xs: 50, md: 54 }, fontWeight: 900, letterSpacing: 1 }}
              >
                {submitting ? t('transfer.sending') : t('transfer.send')}
              </UserActionButton>
            </Stack>
          )}
        </Box>

        <Box sx={{ ...SHOP_PANEL_SX, p: { xs: 2.25, md: 3 } }}>
          <Typography
            sx={{
              fontSize: { xs: 16, md: 18 },
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              color: USER_COLORS.gold,
              mb: 2.5,
            }}
          >
            {t('transfer.historyTitle')}
          </Typography>

          {historyLoading ? (
            <Typography sx={{ ...userMutedTextSx, textAlign: 'center', py: 4 }}>Loading…</Typography>
          ) : history.length === 0 ? (
            <UserEmptyState
              icon="solar:history-bold-duotone"
              title={t('transfer.historyEmpty')}
              description={t('transfer.historyEmptyHint')}
            />
          ) : (
            <Stack spacing={1.5}>
              {history.map((item) => {
                const isSent = item.direction === 'sent';
                return (
                  <Box
                    key={item.id}
                    sx={{
                      p: 1.75,
                      borderRadius: '12px',
                      bgcolor: alpha('#000000', 0.35),
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
                      <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                        <Stack direction="row" alignItems="center" spacing={0.8}>
                          <Iconify
                            icon={isSent ? 'solar:arrow-right-up-bold' : 'solar:arrow-left-down-bold'}
                            width={16}
                            sx={{ color: isSent ? '#f87171' : USER_COLORS.gold, flexShrink: 0 }}
                          />
                          <Typography sx={{ fontSize: 13.5, fontWeight: 800, color: USER_COLORS.textPrimary }}>
                            {isSent ? t('transfer.sentTo') : t('transfer.receivedFrom')} @{item.counterpartyUsername}
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
                      </Stack>
                      <Stack alignItems="flex-end" spacing={0.25} sx={{ flexShrink: 0 }}>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <Typography
                            component="span"
                            sx={{ fontWeight: 900, fontSize: 15, color: isSent ? '#f87171' : '#ffffff' }}
                          >
                            {isSent ? '−' : '+'}
                          </Typography>
                          <CoinValue value={isSent ? item.totalDebited : item.amount} />
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
