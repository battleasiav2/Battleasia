import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Chip,
    MenuItem,
    Typography,
    Box,
    Checkbox,
    FormControlLabel,
    FormGroup,
} from '@mui/material';
import toast from 'react-hot-toast';
import { useEffect, useMemo, useState, useCallback } from 'react';
import useApi from 'src/hooks/use-api';
import { usePermissions } from 'src/hooks/use-permissions';
import { useSelector } from 'src/store';
import FormProvider, { RHFTextField, RHFSelect } from 'src/components/hook-form';
import { isValidPermission, getAllPermissions, filterPermissionsByParent } from 'src/constants/permissions';

// ----------------------------------------------------------------------

export const RoleSchema = Yup.object().shape({
    name: Yup.string().required('Role name is required!').max(50, 'Role name must be at most 50 characters!'),
    description: Yup.string().max(500, 'Description must be at most 500 characters!').optional(),
    type: Yup.string().oneOf(['admin', 'official', 'agent', 'player']).optional(),
    parent: Yup.string().nullable().optional(),
    permissions: Yup.array().of(Yup.string()).optional(),
});

type PermissionOption = {
    value?: string;
    key?: string;
    label: string;
    category: string;
};

type IParentRole = {
    id: string;
    name: string;
    level: number;
    permissions?: string[];
};

type ISchemaType = Yup.InferType<typeof RoleSchema>;

type DialogMode = 'create' | 'edit';

type Props = {
    open: boolean;
    onClose: () => void;
    loading?: boolean;
    mode?: DialogMode;
    role?: { id: string; name: string; description?: string; type?: 'admin' | 'official' | 'agent' | 'player'; parent?: { id: string; name: string } | null; permissions?: string[] } | null;
    onSuccess?: () => void;
};

