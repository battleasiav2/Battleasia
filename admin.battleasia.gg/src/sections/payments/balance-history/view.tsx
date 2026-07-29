import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Card,
  Chip,
  Container,
  Divider,
  Stack,
  Typography,
  Avatar,
  Tooltip,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  DataGrid,
  GridColDef,
  GridFilterModel,
  GridRenderCellParams,
  GridToolbar,
} from '@mui/x-data-grid';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import toast from 'react-hot-toast';

import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import useApi from 'src/hooks/use-api';
import { API_URL } from 'src/config-global';
import { usePermissions } from 'src/hooks/use-permissions';
import { PERMISSIONS } from 'src/constants/permissions';

type DateRangeValue = [Date | null, Date | null];

type BalanceHistoryRow = {
  id: string;
  userId?: string;
  username?: string;
  email?: string;
  avatar?: string;
  performedBy?: string;
  adminName?: string;
  amount: number;
  type: 'deposit' | 'withdraw';
  balanceBefore: number;
  balanceAfter: number;
  detail?: Record<string, any>;
  createdAt?: Date | null;
};

export default function BalanceHistoryView() {
  const settings = useSettingsContext();
  const { getBalanceHistoriesApi } = useApi();
  const { hasPermission } = usePermissions();

  const [rows, setRows] = useState<BalanceHistoryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });
  const [dateRange, setDateRange] = useState<DateRangeValue>([null, null]);

  const fetchBalanceHistories = useCallback(async () => {
    if (!hasPermission(PERMISSIONS.PAYMENTS.VIEW)) {
      toast.error('You do not have permission to view payment history');
      return;
    }
    
    setLoading(true);
    try {
      const [startDate, endDate] = dateRange;
      const response = await getBalanceHistoriesApi({
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        search,
        startDate: startDate ? startDate.toISOString() : undefined,
        endDate: endDate ? endDate.toISOString() : undefined,
      });

      if (response?.data?.status && response.data.data) {
        const { results, count } = response.data.data;
        setRows(
          results.map((history: any) => ({
            ...history,
            adminName: history?.detail?.adminName || undefined,
            id: history._id || history.id,
            createdAt: history.createdAt ? new Date(history.createdAt) : null,
          }))
        );
        setTotalCount(count);
      }
    } catch (error: any) {
      console.error('Failed to fetch balance history:', error);
      toast.error(error?.response?.data || 'Failed to fetch balance history');
    } finally {
      setLoading(false);
    }
  }, [dateRange, getBalanceHistoriesApi, paginationModel.page, paginationModel.pageSize, search, hasPermission]);

  useEffect(() => {
    fetchBalanceHistories();
  }, [fetchBalanceHistories]);

  const handleDateRangeChange = useCallback((newValue: DateRangeValue) => {
    setDateRange(newValue);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, []);

  const handleRefresh = useCallback(() => {
    fetchBalanceHistories();
  }, [fetchBalanceHistories]);

  const onFilterChange = useCallback((filterModel: GridFilterModel) => {
    let value = filterModel.quickFilterValues ? filterModel.quickFilterValues[0] : '';
    if (!value) {
      setSearch('');
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
      return;
    }
    // eslint-disable-next-line no-useless-escape
    value = value.replace(/[\]\[{}()\\]+/g, '');
    setSearch(value);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, []);

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
      }),
    []
  );

  const columns = useMemo<GridColDef<BalanceHistoryRow>[]>(() => [
    {
      field: 'user',
      headerName: 'Player',
      flex: 1,
      minWidth: 240,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<BalanceHistoryRow>) => (
        <UserCell row={params.row} />
      ),
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 140,
      renderCell: (params) =>
        params.value === 0 || params.value ? currencyFormatter.format(Number(params.value)) : '—',
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 120,
      renderCell: (params) => {
        const detail = params.row.detail;
        const reason = detail?.reason;

        let label = params.value === 'deposit' ? 'Earning' : 'Betting';
        let color: 'success' | 'info' | 'primary' | 'warning' = params.value === 'deposit' ? 'success' : 'info';

        if (reason === 'match_entry_fee') {
          label = 'Betting';
          color = 'info';
        } else if (reason === 'match_winnings' || reason === 'match_result_update' || reason === 'match_winner_refund_return') {
          label = 'Earning';
          color = 'success';
        } else if (reason === 'withdrawal_approved') {
          label = 'Withdrawal';
          color = 'warning';
        } else if (detail?.deposit_id) {
          label = 'Deposit';
          color = 'primary';
        }

        return <Chip label={label} color={color} size="small" />;
      },
    },
    {
      field: 'balanceBefore',
      headerName: 'Balance Before',
      width: 150,
      renderCell: (params) => Number(params.value ?? 0).toLocaleString(),
    },
    {
      field: 'balanceAfter',
      headerName: 'Balance After',
      width: 150,
      renderCell: (params) => Number(params.value ?? 0).toLocaleString(),
    },
    {
      field: 'performedBy',
      headerName: 'Handled By',
      width: 180,
      renderCell: (params) => (
        <Stack spacing={0.25}>
          <Typography variant="subtitle2" noWrap>
            {params.row.adminName || 'System'}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {params.value || '—'}
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'detail',
      headerName: 'Detail',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => <DetailCell detail={params.value} />,
    },
    {
      field: 'createdAt',
      headerName: 'Created At',
      width: 180,
      type: 'dateTime',
    },
  ], [currencyFormatter]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Typography variant="h4">Balance History</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, maxWidth: 720 }}>
        Track every manual balance adjustment, who performed it, and the before/after values. Filter by date range or search for players and admins.
      </Typography>

      <Card sx={{ mt: 4 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          gap={2}
          p={3}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          flexWrap="wrap"
        >
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                Created Date
              </Typography>
              <DateRangePicker
                value={dateRange}
                onChange={(newValue) => handleDateRangeChange(newValue as DateRangeValue)}
                slotProps={{
                  textField: { size: 'small' },
                }}
              />
            </Stack>
          </LocalizationProvider>

          <LoadingButton
            variant="contained"
            color="info"
            loading={loading}
            onClick={handleRefresh}
            startIcon={<Iconify icon="flowbite:refresh-outline" />}
          >
            Refresh
          </LoadingButton>
        </Stack>

        <Divider />

        <Stack p={3} pt={1.5}>
          <DataGrid
            autoHeight
            rows={rows}
            rowCount={totalCount}
            columns={columns}
            loading={loading}
            disableRowSelectionOnClick
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            onFilterModelChange={onFilterChange}
            filterMode="server"
            paginationMode="server"
            pageSizeOptions={[5, 10, 25, 50]}
            slots={{
              toolbar: GridToolbar,
            }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 250 },
              },
            }}
          />
        </Stack>
      </Card>
    </Container>
  );
}

type UserCellProps = {
  row: BalanceHistoryRow;
};

function UserCell({ row }: UserCellProps) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
      <Avatar src={row.avatar ? `${API_URL}${row.avatar}` : undefined} alt={row.username} />
      <Stack minWidth={0}>
        <Typography variant="subtitle2" noWrap>
          {row.username || 'Unknown user'}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {row.email || row.userId || '—'}
        </Typography>
      </Stack>
    </Stack>
  );
}

type DetailCellProps = {
  detail?: Record<string, any>;
};

function DetailCell({ detail }: DetailCellProps) {
  if (!detail || Object.keys(detail).length === 0) {
    return <Typography variant="body2">—</Typography>;
  }

  const displayText =
    detail.note ||
    detail.description ||
    detail.reason ||
    JSON.stringify(detail, null, 0);

  return (
    <Tooltip title={<pre style={{ margin: 0 }}>{JSON.stringify(detail, null, 2)}</pre>} arrow>
      <Typography variant="body2" noWrap sx={{ maxWidth: 260 }}>
        {displayText}
      </Typography>
    </Tooltip>
  );
}


