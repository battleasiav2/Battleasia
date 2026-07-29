import { useState } from 'react';
import {
  Box,
  Button,
  ListItemIcon,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridToolbarQuickFilter,
  GridToolbarProps,
} from '@mui/x-data-grid';
import Iconify from 'src/components/iconify';

export type UsersTableToolbarProps = GridToolbarProps & {
  canDeleteAll?: boolean;
  onDeleteAllClick?: () => void;
};

export function UsersTableToolbar({
  canDeleteAll = false,
  onDeleteAllClick,
  ...other
}: UsersTableToolbarProps) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const handleDeleteAll = () => {
    setMenuAnchor(null);
    onDeleteAllClick?.();
  };

  return (
    <GridToolbarContainer {...other}>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport />
      {canDeleteAll && (
        <>
          <Button
            size="small"
            color="inherit"
            startIcon={<Iconify icon="eva:more-vertical-fill" width={18} />}
            onClick={(event) => setMenuAnchor(event.currentTarget)}
          >
            Delete all users
          </Button>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          >
            <MenuItem onClick={handleDeleteAll} sx={{ color: 'error.main' }}>
              <ListItemIcon sx={{ color: 'error.main' }}>
                <Iconify icon="solar:trash-bin-trash-bold" width={20} />
              </ListItemIcon>
              Delete all users
            </MenuItem>
          </Menu>
        </>
      )}
      <Box sx={{ flexGrow: 1 }} />
      <GridToolbarQuickFilter debounceMs={250} />
    </GridToolbarContainer>
  );
}
