import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import {
  Avatar,
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import { fDateTime } from 'src/utils/format-time';
import useApi from 'src/hooks/use-api';
import { API_URL } from 'src/config-global';
import { IMatchParticipantRow, IMatchRow } from 'src/types';

type Props = {
  open: boolean;
  match: IMatchRow | null;
  onClose: () => void;
};

const SEARCH_DEBOUNCE = 400;

export function MatchParticipantsDialog({ open, match, onClose }: Props) {
  const settings = useSettingsContext();
  const { getMatchParticipantsApi } = useApi();

  const [rows, setRows] = useState<IMatchParticipantRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, SEARCH_DEBOUNCE);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!open) {
      setRows([]);
      setRowCount(0);
      setPaginationModel({ page: 0, pageSize: 10 });
      setSearch('');
      setDebouncedSearch('');
    }
  }, [open]);

  const fetchParticipants = useCallback(async () => {
    if (!match?.id || !open) return;

    setLoading(true);
    const response = await getMatchParticipantsApi(match.id, {
      page: paginationModel.page + 1,
      limit: paginationModel.pageSize,
      search: debouncedSearch || undefined,
    });

    if (response?.data?.status && response.data.data) {
      const { participants, count } = response.data.data;
      setRows(
        participants.map((participant: any) => ({
          ...participant,
          id: participant.id || participant._id,
          joinedAt: participant.joinedAt ? new Date(participant.joinedAt) : null,
        }))
      );
      setRowCount(count || 0);
    }
    setLoading(false);
  }, [match?.id, open, paginationModel, debouncedSearch, getMatchParticipantsApi]);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  const columns = useMemo<GridColDef<IMatchParticipantRow>[]>(
    () => [
      {
        field: 'username',
        headerName: 'Player',
        flex: 1,
        minWidth: 220,
        renderCell: (params) => (
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ height: 1, lineHeight: 1 }}>
            <Avatar src={`${API_URL}${params.row.avatar}`} alt={params.value}>
              {params.value?.[0]?.toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="subtitle2">{params.value}</Typography>
              {params.row.email && (
                <Typography variant="caption" color="text.secondary">
                  {params.row.email}
                </Typography>
              )}
            </Box>
          </Stack>
        ),
      },
      {
        field: 'pubgId',
        headerName: 'PUBG ID',
        width: 160
      },
      {
        field: 'entryFee',
        headerName: 'Entry Fee',
        width: 130
      },
      {
        type: "dateTime",
        field: 'joinedAt',
        headerName: 'Joined At',
        width: 180
      },
    ],
    []
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6">Match Participants</Typography>
            {match && (
              <Typography variant="body2" color="text.secondary">
                {match.matchName} · Room #{match.roomId} · {match.teamType?.toUpperCase()}
              </Typography>
            )}
          </Box>
          <IconButton size="small" onClick={onClose}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by username, email or PUBG ID..."
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="solar:magnifer-linear" />
                  </InputAdornment>
                ),
              }}
            />
            <Chip label={`${rowCount} joined`} color="primary" variant="soft" />
          </Stack>

          <Box
            sx={{
              height: settings.themeStretch ? 520 : 480,
              '& .MuiDataGrid-root': { border: 'none' },
            }}
          >
            <DataGrid
              rows={rows}
              columns={columns}
              loading={loading}
              rowCount={rowCount}
              pageSizeOptions={[10, 25, 50]}
              paginationModel={paginationModel}
              paginationMode="server"
              onPaginationModelChange={setPaginationModel}
              disableRowSelectionOnClick
              slots={{ toolbar: GridToolbar }}
              slotProps={{
                toolbar: {
                  showQuickFilter: false,
                },
              }}
            />
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}


