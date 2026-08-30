import type { SxProps, Theme } from '@mui/material/styles';

import { Box } from '@mui/material';
import { alpha } from '@mui/material/styles';

export const HOME_GOLD = '#f5c518';

/** Home/dashboard readable text scale — WCAG AA on #161618 / #0a0a0a */
export const HOME_TEXT_PRIMARY = '#ffffff';
export const HOME_TEXT_SECONDARY = '#D1D5DB';
export const HOME_TEXT_MUTED = '#9CA3AF';

export const HOME_ROW_LINE = '1px solid rgba(255, 255, 255, 0.08)';

/** Flat blur surface — shared by home sections + auth card */
export const homeBlurPanelSx: SxProps<Theme> = {
    position: 'relative',
    bgcolor: alpha('#161618', 0.4),
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    border: `1px solid ${alpha('#ffffff', 0.07)}`,
    boxShadow: `inset 0 1px 0 ${alpha('#ffffff', 0.05)}`,
};

/** Shared flat blur container — dashboard + home sections */
export function HomeBlurPanel({
    children,
    sx,
}: {
    children: React.ReactNode;
    sx?: SxProps<Theme>;
}) {
    return (
        <Box
            sx={[
                homeBlurPanelSx,
                { p: { xs: 1.35, sm: 1.65 } },
                ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
            ]}
        >
            {children}
        </Box>
    );
}
