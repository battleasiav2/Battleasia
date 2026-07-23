import { useCallback, useEffect, useMemo, useState } from 'react';
import { LoadingButton } from '@mui/lab';
import {
    Button,
    Card,
    Chip,
    Container,
    Divider,
    Stack,
    Typography,
} from '@mui/material';
import {
    DataGrid,
    GridActionsCellItem,
    GridColDef,
    GridRenderCellParams,
    GridToolbar,
} from '@mui/x-data-grid';
import toast from 'react-hot-toast';
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import useApi from 'src/hooks/use-api';
import { usePermissions } from 'src/hooks/use-permissions';
import { PERMISSIONS } from 'src/constants/permissions';
import { deleteCoinRateApi, listCoinRatesApi } from 'src/contexts/api/shop';
import { ICoinRate } from 'src/types';
import { CoinRateDialog } from './form';

export function CoinRateView() {
    const settings = useSettingsContext();
    const { hasPermission } = usePermissions();

    const [rows, setRows] = useState<ICoinRate[]>([]);
    const [loading, setLoading] = useState(false);
    const [dialogState, setDialogState] = useState<{
        open: boolean;
        mode: 'create' | 'edit';
        rate: ICoinRate | null;
    }>({
        open: false,
        mode: 'create',
        rate: null,
    });

    const fetchRates = useCallback(async () => {
        setLoading(true);
        try {
            const response = await listCoinRatesApi();
            if (response?.data?.status && response.data.data) {
                const results = response.data.data.results || response.data.data || [];
                setRows(
                    results.map((item: any) => ({
                        ...item,
                        id: item._id || item.id,
                        createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
                        updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
                    }))
                );
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to fetch coin rates');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRates();
    }, [fetchRates]);

    const openCreate = useCallback(() => {
        if (!hasPermission(PERMISSIONS.USERS.CREATE)) {
            toast.error('You do not have permission to create rates');
            return;
        }
        setDialogState({ open: true, mode: 'create', rate: null });
    }, [hasPermission]);

    const openEdit = useCallback(
        (rate: ICoinRate) => {
            if (!hasPermission(PERMISSIONS.USERS.EDIT)) {
                toast.error('You do not have permission to edit rates');
                return;
            }
            setDialogState({ open: true, mode: 'edit', rate });
        },
        [hasPermission]
    );

    const handleDelete = useCallback(
        async (rate: ICoinRate) => {
            if (!hasPermission(PERMISSIONS.USERS.DELETE)) {
                toast.error('You do not have permission to delete rates');
                return;
            }
            const confirmed = window.confirm('Delete this coin rate?');
            if (!confirmed) return;
            try {
                await deleteCoinRateApi(rate.id || rate._id);
                toast.success('Coin rate deleted');
                fetchRates();
            } catch (error: any) {
                toast.error(error?.response?.data?.message || 'Failed to delete coin rate');
            }
        },
        [fetchRates, hasPermission]
    );

    const columns = useMemo<GridColDef<ICoinRate>[]>(
        () => [
            {
                field: 'actions',
                type: 'actions',
                width: 90,
                getActions: (params) => {
                    const actions = [];
                    if (hasPermission(PERMISSIONS.USERS.EDIT)) {
                        actions.push(
                            <GridActionsCellItem
                                key="edit"
                                icon={<Iconify icon="mdi:pencil" color="info.main" />}
                                label="Edit"
                                onClick={() => openEdit(params.row)}
                            />
                        );
                    }
                    if (hasPermission(PERMISSIONS.USERS.DELETE)) {
                        actions.push(
                            <GridActionsCellItem
                                key="delete"
                                icon={<Iconify icon="mdi:trash-can" color="error.main" />}
                                label="Delete"
                                onClick={() => handleDelete(params.row)}
                            />
                        );
                    }
                    return actions;
                },
            },
            { field: 'region', headerName: 'Region', width: 150 },
            { field: 'currency', headerName: 'Currency', width: 120 },
            {
                field: 'rate',
                headerName: 'Rate / coin',
                width: 160,
            },
            {
                field: 'createdAt',
                headerName: 'Created At',
                width: 180,
                type: 'dateTime',
            },
            {
                field: 'updatedAt',
                headerName: 'Updated At',
                width: 180,
                type: 'dateTime',
            },
        ],
        [handleDelete, hasPermission, openEdit]
    );

    return (
        <Container maxWidth={settings.themeStretch ? false : 'xl'}>
            <Typography variant="h4">BAC Coin Rates</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, maxWidth: 720 }}>
                Manage coin rates for each region.
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
                    <Stack direction="row" gap={1}>
                        {hasPermission(PERMISSIONS.USERS.CREATE) && (
                            <Button variant="contained" color="primary" startIcon={<Iconify icon="ic:round-add" />} onClick={openCreate}>
                                Create Rate
                            </Button>
                        )}
                        <LoadingButton loading={loading} variant="contained" color="info" onClick={fetchRates}>
                            <Iconify icon="flowbite:refresh-outline" />
                        </LoadingButton>
                    </Stack>
                </Stack>

                <Divider />

                <Stack p={3} pt={1.5}>
                    <DataGrid
                        autoHeight
                        rows={rows}
                        columns={columns}
                        loading={loading}
                        disableRowSelectionOnClick
                        slots={{ toolbar: GridToolbar }}
                        slotProps={{
                            toolbar: {
                                showQuickFilter: true,
                                quickFilterProps: { debounceMs: 250 },
                            },
                        }}
                    />
                </Stack>
            </Card>

            <CoinRateDialog
                key={dialogState.mode === 'edit' ? `edit-${dialogState.rate?._id ?? 'unknown'}` : 'create'}
                open={dialogState.open}
                mode={dialogState.mode}
                rate={dialogState.rate ?? undefined}
                onClose={() => setDialogState((p) => ({ ...p, open: false, rate: null }))}
                onSuccess={fetchRates}
            />
        </Container>
    );
}

