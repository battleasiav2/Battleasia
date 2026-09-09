// @mui
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import CircularProgress from '@mui/material/CircularProgress';
// framer-motion
import { m } from 'framer-motion';
// components
import { MotionContainer, varFade } from 'src/components/animate';
import { useSettingsContext } from 'src/components/settings';
import Iconify from 'src/components/iconify';
// hooks
import { useEffect, useState, useCallback } from 'react';
import useApi from 'src/hooks/use-api';

// ----------------------------------------------------------------------

type StatCardProps = {
  title: string;
  value: string | number;
  icon: string;
  color?: 'error' | 'info' | 'success' | 'warning';
  showCoin?: boolean;
};

function StatCard({ title, value, icon, color = 'info', showCoin = false }: StatCardProps) {
  return (
    <Card
      component={m.div}
      variants={varFade().inUp}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      sx={{
        p: 2.75,
        position: 'relative',
        overflow: 'hidden',
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.12)} 0%, #111726 100%)`
            : alpha(theme.palette[color].main, 0.05),
        border: (theme) => `1px solid ${alpha(theme.palette[color].main, 0.22)}`,
        boxShadow: (theme) =>
          theme.palette.mode === 'dark'
            ? `0 10px 30px -10px rgba(0, 0, 0, 0.6), 0 0 16px ${alpha(theme.palette[color].main, 0.08)}`
            : theme.customShadows.card,
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          borderColor: (theme) => alpha(theme.palette[color].main, 0.48),
          boxShadow: (theme) =>
            `0 16px 40px -10px rgba(0, 0, 0, 0.7), 0 0 24px ${alpha(theme.palette[color].main, 0.2)}`,
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: (theme) =>
            `linear-gradient(90deg, transparent, ${theme.palette[color].main}, transparent)`,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: -20,
          right: -20,
          width: 70,
          height: 70,
          borderRadius: '50%',
          background: (theme) =>
            `radial-gradient(circle, ${alpha(theme.palette[color].main, 0.22)} 0%, transparent 70%)`,
          pointerEvents: 'none',
        },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2.2}>
        <Avatar
          sx={{
            width: 58,
            height: 58,
            bgcolor: (theme) => alpha(theme.palette[color].main, 0.14),
            color: (theme) => theme.palette[color].main,
            border: (theme) => `1px solid ${alpha(theme.palette[color].main, 0.3)}`,
            boxShadow: (theme) => `0 0 16px ${alpha(theme.palette[color].main, 0.2)}`,
            borderRadius: '12px',
          }}
        >
          <Iconify icon={icon} sx={{ width: 28, height: 28 }} />
        </Avatar>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              color: 'text.secondary',
              fontWeight: 600,
              fontSize: '0.78rem',
              letterSpacing: '0.02em',
              mb: 0.5,
              textTransform: 'none',
            }}
          >
            {title}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={0.75}>
            {showCoin && (
              <Iconify
                icon="solar:wallet-money-bold"
                sx={{
                  width: 22,
                  height: 22,
                  color: 'warning.main',
                  filter: 'drop-shadow(0 0 6px rgba(245, 166, 35, 0.5))',
                  flexShrink: 0,
                }}
              />
            )}
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                letterSpacing: '-0.02em',
                fontFamily: 'monospace, system-ui',
                fontSize: { xs: '1.2rem', md: '1.35rem' },
                color: 'text.primary',
              }}
            >
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
}

// ----------------------------------------------------------------------

type DashboardData = {
  totalUsers: number;
  totalMatches: number;
  receivedPayment: {
    total: number;
    today: number;
    last7Days: number;
    currentMonth: number;
    currentYear: number;
  };
  withdraw: {
    total: number;
  };
  tournamentProfit: {
    total: number;
    today: number;
    last7Days: number;
    currentMonth: number;
    currentYear: number;
  };
};

const formatCoin = (value: number) => value.toFixed(2);

