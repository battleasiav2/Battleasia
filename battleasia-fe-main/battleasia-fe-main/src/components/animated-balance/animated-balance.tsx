import { useRef, useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { fNumber } from 'src/utils/format-number';

type AnimatedBalanceProps = {
    value: number;
    fontSize?: string | { xs?: string; sm?: string; md?: string };
    fontWeight?: number;
    color?: string;
    duration?: number;
};

export function AnimatedBalance({
    value,
    fontSize = { xs: '0.85rem', sm: '1.25rem' },
    fontWeight = 600,
    color = 'text.primary',
    duration = 800,
}: AnimatedBalanceProps) {
    const [displayValue, setDisplayValue] = useState(value);
    const [isAnimating, setIsAnimating] = useState(false);
    const prevValueRef = useRef(value);
    const frameRef = useRef<number>();

    useEffect(() => {
        if (prevValueRef.current === value) {
            return undefined;
        }

        setIsAnimating(true);
        const startValue = prevValueRef.current;
        const endValue = value;
        const startTime = Date.now();
        const animate = () => {
            const now = Date.now();
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = startValue + (endValue - startValue) * easeOut;

            setDisplayValue(Math.round(currentValue));

            if (progress < 1) {
                frameRef.current = requestAnimationFrame(animate);
            } else {
                setDisplayValue(endValue);
                setIsAnimating(false);
                prevValueRef.current = endValue;
            }
        };

        frameRef.current = requestAnimationFrame(animate);

        return () => {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
        };
    }, [value, duration]);

    return (
        <Box
            sx={{
                position: 'relative',
                display: 'inline-block',
            }}
        >
            <Typography
                variant="h6"
                sx={{
                    color,
                    fontWeight,
                    fontSize,
                    whiteSpace: 'nowrap',
                    transition: 'all 0.3s ease',
                    transform: isAnimating ? 'scale(1.15)' : 'scale(1)',
                    textShadow: isAnimating
                        ? '0 0 20px rgba(255, 215, 0, 0.8), 0 0 30px rgba(255, 215, 0, 0.6)'
                        : 'none',
                    animation: isAnimating ? 'pulse 0.6s ease-in-out' : 'none',
                    '@keyframes pulse': {
                        '0%, 100%': {
                            opacity: 1,
                        },
                        '50%': {
                            opacity: 0.85,
                        },
                    },
                }}
            >
                {fNumber(displayValue) || '0'}
            </Typography>
            {isAnimating && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '120%',
                        height: '120%',
                        borderRadius: '50%',
                        background:
                            'radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%)',
                        animation: 'ripple 0.8s ease-out',
                        pointerEvents: 'none',
                        '@keyframes ripple': {
                            '0%': {
                                transform: 'translate(-50%, -50%) scale(0.8)',
                                opacity: 1,
                            },
                            '100%': {
                                transform: 'translate(-50%, -50%) scale(2)',
                                opacity: 0,
                            },
                        },
                    }}
                />
            )}
        </Box>
    );
}
