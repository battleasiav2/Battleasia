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
// components
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
      sx={{
        p: 3,
        position: 'relative',
        overflow: 'hidden',
        bgcolor: (theme) => alpha(theme.palette[color].main, 0.08),
        border: (theme) => `1px solid ${alpha(theme.palette[color].main, 0.16)}`,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2}>
        <Avatar
          sx={{
            width: 64,
            height: 64,
            bgcolor: (theme) => alpha(theme.palette[color].main, 0.16),
            color: (theme) => theme.palette[color].main,
          }}
        >
          <Iconify icon={icon} sx={{ width: 32, height: 32 }} />
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>
            {title}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            {showCoin && (
              <Iconify icon="solar:wallet-money-bold" sx={{ width: 20, height: 20, color: 'warning.main' }} />
            )}
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
}

// ----------------------------------------------------------------------

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
        <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 400 }}>
          <CircularProgress />
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
      <Typography variant="h4" sx={{ mb: 5 }}>
        Dashboard
      </Typography>

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
        <Typography variant="h5" sx={{ mb: 1 }}>
          Admin Profit
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          By Tournament Match
        </Typography>
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
    </Container>
  );
}

