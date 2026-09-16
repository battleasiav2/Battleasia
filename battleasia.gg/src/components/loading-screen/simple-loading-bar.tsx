import Box from '@mui/material/Box';

/** Canonical BattleAsia page loader — logo + thin gold bar. */
export function SimpleLoadingBar() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2.5,
      }}
    >
      <Box
        component="img"
        src="/logo/logo.webp"
        alt=""
        width={56}
        height={56}
        sx={{ width: 56, height: 56, objectFit: 'contain' }}
      />
      <Box
        aria-hidden
        sx={{
          width: 220,
          height: 3,
          borderRadius: 99,
          bgcolor: 'rgba(255,255,255,0.12)',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            width: '42%',
            height: 1,
            borderRadius: 99,
            bgcolor: 'var(--ba-gold, #cbfb24)',
            animation: 'ba-simple-load 1.05s ease-in-out infinite',
            '@keyframes ba-simple-load': {
              '0%': { transform: 'translateX(-130%)' },
              '100%': { transform: 'translateX(280%)' },
            },
            '@media (prefers-reduced-motion: reduce)': {
              animation: 'none',
              width: '100%',
              opacity: 0.7,
            },
          }}
        />
      </Box>
    </Box>
  );
}
