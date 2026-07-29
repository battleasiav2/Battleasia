import { useCallback, useEffect, useState } from 'react';

import {
  Button,
  Card,
  CardContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { toast } from 'react-hot-toast';

import useApi from 'src/hooks/use-api';
import Iconify from 'src/components/iconify';

type ReelRow = {
  id: string;
  username: string;
  caption: string;
  totalViews: number;
  status: string;
  createdAt: string;
};

export function ReelsModerationView() {
  const { getAdminReelsApi, deleteReelApi } = useApi();
  const [rows, setRows] = useState<ReelRow[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAdminReelsApi({ page: 1, limit: 100 });
      const results = response?.data?.data?.results;
      setRows(Array.isArray(results) ? results : []);
    } catch {
      toast.error('Failed to load reels');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [getAdminReelsApi]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDelete = async (id: string) => {
    try {
      await deleteReelApi(id);
      toast.success('Reel deleted');
      await load();
    } catch {
      toast.error('Failed to delete reel');
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Iconify icon="solar:clapperboard-play-bold" width={28} />
        <Typography variant="h4">Reels Moderation</Typography>
      </Stack>

      <Card>
        <CardContent>
          <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
            <Button variant="outlined" onClick={() => void load()} disabled={loading}>
              Refresh
            </Button>
          </Stack>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Caption</TableCell>
                <TableCell>Views</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.username}</TableCell>
                  <TableCell>{row.caption || '—'}</TableCell>
                  <TableCell>{row.totalViews}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell align="right">
                    <Button size="small" color="error" onClick={() => void handleDelete(row.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>No reels found</TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Stack>
  );
}