export function RoleDialog({
    open,
    onClose,
    loading = false,
    mode = 'create',
    role = null,
    onSuccess,
}: Props) {
    const { createRoleApi, updateRoleApi, getAvailableParentRolesApi } = useApi();
    const { isAdmin, isAgent } = usePermissions();
    const isEdit = mode === 'edit' && !!role;
    const [availableParents, setAvailableParents] = useState<IParentRole[]>([]);
    const [loadingParents, setLoadingParents] = useState(false);
    const [availablePermissions, setAvailablePermissions] = useState<PermissionOption[]>([]);

    const defaultValues: ISchemaType = useMemo(
        () => ({
            name: '',
            description: '',
            type: 'player' as 'admin' | 'official' | 'agent' | 'player',
            parent: null,
            permissions: [],
        }),
        []
    );

    const methods = useForm<ISchemaType>({
        resolver: yupResolver(RoleSchema),
        defaultValues,
    });

    const {
        handleSubmit,
        reset,
        formState: { isSubmitting },
    } = methods;

    const loadAvailableParents = useCallback(async () => {
        if (!open) return;
        setLoadingParents(true);
        try {
            const excludeId = isEdit && role ? role.id : undefined;
            const response = await getAvailableParentRolesApi(excludeId);
            if (response?.data?.status) {
                // Parent roles may include permissions in the response
                const parents = (response.data.data || []).map((parent: any) => ({
                    id: parent.id || parent._id,
                    name: parent.name,
                    level: parent.level || 0,
                    permissions: parent.permissions || [],
                }));
                setAvailableParents(parents);
            }
        } catch (error) {
            console.error('Failed to load available parents:', error);
        } finally {
            setLoadingParents(false);
        }
    }, [open, isEdit, role, getAvailableParentRolesApi]);

    const loadAvailablePermissions = useCallback((parentId: string | null) => {
        if (!open || !parentId || parentId === '') {
            setAvailablePermissions([]);
            return;
        }

        // Find parent role from availableParents to get its permissions
        const parentRole = availableParents.find((p) => p.id === parentId);
        const parentPermissions = parentRole?.permissions;

        // Use global PERMISSIONS constant and filter by parent's permissions
        const filteredPermissions = filterPermissionsByParent(parentPermissions);
        setAvailablePermissions(filteredPermissions);
    }, [open, availableParents]);

    useEffect(() => {
        loadAvailableParents();
    }, [loadAvailableParents]);

    useEffect(() => {
        if (!open) {
            return;
        }

        if (isEdit && role) {
            const parentId = role.parent?.id || '';
            reset({
                name: role.name || '',
                description: role.description || '',
                type: role.type || 'player',
                parent: parentId,
                permissions: role.permissions || [],
            });
            if (parentId) {
                loadAvailablePermissions(parentId);
            }
        } else {
            reset(defaultValues);
            setAvailablePermissions([]);
        }
    }, [open, isEdit, role, reset, defaultValues, loadAvailablePermissions]);

    // Load permissions when parent changes
    useEffect(() => {
        const subscription = methods.watch((value, { name }) => {
            if (name === 'parent' && value.parent) {
                loadAvailablePermissions(value.parent as string);
                // Clear permissions when parent changes
                methods.setValue('permissions', []);
            } else if (name === 'parent' && (!value.parent || value.parent === '')) {
                setAvailablePermissions([]);
                methods.setValue('permissions', []);
            }
        });
        return () => subscription.unsubscribe();
    }, [methods, loadAvailablePermissions]);

    const handleClose = () => {
        reset(defaultValues);
        onClose();
    };

    const onSubmitForm = handleSubmit(async (data) => {
        try {
            // Validate permissions using global PERMISSIONS constant
            const allValidPermissions = getAllPermissions();
            const validPermissions = (data.permissions || [])
                .filter((p): p is string => typeof p === 'string' && p !== '')
                .filter((p) => isValidPermission(p) && allValidPermissions.includes(p));

            const payload = {
                name: data.name,
                description: data.description || '',
                type: data.type || 'player',
                parent: data.parent && data.parent !== '' ? data.parent : null,
                permissions: validPermissions,
            };

            if (isEdit && role) {
                const response = await updateRoleApi(role.id, payload);
                if (response?.data?.status) {
                    toast.success('Role updated successfully');
                    onSuccess?.();
                    handleClose();
                }
            } else {
                const response = await createRoleApi(payload);
                if (response?.data?.status) {
                    toast.success('Role created successfully');
                    onSuccess?.();
                    handleClose();
                }
            }
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.response?.data || error?.message || 'Failed to save role';
            toast.error(typeof errorMessage === 'string' ? errorMessage : 'Failed to save role');
        }
    });

    const selectedParentId = methods.watch('parent');
    const selectedPermissions = (methods.watch('permissions') || []).filter((p): p is string => typeof p === 'string' && p !== '');
    const hasParent = selectedParentId && selectedParentId !== '';

    const dialogTitle = isEdit ? 'Edit Role' : 'Create New Role';
    const actionLabel = isEdit ? 'Save Changes' : 'Create';

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogContent dividers>
                <FormProvider methods={methods} onSubmit={onSubmitForm}>
                    <Stack spacing={3} sx={{ pt: 2 }}>
                        <RHFTextField
                            name="name"
                            label="Role Name"
                            required
                            fullWidth
                        />
                        <RHFTextField
                            name="description"
                            label="Description"
                            multiline
                            rows={3}
                            fullWidth
                        />

                        <RHFSelect
                            name="type"
                            label="Role Type"
                            fullWidth
                            InputLabelProps={{
                                shrink: true,
                            }}
                        >
                            <MenuItem value="player">Player</MenuItem>
                            {(isAdmin || (isAgent && hasParent)) && <MenuItem value="agent">Agent</MenuItem>}
                            {isAdmin && <MenuItem value="official">Official</MenuItem>}
                            {isAdmin && <MenuItem value="admin">Admin</MenuItem>}
                        </RHFSelect>

                        <RHFSelect name="parent" label="Parent Role" fullWidth>
                            <MenuItem value="">None (Top Level)</MenuItem>
                            {availableParents.map((parent) => (
                                <MenuItem key={parent.id} value={parent.id}>
                                    {'  '.repeat(parent.level)} {parent.name}
                                </MenuItem>
                            ))}
                        </RHFSelect>

                        {hasParent && (
                            <Box>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                    Permissions (for Agent roles)
                                </Typography>
                                {availablePermissions.length === 0 && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        No permissions available for this parent role.
                                    </Typography>
                                )}
                                <FormGroup>
                                    {availablePermissions.map((permission) => {
                                        const permissionKey = permission.value || permission.key || '';
                                        return (
                                            <FormControlLabel
                                                key={permissionKey}
                                                control={
                                                    <Checkbox
                                                        checked={selectedPermissions.includes(permissionKey)}
                                                        onChange={(e) => {
                                                            const current = (methods.watch('permissions') || []).filter((p): p is string => typeof p === 'string' && p !== '');
                                                            if (e.target.checked) {
                                                                methods.setValue('permissions', [...current, permissionKey]);
                                                            } else {
                                                                methods.setValue('permissions', current.filter((p) => p !== permissionKey));
                                                            }
                                                        }}
                                                    />
                                                }
                                                label={permission.label}
                                            />
                                        );
                                    })}
                                </FormGroup>
                                {selectedPermissions.length > 0 && (
                                    <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {selectedPermissions.map((perm) => {
                                            const permission = availablePermissions.find(p => (p.value || p.key) === perm);
                                            return (
                                                <Chip
                                                    key={perm}
                                                    label={permission?.label || perm}
                                                    size="small"
                                                    onDelete={() => {
                                                        const current = (methods.watch('permissions') || []).filter((p): p is string => typeof p === 'string' && p !== '');
                                                        methods.setValue('permissions', current.filter((p) => p !== perm));
                                                    }}
                                                />
                                            );
                                        })}
                                    </Box>
                                )}
                            </Box>
                        )}
                    </Stack>
                </FormProvider>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <LoadingButton
                    variant="contained"
                    onClick={onSubmitForm}
                    loading={loading || isSubmitting}
                >
                    {actionLabel}
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
}

