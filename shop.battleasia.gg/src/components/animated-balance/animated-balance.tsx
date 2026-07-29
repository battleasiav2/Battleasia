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
  fontSize = { xs: '0.85rem', sm: '1rem' },
  fontWeight = 700,
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
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - (1 - progress) ** 3;
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
    <Box sx={{ position: 'relative', display: 'inline-block' }}>
      <Typography
        variant="h6"
        sx={{
          color,
          fontWeight,
          fontSize,
          whiteSpace: 'nowrap',
          transition: 'all 0.3s ease',
          transform: isAnimating ? 'scale(1.12)' : 'scale(1)',
          textShadow: isAnimating ? `0 0 16px rgba(245, 197, 24, 0.55)` : 'none',
          lineHeight: 1,
        }}
      >
        {fNumber(displayValue) || '0'}
      </Typography>
    </Box>
  );
}
