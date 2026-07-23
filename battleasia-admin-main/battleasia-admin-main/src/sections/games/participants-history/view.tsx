import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Card,
  Chip,
  Container,
  Divider,
  Stack,
  Typography,
  Avatar,
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

import { useSettingsContext } from 'src/components/settings';
import Iconify from 'src/components/iconify';
import useApi from 'src/hooks/use-api';
import { API_URL } from 'src/config-global';

type DateRangeValue = [Date | null, Date | null];

type ParticipantsHistoryRow = {
  id: string;
  matchId?: string;
  matchName?: string;
  userId?: string;
  username?: string;
  email?: string;
  avatar?: string;
  pubgId?: string;
  entryFee?: number;
  placement?: number | null;
  kills?: number;
  points?: number;
  createdAt?: Date | null;
};

export default function ParticipantsHistoryView() {
  const settings = useSettingsContext();
  const { getParticipantsHistoryApi } = useApi();

  const [rows, setRows] = useState<ParticipantsHistoryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });
  const [dateRange, setDateRange] = useState<DateRangeValue>([null, null]);

  const fetchParticipantsHistory = useCallback(async () => {
    setLoading(true);
    try {
      const [startDate, endDate] = dateRange;
      const response = await getParticipantsHistoryApi({
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        search,
        startDate: startDate ? startDate.toISOString() : undefined,
        endDate: endDate ? endDate.toISOString() : undefined,
      });

      if (response?.data?.status && response.data.data) {
        const { results, count } = response.data.data;
        setRows(
          results.map((participant: any) => ({
            ...participant,
            id: participant._id || participant.id,
            createdAt: participant.createdAt ? new Date(participant.createdAt) : null,
          }))
        );
        setTotalCount(count);
      }
    } catch (error: any) {
      console.error('Failed to fetch participants history:', error);
      toast.error(error?.response?.data || 'Failed to fetch participants history');
    } finally {
      setLoading(false);
    }
  }, [dateRange, getParticipantsHistoryApi, paginationModel.page, paginationModel.pageSize, search]);

  useEffect(() => {
    fetchParticipantsHistory();
  }, [fetchParticipantsHistory]);

  const handleDateRangeChange = useCallback((newValue: DateRangeValue) => {
    setDateRange(newValue);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, []);

  const handleRefresh = useCallback(() => {
    fetchParticipantsHistory();
  }, [fetchParticipantsHistory]);

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

  const columns = useMemo<GridColDef<ParticipantsHistoryRow>[]>(() => [
    {
      field: 'match',
      headerName: 'Match',
      flex: 1,
      minWidth: 240,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<ParticipantsHistoryRow>) => (
        <MatchCell row={params.row} />
      ),
    },
    {
      field: 'user',
      headerName: 'Participant',
      flex: 1,
      minWidth: 220,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<ParticipantsHistoryRow>) => (
        <UserCell row={params.row} />
      ),
    },
    { field: 'pubgId', headerName: 'PUBG ID', width: 140 },
    {
      field: 'entryFee',
      headerName: 'Entry Fee',
      width: 120,
      renderCell: ({ value }) => (value ?? value === 0 ? Number(value).toLocaleString() : '—'),
    },
    {
      field: 'placement',
      headerName: 'Placement',
      width: 120,
      renderCell: (params) =>
        params.value ? <Chip label={`#${params.value}`} size="small" color="info" /> : '—',
    },
    { field: 'kills', headerName: 'Kills', width: 80 },
    { field: 'points', headerName: 'Points', width: 90 },
    {
      field: 'createdAt',
      headerName: 'Joined At',
      width: 180,
      type: 'dateTime',
    },
  ], []);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Typography variant="h4">Participants History</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, maxWidth: 720 }}>
        Review every match participant entry along with placements, kills, and earned points. Filter by date range or search for specific matches or users.
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
                Participation Date
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

type CellProps = {
  row: ParticipantsHistoryRow;
};

function MatchCell({ row }: CellProps) {
  return (
    <Stack spacing={0.25}>
      <Typography variant="subtitle2" noWrap>
        {row.matchName || 'Unknown match'}
      </Typography>
      <Typography variant="caption" color="text.secondary" noWrap>
        {row.matchId || '—'}
      </Typography>
    </Stack>
  );
}

function UserCell({ row }: CellProps) {
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


