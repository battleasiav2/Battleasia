import type { Theme, SxProps } from '@mui/material/styles';

import { Fragment } from 'react';

import Portal from '@mui/material/Portal';
import { styled } from '@mui/material/styles';

import { SimpleLoadingBar } from './simple-loading-bar';

// ----------------------------------------------------------------------

export type LoadingScreenProps = React.ComponentProps<'div'> & {
  portal?: boolean;
  sx?: SxProps<Theme>;
};

export function LoadingScreen({ portal, sx, ...other }: LoadingScreenProps) {
  const PortalWrapper = portal ? Portal : Fragment;

  return (
    <PortalWrapper>
      <LoadingContent sx={sx} {...other}>
        <SimpleLoadingBar />
      </LoadingContent>
    </PortalWrapper>
  );
}

// ----------------------------------------------------------------------

const LoadingContent = styled('div')(() => ({
  flexGrow: 1,
  width: '100%',
  display: 'flex',
  minHeight: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#060607',
}));
