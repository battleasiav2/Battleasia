import { useCallback, useEffect, useMemo, useState } from 'react';
// @mui
import {
    Card,
    CardContent,
    Chip,
    Container,
    Divider,
    Grid,
    Stack,
    Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import {
    DataGrid,
    GridColDef,
    GridFilterModel,
    GridRenderCellParams,
    GridToolbar,
} from '@mui/x-data-grid';
import toast from 'react-hot-toast';
// components
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import useApi from 'src/hooks/use-api';

// ----------------------------------------------------------------------

type ReferralHistoryRow = {
    id: string;
    _id: string;
    depositAmount: number;
    commissionRate: number;
    commissionAmount: number;
    status: string;
    createdAt: Date | null;
    referrerUsername: string;
    referrerEmail: string;
    referredUsername: string;
    referredEmail: string;
};

type StatsOverview = {
    totalPaid: number;
    totalTransactions: number;
    usersWithReferrals: number;
};

// ----------------------------------------------------------------------

export function UserReferralHistoryView() {
    const settings = useSettingsContext();
    const { getReferralHistoriesApi, getReferralStatsOverviewApi } = useApi();

    // History table state
    const [historyRows, setHistoryRows] = useState<ReferralHistoryRow[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyTotal, setHistoryTotal] = useState(0);
    const [historySearch, setHistorySearch] = useState('');
    const [historyPagination, setHistoryPagination] = useState({ pageSize: 10, page: 0 });

    // Stats state
    const [stats, setStats] = useState<StatsOverview | null>(null);

    // Fetch referral histories
    const fetchHistories = useCallback(async () => {
        setHistoryLoading(true);
        try {
            const response = await getReferralHistoriesApi({
                page: historyPagination.page + 1,
                limit: historyPagination.pageSize,
                search: historySearch,
            });
            if (response?.data?.status) {
                const items = response.data.data || [];
                setHistoryRows(
                    items.map((item: any) => ({
                        ...item,
                        id: item._id,
                        createdAt: item.createdAt ? new Date(item.createdAt) : null,
                        referrerUsername: item.referrer?.username || '-',
                        referrerEmail: item.referrer?.email || '-',
                        referredUsername: item.referredUser?.username || '-',
                        referredEmail: item.referredUser?.email || '-',
                    }))
                );
                setHistoryTotal(response.data.pagination?.total || 0);
            }
        } catch (error) {
            toast.error('Failed to fetch referral histories');
        } finally {
            setHistoryLoading(false);
        }
    }, [getReferralHistoriesApi, historyPagination, historySearch]);

    // Fetch stats overview
    const fetchStats = useCallback(async () => {
        try {
            const response = await getReferralStatsOverviewApi();
            if (response?.data?.status) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    }, [getReferralStatsOverviewApi]);

    useEffect(() => {
        fetchHistories();
    }, [fetchHistories]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    // Filter handler for history DataGrid
    const onHistoryFilterChange = useCallback((filterModel: GridFilterModel) => {
        let value = filterModel.quickFilterValues ? filterModel.quickFilterValues[0] : '';
        if (!value) {
            setHistorySearch(value);
            return;
        }
        // eslint-disable-next-line no-useless-escape
        value = value.replace(/[\]\[{}()\\]+/g, '');
        setHistorySearch(value);
    }, []);

    const handleRefresh = useCallback(() => {
        fetchHistories();
        fetchStats();
    }, [fetchHistories, fetchStats]);

    // Columns: Referral History
    const historyColumns = useMemo<GridColDef<ReferralHistoryRow>[]>(
        () => [
            {
                field: 'createdAt',
                headerName: 'Date',
                width: 180,
                type: 'dateTime',
            },
            {
                field: 'referrerUsername',
                headerName: 'Referrer',
                flex: 1,
                minWidth: 160,
                renderCell: (params: GridRenderCellParams<ReferralHistoryRow>) => (
                    <Stack spacing={0} justifyContent="center" sx={{ height: 1 }}>
                        <Typography variant="subtitle2" noWrap>{params.row.referrerUsername}</Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>{params.row.referrerEmail}</Typography>
                    </Stack>
                ),
            },
            {
                field: 'referredUsername',
                headerName: 'Referred User',
                flex: 1,
                minWidth: 160,
                renderCell: (params: GridRenderCellParams<ReferralHistoryRow>) => (
                    <Stack spacing={0} justifyContent="center" sx={{ height: 1 }}>
                        <Typography variant="subtitle2" noWrap>{params.row.referredUsername}</Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>{params.row.referredEmail}</Typography>
                    </Stack>
                ),
            },
            {
                field: 'depositAmount',
                headerName: 'Deposit',
                width: 120,
                align: 'center',
                headerAlign: 'center',
                renderCell: (params: GridRenderCellParams<ReferralHistoryRow>) => (
                    <Stack 
                        justifyContent="center" 
                        alignItems="center" 
                        sx={{ width: '100%', height: '100%' }}
                    >
                        <Typography variant="body2">{params.value?.toFixed(2)}</Typography>
                    </Stack>
                ),
            },
            {
                field: 'commissionRate',
                headerName: 'Rate',
                width: 80,
                align: 'center',
                headerAlign: 'center',
                renderCell: (params: GridRenderCellParams<ReferralHistoryRow>) => (
                    <Stack 
                        justifyContent="center" 
                        alignItems="center" 
                        sx={{ width: '100%', height: '100%' }}
                    >
                        <Typography variant="body2">{params.value}%</Typography>
                    </Stack>
                ),
            },
            {
                field: 'commissionAmount',
                headerName: 'Commission',
                width: 120,
                align: 'center',
                headerAlign: 'center',
                renderCell: (params: GridRenderCellParams<ReferralHistoryRow>) => (
                    <Stack 
                        justifyContent="center" 
                        alignItems="center" 
                        sx={{ width: '100%', height: '100%' }}
                    >
                        <Typography variant="body2">{params.value?.toFixed(2)}</Typography>
                    </Stack>
                ),
            },
            {
                field: 'status',
                headerName: 'Status',
                width: 100,
                align: 'center',
                headerAlign: 'center',
                renderCell: (params: GridRenderCellParams<ReferralHistoryRow>) => (
                    <Chip
                        label={params.value}
                        size="small"
                        color={params.value === 'paid' ? 'success' : 'warning'}
                        variant="soft"
                    />
                ),
            },
        ],
        []
    );

    return (
        <Container maxWidth={settings.themeStretch ? false : 'xl'}>
            <Typography variant="h4">Referral History</Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, maxWidth: 720 }}>
                Overview of referral commissions and detailed transaction history.
            </Typography>

            {/* Stats Overview Cards */}
            {stats && (
                <Grid container spacing={3} sx={{ mt: 2 }}>
                    <Grid item xs={12} sm={4}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="primary.main">
                                    {stats.totalTransactions}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Total Transactions
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="warning.main">
                                    {stats.totalPaid.toFixed(2)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Total Commission Paid
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="success.main">
                                    {stats.usersWithReferrals}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Referred Users
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Referral History */}
            <Card sx={{ mt: 4 }}>
                <Stack
                    direction="row"
                    gap={2}
                    p={3}
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Typography variant="h6">Referral History</Typography>
                    <LoadingButton
                        loading={historyLoading}
                        variant="contained"
                        color="info"
                        onClick={handleRefresh}
                    >
                        <Iconify icon="flowbite:refresh-outline" />
                    </LoadingButton>
                </Stack>

                <Divider />

                <Stack p={3} pt={1.5}>
                    <DataGrid
                        autoHeight
                        rows={historyRows}
                        rowCount={historyTotal}
                        columns={historyColumns}
                        loading={historyLoading}
                        disableRowSelectionOnClick
                        paginationModel={historyPagination}
                        onPaginationModelChange={setHistoryPagination}
                        onFilterModelChange={onHistoryFilterChange}
                        filterMode="server"
                        paginationMode="server"
                        pageSizeOptions={[5, 10, 25, 50]}
                        slots={{ toolbar: GridToolbar }}
                        slotProps={{
                            toolbar: {
                                showQuickFilter: true,
                                quickFilterProps: { debounceMs: 250 },
                            },
                        }}
                        rowHeight={58}
                    />
                </Stack>
            </Card>
        </Container>
    );
}

export default UserReferralHistoryView;
