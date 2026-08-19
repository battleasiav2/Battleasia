import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';

import { useTranslate } from 'src/locales/use-locales';
import { Iconify } from 'src/components/iconify/iconify';

// ----------------------------------------------------------------------

export function NotFoundView() {
  const { t } = useTranslate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(160deg, #000 0%, #0a0a0a 50%, #111 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: (theme) =>
            `radial-gradient(circle, ${alpha(theme.palette.warning.main, 0.06)} 0%, transparent 70%)`,
          pointerEvents: 'none',
        },
      }}
    >
      <Container maxWidth="sm" sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <Iconify
          icon="solar:ghost-bold-duotone"
          width={96}
          sx={{ color: 'warning.main', mb: 3, opacity: 0.7 }}
        />

        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '5rem', md: '7rem' },
            fontWeight: 900,
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1,
            mb: 1,
          }}
        >
          404
        </Typography>

        <Typography variant="h4" sx={{ color: '#fff', mb: 1.5 }}>
          {t('errors.notFoundTitle')}
        </Typography>

        <Typography sx={{ color: 'text.secondary', mb: 4, maxWidth: 360, mx: 'auto' }}>
          {t('errors.notFoundDescription')}
        </Typography>

        <Button
          component={RouterLink}
          href="/"
          size="large"
          variant="contained"
          startIcon={<Iconify icon="solar:home-2-bold" />}
          sx={{
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            color: '#000',
            fontWeight: 700,
            px: 4,
            py: 1.2,
            '&:hover': {
              background: 'linear-gradient(135deg, #FFA500 0%, #FF8C00 100%)',
            },
          }}
        >
          {t('errors.goToHome')}
        </Button>
      </Container>
    </Box>
  );
}
