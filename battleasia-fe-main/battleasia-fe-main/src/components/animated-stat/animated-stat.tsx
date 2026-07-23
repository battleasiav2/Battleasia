import { useRef, useState, useEffect } from 'react';
import { Typography } from '@mui/material';

type AnimatedStatProps = {
    value: number;
    variant?: 'body1' | 'body2' | 'h6' | 'h5' | 'h4';
    fontWeight?: number;
    color?: string;
    fontSize?: string | { xs?: string; sm?: string; md?: string };
    duration?: number;
    sx?: any;
};

export function AnimatedStat({
    value,
    variant = 'body1',
    fontWeight = 600,
    color = 'text.primary',
    fontSize = { xs: '0.8rem', sm: '1rem' },
    duration = 600,
    sx = {},
}: AnimatedStatProps) {
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
        <Typography
            variant={variant}
            sx={{
                fontWeight,
                color,
                fontSize,
                transition: 'all 0.3s ease',
                transform: isAnimating ? 'scale(1.1)' : 'scale(1)',
                textShadow: isAnimating
                    ? '0 0 15px rgba(33, 150, 243, 0.6), 0 0 25px rgba(33, 150, 243, 0.4)'
                    : 'none',
                animation: isAnimating ? 'statPulse 0.5s ease-in-out' : 'none',
                '@keyframes statPulse': {
                    '0%, 100%': {
                        opacity: 1,
                    },
                    '50%': {
                        opacity: 0.8,
                    },
                },
                ...sx,
            }}
        >
            {displayValue}
        </Typography>
    );
}
