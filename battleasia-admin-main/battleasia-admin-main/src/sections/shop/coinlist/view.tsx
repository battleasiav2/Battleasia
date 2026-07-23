import { useCallback, useEffect, useMemo, useState } from 'react';
// @mui
import { LoadingButton } from '@mui/lab';
import {
    Avatar,
    Button,
    Card,
    Chip,
    Container,
    Divider,
    Stack,
    Typography
} from '@mui/material';
import {
    DataGrid,
    GridActionsCellItem,
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
// hooks
import useApi from 'src/hooks/use-api';
import { useCopyToClipboard } from 'src/hooks/use-copy-to-clipboard';
import { usePermissions } from 'src/hooks/use-permissions';
import { PERMISSIONS } from 'src/constants/permissions';
import { deleteShopItemApi, getShopItemApi, listShopItemsApi } from 'src/contexts/api/shop';

import { API_URL } from 'src/config-global';
import { IDateRangeValue, IShopItemRow } from 'src/types';
import { ShopItemDialog } from './form';

export default function ShopView() {
    const settings = useSettingsContext();
    const { getUsersApi, updatePlayerStatusApi } = useApi();
    const { copy } = useCopyToClipboard();
    const { hasPermission } = usePermissions();

    const [rows, setRows] = useState<IShopItemRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [search, setSearch] = useState('');
    const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });
    const [dateRange, setDateRange] = useState<IDateRangeValue>([null, null]);
    const [shopItemDialogState, setShopItemDialogState] = useState<{
        open: boolean;
        mode: 'create' | 'edit';
        shopItem: IShopItemRow | null;
    }>({
        open: false,
        mode: 'create',
        shopItem: null,
    });

    const handleCopyId = useCallback(
        async (value?: string | null) => {
            if (!value) {
                return;
            }
            const success = await copy(value);
            if (success) {
                toast.success('User ID copied to clipboard');
            } else {
                toast.error('Failed to copy User ID');
            }
        },
        [copy]
    );

    const fetchShopItems = useCallback(async () => {
        setLoading(true);
        try {
            const [startDate, endDate] = dateRange;
            const response = await listShopItemsApi({
                page: paginationModel.page + 1,
                limit: paginationModel.pageSize,
                search,
                startDate: startDate ? startDate.toISOString() : undefined,
                endDate: endDate ? endDate.toISOString() : undefined,
            });

            if (response?.data?.status && response.data.data) {
                const { results, count } = response.data.data;
                setRows(
                    results.map((user: any) => ({
                        ...user,
                        id: user._id || user.id,
                        balance: Number(user.balance ?? 0),
                        createdAt: new Date(user.createdAt),
                        updatedAt: new Date(user.updatedAt),
                    }))
                );
                setTotalCount(count);
            }
        } catch (error: any) {
            console.error('Failed to fetch users:', error);
            toast.error(error?.response?.data?.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    }, [dateRange, paginationModel, search]);

    const openCreateDialog = useCallback(() => {
        if (!hasPermission(PERMISSIONS.USERS.CREATE)) {
            toast.error('You do not have permission to create users');
            return;
        }
        setShopItemDialogState({
            open: true,
            mode: 'create',
            shopItem: null,
        });
    }, [hasPermission]);

    const handleEditRow = useCallback((row: IShopItemRow) => {
        if (!hasPermission(PERMISSIONS.USERS.EDIT)) {
            toast.error('You do not have permission to edit users');
            return;
        }
        setShopItemDialogState({
            open: true,
            mode: 'edit',
            shopItem: row,
        });
    }, [hasPermission]);

    const handleDeleteRow = useCallback(
        async (row: IShopItemRow) => {
            if (!hasPermission(PERMISSIONS.USERS.DELETE)) {
                toast.error('You do not have permission to delete items');
                return;
            }

            const confirmed = window.confirm('Are you sure you want to delete this item?');
            if (!confirmed) return;

            try {
                await deleteShopItemApi(row.id || row._id);
                toast.success('Item deleted');
                fetchShopItems();
            } catch (error: any) {
                toast.error(error?.response?.data?.message || 'Failed to delete item');
            }
        },
        [fetchShopItems, hasPermission]
    );

    const handleCloseShopItemDialog = useCallback(() => {
        setShopItemDialogState((prev) => ({ ...prev, open: false, shopItem: null }));
    }, []);

    const handleDialogSuccess = useCallback(() => {
        handleCloseShopItemDialog();
        fetchShopItems();
    }, [fetchShopItems, handleCloseShopItemDialog]);

    const handleRefresh = useCallback(() => {
        fetchShopItems();
    }, [fetchShopItems]);

    const handleDateRangeChange = useCallback((newValue: IDateRangeValue) => {
        setDateRange(newValue);
        setPaginationModel((prev) => ({ ...prev, page: 0 }));
    }, []);

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

    useEffect(() => {
        fetchShopItems();
    }, [fetchShopItems]);

    const getStatusColor = useCallback(
        (status: boolean): 'success' | 'default' => (status ? 'success' : 'default'),
        []
    );

    const columns = useMemo<GridColDef<IShopItemRow>[]>(
        () => [
            {
                field: 'actions',
                type: 'actions',
                width: 80,
                getActions: (params) => {
                    const actions = [];
                    if (hasPermission(PERMISSIONS.USERS.EDIT)) {
                        actions.push(
                            <GridActionsCellItem
                                key="edit"
                                icon={<Iconify icon="mdi:pencil" color="info.main" />}
                                label="Edit"
                                onClick={() => handleEditRow(params.row)}
                            />
                        );
                    }
                    if (hasPermission(PERMISSIONS.USERS.DELETE)) {
                        actions.push(
                            <GridActionsCellItem
                                key="delete"
                                icon={<Iconify icon="mdi:trash-can" color="error.main" />}
                                label="Delete"
                                onClick={() => handleDeleteRow(params.row)}
                            />
                        );
                    }

                    return actions;
                },
            },
            {
                field: '_id',
                headerName: 'Item ID',
                width: 160,
                renderCell: (params) => (
                    <Button
                        variant="text" size="small" color="info"
                        onClick={() => handleCopyId(String(params.value))}
                    >
                        {params.value.toString().slice(0, 12)}...
                    </Button>
                ),
            },
            { field: 'amount', headerName: 'BAC Amount', width: 150 },
            {
                field: 'price',
                headerName: 'Price',
                width: 160,
                renderCell: (params: GridRenderCellParams<IShopItemRow>) => (
                    <Stack spacing={0.3}>
                        <Typography variant="subtitle2">{params.row.price}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                            {params.row.originalPrice}
                        </Typography>
                    </Stack>
                ),
            },
            {
                field: 'discountPercent',
                headerName: 'Discount %',
                width: 120,
                renderCell: (params: GridRenderCellParams<IShopItemRow>) => (
                    <Chip label={`-${params.value}%`} color="success" size="small" variant="soft" />
                ),
            },
            {
                field: 'badge',
                headerName: 'Badge',
                width: 120,
                renderCell: (params: GridRenderCellParams<IShopItemRow>) => (
                    <Chip label={params.value} color="info" size="small" variant="soft" />
                ),
            },
            {
                field: 'isActive',
                headerName: 'Is Active',
                width: 120,
                renderCell: (params: GridRenderCellParams<IShopItemRow, boolean>) => (
                    <Chip
                        label={params.value ? 'Yes' : 'No'}
                        size="small"
                        color={getStatusColor(params.value ?? false)}
                        variant="soft"
                    />
                ),
            },
            {
                field: 'createdAt',
                headerName: 'Created At',
                width: 180,
                type: 'dateTime',
            },
        ],
        [
            handleCopyId,
            handleEditRow,
            getStatusColor,
            hasPermission,
            handleDeleteRow,
        ]
    );

    return (
        <Container maxWidth={settings.themeStretch ? false : 'xl'}>
            <Typography variant="h4">BAC Coin Shop</Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, maxWidth: 720 }}>
                Manage BAC coin packages, discounts, and payment availability.
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
                                Registered Date
                            </Typography>
                            <DateRangePicker
                                value={dateRange}
                                onChange={(newValue) => handleDateRangeChange(newValue as IDateRangeValue)}
                                slotProps={{ textField: { size: 'small' } }}
                            />
                        </Stack>
                    </LocalizationProvider>

                    <Stack direction="row" gap={1}>
                        {hasPermission(PERMISSIONS.USERS.CREATE) && (
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<Iconify icon="ic:round-add" />}
                                onClick={openCreateDialog}
                            >
                                Create Item
                            </Button>
                        )}
                        <LoadingButton
                            loading={loading}
                            variant="contained"
                            color="info"
                            onClick={handleRefresh}
                        >
                            <Iconify icon="flowbite:refresh-outline" />
                        </LoadingButton>
                    </Stack>
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

            <ShopItemDialog
                key={
                    shopItemDialogState.mode === 'edit'
                        ? `edit-${shopItemDialogState.shopItem?.id ?? 'unknown'}`
                        : 'create'
                }
                open={shopItemDialogState.open}
                mode={shopItemDialogState.mode}
                shopItem={shopItemDialogState.shopItem ?? undefined}
                onClose={handleCloseShopItemDialog}
                onSuccess={handleDialogSuccess}
            />
        </Container>
    );
}

type ShopItemCellProps = {
    shopItem: IShopItemRow;
};

function ShopItemCell({ shopItem }: ShopItemCellProps) {
    return (
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ height: 1 }}>
            <Avatar src={`${API_URL}${shopItem.image}`} alt={shopItem.amount.toString()} />
            <Stack minWidth={0}>
                <Typography variant="subtitle2" noWrap>
                    {shopItem.amount} {shopItem.symbol}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                    {shopItem.badge}
                </Typography>
            </Stack>
        </Stack>
    );
}

