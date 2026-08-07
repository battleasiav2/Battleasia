import { mergeClasses } from 'minimal-shared/utils';

import { styled } from '@mui/material/styles';

import { layoutClasses } from '../core/classes';

// ----------------------------------------------------------------------

export type MainSectionProps = React.ComponentProps<typeof MainRoot>;

export function MainSection({ children, className, sx, ...other }: MainSectionProps) {
  return (
    <MainRoot className={mergeClasses([layoutClasses.main, className])} sx={sx} {...other}>
      {children}
    </MainRoot>
  );
}

// ----------------------------------------------------------------------

const MainRoot = styled('main')(({ theme }) => ({
  display: 'flex',
  flex: '1 1 auto',
  flexDirection: 'column',
  // Keep footer below the first viewport before route content mounts —
  // otherwise footer is painted mid-screen then shoved down (CLS ~0.8).
  minHeight: 'calc(100dvh - var(--layout-header-mobile-height, 60px))',
  marginTop: 'var(--layout-main-mobile-margin-top)',
  [theme.breakpoints.up('sm')]: {
    marginTop: 'var(--layout-main-margin-top)',
    minHeight: 'calc(100dvh - var(--layout-header-desktop-height, 68px))',
  },
}));
