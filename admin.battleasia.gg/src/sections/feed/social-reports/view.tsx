import { useCallback, useEffect, useState } from 'react';

import {
  Button,
  Card,
  CardContent,
  Chip,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { toast } from 'react-hot-toast';

import useApi from 'src/hooks/use-api';
import Iconify from 'src/components/iconify';

type ReportRow = {
  id: string;
  reporterUsername: string;
  targetType: string;
  targetId: string;
  reason: string;
  details: string;
  status: string;
  createdAt: string;
};

export function SocialReportsView() {
  const { getSocialReportsApi, updateSocialReportApi } = useApi();
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getSocialReportsApi({ page: 1, limit: 100, status: status || undefined });
      const results = response?.data?.data?.results;
      setRows(Array.isArray(results) ? results : []);
    } catch {
      toast.error('Failed to load social reports');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [getSocialReportsApi, status]);

  useEffect(() => {
    load().catch(() => undefined);
  }, [load]);

  const updateStatus = async (id: string, nextStatus: string) => {
    try {
      await updateSocialReportApi(id, { status: nextStatus });
      toast.success('Report updated');
      await load();
    } catch {
      toast.error('Failed to update report');
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Iconify icon="solar:flag-bold" width={28} />
        <Typography variant="h4">Social Reports</Typography>
      </Stack>

      <Card>
        <CardContent>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <TextField select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 180 }}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="reviewed">Reviewed</MenuItem>
              <MenuItem value="dismissed">Dismissed</MenuItem>
            </TextField>
            <Button
              variant="outlined"
              onClick={() => {
                load().catch(() => undefined);
              }}
              disabled={loading}
            >
              Refresh
            </Button>
          </Stack>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Reporter</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Target</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.reporterUsername || '—'}</TableCell>
                  <TableCell>{row.targetType}</TableCell>
                  <TableCell>{row.targetId}</TableCell>
                  <TableCell>{row.reason}</TableCell>
                  <TableCell>
                    <Chip size="small" label={row.status} color={row.status === 'pending' ? 'warning' : 'default'} />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button
                        size="small"
                        onClick={() => {
                          updateStatus(row.id, 'reviewed').catch(() => undefined);
                        }}
                      >
                        Review
                      </Button>
                      <Button
                        size="small"
                        color="inherit"
                        onClick={() => {
                          updateStatus(row.id, 'dismissed').catch(() => undefined);
                        }}
                      >
                        Dismiss
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>No reports found</TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Stack>
  );
}
