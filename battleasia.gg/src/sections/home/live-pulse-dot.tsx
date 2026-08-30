import { Box } from '@mui/material';
import { alpha } from '@mui/material/styles';

type LivePulseDotProps = {
    color?: 'green' | 'red';
    size?: number;
};

const DOT_COLORS = {
    green: '#22c55e',
    red: '#ef4444',
} as const;

/** CSS-only pulsing live indicator — no JS animation libs on the critical path. */
export function LivePulseDot({ color = 'green', size = 7 }: LivePulseDotProps) {
    const dotColor = DOT_COLORS[color];

    return (
        <Box
            aria-hidden
            sx={{
                position: 'relative',
                width: size,
                height: size,
                flexShrink: 0,
                borderRadius: '50%',
                bgcolor: dotColor,
                boxShadow: `0 0 6px ${alpha(dotColor, 0.55)}`,
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    inset: -2,
                    borderRadius: '50%',
                    border: `1.5px solid ${alpha(dotColor, 0.65)}`,
                    animation: 'livePulseRing 1.85s ease-out infinite',
                },
                '@keyframes livePulseRing': {
                    '0%': { transform: 'scale(0.85)', opacity: 0.85 },
                    '70%': { transform: 'scale(2.1)', opacity: 0 },
                    '100%': { transform: 'scale(2.1)', opacity: 0 },
                },
            }}
        />
    );
}
