import { useCallback, useEffect, useMemo, useState } from 'react';
// @mui
import {
  Avatar,
  Container,
  Typography,
  Card,
  Chip,
  Divider,
  Stack,
} from '@mui/material';

import LoadingButton from '@mui/lab/LoadingButton';
import {
  DataGrid,
  GridColDef,
  GridFilterModel,
  GridRenderCellParams,
  GridToolbar,
} from '@mui/x-data-grid';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import toast from 'react-hot-toast';
// components
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import useApi from 'src/hooks/use-api';
import { FlagIcon } from 'src/components/flag-icon';
import { API_URL } from 'src/config-global';

type DateRangeValue = [Date | null, Date | null];

type LoginHistoryRow = {
  id: string;
  userId?: string;
  username?: string;
  email?: string;
  avatar?: string;
  ip?: string;
  country?: string;
  useragent?: any;
  createdAt: Date | null;
};

export default function UserHistoryView() {
  const settings = useSettingsContext();
  const { getLoginHistoriesApi } = useApi();

  const [rows, setRows] = useState<LoginHistoryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });
  const [dateRange, setDateRange] = useState<DateRangeValue>([null, null]);

  const fetchLoginHistories = useCallback(async () => {
    setLoading(true);
    try {
      const [startDate, endDate] = dateRange;
      const response = await getLoginHistoriesApi({
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
            id: history._id || history.id,
            createdAt: history.createdAt ? new Date(history.createdAt) : null,
          }))
        );
        setTotalCount(count);
      }
    } catch (error: any) {
      console.error('Failed to fetch login histories:', error);
      toast.error(error?.response?.data || 'Failed to fetch login histories');
    } finally {
      setLoading(false);
    }
  }, [dateRange, getLoginHistoriesApi, paginationModel, search]);

  useEffect(() => {
    fetchLoginHistories();
  }, [fetchLoginHistories]);

  const handleDateRangeChange = useCallback((newValue: DateRangeValue) => {
    setDateRange(newValue);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, []);

  const handleRefresh = useCallback(() => {
    fetchLoginHistories();
  }, [fetchLoginHistories]);

  const onFilterChange = useCallback((filterModel: GridFilterModel) => {
    let value = filterModel.quickFilterValues ? filterModel.quickFilterValues[0] : '';
    if (!value) {
      setSearch(value);
      return;
    }
    // eslint-disable-next-line no-useless-escape
    value = value.replace(/[\]\[{}()\\]+/g, '');
    setSearch(value);
  }, []);

  const columns = useMemo<GridColDef<LoginHistoryRow>[]>(
    () => [
      {
        field: 'user',
        headerName: 'User',
        flex: 1,
        minWidth: 240,
        sortable: false,
        filterable: false,
        renderCell: (params: GridRenderCellParams<LoginHistoryRow>) => (
          <UserCell row={params.row} />
        ),
      },
      { field: 'ip', headerName: 'IP Address', width: 140 },
      {
        field: 'country',
        headerName: 'Country',
        width: 150,
        renderCell: (params: GridRenderCellParams<LoginHistoryRow, string>) => {
          const countryCode = params.value;
          if (!countryCode) {
            return <Chip label="N/A" size="small" variant="outlined" />;
          }
          return (
            <Stack direction="row" spacing={1} alignItems="center" height={1} >
              <FlagIcon code={countryCode} />
              <Typography variant="body2">{countryCode}</Typography>
            </Stack>
          );
        },
      },
      {
        field: 'useragent.browser',
        headerName: 'Browser',
        width: 120,
        valueGetter: (_value, row: LoginHistoryRow) => row?.useragent?.browser ?? 'N/A',
      },
      {
        field: 'useragent.version',
        headerName: 'Version',
        width: 120,
        valueGetter: (_value, row: LoginHistoryRow) => row?.useragent?.version ?? 'N/A',
      },
      {
        field: 'useragent.os',
        headerName: 'OS',
        width: 130,
        valueGetter: (_value, row: LoginHistoryRow) => row?.useragent?.os ?? 'N/A',
      },
      {
        field: 'useragent.platform',
        headerName: 'Platform',
        width: 130,
        valueGetter: (_value, row: LoginHistoryRow) => row?.useragent?.platform ?? 'N/A',
      },
      {
        field: 'createdAt',
        headerName: 'Logged At',
        width: 180,
        type: 'dateTime',
      },
    ],
    []
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Typography variant="h4">Login History</Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, maxWidth: 720 }}>
        View login history with IP addresses, locations, and device information. Filter by date range and search for specific users.
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
                Login Date
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
  row: LoginHistoryRow;
};

function UserCell({ row }: UserCellProps) {
  if (!row.username) {
    return (
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
        <Avatar />
        <Stack minWidth={0}>
          <Typography variant="subtitle2" noWrap>
            Unknown user
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            —
          </Typography>
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
      <Avatar src={`${API_URL}${row.avatar}`} alt={row.username} />
      <Stack minWidth={0}>
        <Typography variant="subtitle2" noWrap>
          {row.username}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {row.email || '—'}
        </Typography>
      </Stack>
    </Stack>
  );
}