export default function DashboardView() {
  const settings = useSettingsContext();
  const { getAdminDashboardStatsApi } = useApi();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAdminDashboardStatsApi();
      if (res?.data?.data) {
        setData(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }, [getAdminDashboardStatsApi]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 450 }}>
          <Box
            sx={{
              p: 4,
              borderRadius: '16px',
              bgcolor: 'rgba(17, 23, 38, 0.6)',
              border: '1px solid rgba(245, 166, 35, 0.2)',
              boxShadow: '0 0 30px rgba(0, 0, 0, 0.6)',
              textAlign: 'center',
            }}
          >
            <CircularProgress color="warning" size={48} thickness={3.5} />
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mt: 2,
                fontFamily: 'monospace',
                letterSpacing: '0.1em',
                color: 'warning.main',
              }}
            >
              INITIALIZING TELEMETRY...
            </Typography>
          </Box>
        </Stack>
      </Container>
    );
  }

  if (!data) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <Typography variant="h4" sx={{ mb: 5 }}>
          Dashboard
        </Typography>
        <Typography color="text.secondary">Failed to load dashboard data.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <MotionContainer>
        {/* Header telemetry area */}
        <Box
          sx={{
            mb: 4,
            pb: 2,
            borderBottom: (theme) =>
              theme.palette.mode === 'dark'
                ? '1px solid rgba(245, 166, 35, 0.12)'
                : `1px dashed ${theme.palette.divider}`,
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
            spacing={1.5}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: 'text.primary',
                }}
              >
                Dashboard
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '0.72rem',
                  letterSpacing: '0.08em',
                  color: 'warning.main',
                }}
              >
                SYS TELEMETRY // REAL-TIME ES-OPS MATRIX
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: '6px',
                  bgcolor: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.25)',
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: 'success.main',
                      animation: 'radarBlip 2s infinite ease-in-out',
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: 'success.main',
                    }}
                  >
                    FEED LIVE
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </Stack>
        </Box>

        {/* Dashboard Section */}
        <Box sx={{ mb: 5 }}>
          <Grid container spacing={3}>
            <Grid xs={12} sm={6} md={3}>
              <StatCard
                title="Total User"
                value={data.totalUsers}
                icon="solar:users-group-rounded-bold"
                color="error"
              />
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <StatCard
                title="Total Match"
                value={data.totalMatches}
                icon="solar:gamepad-bold"
                color="success"
              />
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <StatCard
                title="Received Payment"
                value={formatCoin(data.receivedPayment.total)}
                icon="solar:card-bold"
                color="info"
                showCoin
              />
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <StatCard
                title="Withdraw"
                value={formatCoin(data.withdraw.total)}
                icon="solar:banknote-bold"
                color="error"
                showCoin
              />
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <StatCard
                title="Today's Received Payment"
                value={formatCoin(data.receivedPayment.today)}
                icon="solar:card-bold"
                color="info"
                showCoin
              />
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <StatCard
                title="Last 7 day's Received Payment"
                value={formatCoin(data.receivedPayment.last7Days)}
                icon="solar:card-bold"
                color="error"
                showCoin
              />
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <StatCard
                title="Current Month's Received Payment"
                value={formatCoin(data.receivedPayment.currentMonth)}
                icon="solar:card-bold"
                color="success"
                showCoin
              />
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <StatCard
                title="Current Year's Received Payment"
                value={formatCoin(data.receivedPayment.currentYear)}
                icon="solar:card-bold"
                color="info"
                showCoin
              />
            </Grid>
          </Grid>
        </Box>

        {/* Admin Profit Section */}
        <Box sx={{ mb: 5 }}>
          <Box
            sx={{
              mb: 3,
              p: 2,
              borderRadius: '10px',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(245, 166, 35, 0.04)' : 'rgba(0,0,0,0.02)',
              border: (theme) =>
                theme.palette.mode === 'dark'
                  ? '1px solid rgba(245, 166, 35, 0.14)'
                  : `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary' }}>
              Admin Profit
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              By Tournament Match
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid xs={12} sm={6} md={3}>
              <StatCard
                title="Total"
                value={formatCoin(data.tournamentProfit.total)}
                icon="solar:card-bold"
                color="error"
                showCoin
              />
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <StatCard
                title="Today's Income"
                value={formatCoin(data.tournamentProfit.today)}
                icon="solar:card-bold"
                color="error"
                showCoin
              />
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <StatCard
                title="Last 7 day's Income"
                value={formatCoin(data.tournamentProfit.last7Days)}
                icon="solar:card-bold"
                color="error"
                showCoin
              />
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <StatCard
                title="Current Month's Income"
                value={formatCoin(data.tournamentProfit.currentMonth)}
                icon="solar:card-bold"
                color="error"
                showCoin
              />
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <StatCard
                title="Current Year's Income"
                value={formatCoin(data.tournamentProfit.currentYear)}
                icon="solar:card-bold"
                color="error"
                showCoin
              />
            </Grid>
          </Grid>
        </Box>
      </MotionContainer>
    </Container>
  );
}

