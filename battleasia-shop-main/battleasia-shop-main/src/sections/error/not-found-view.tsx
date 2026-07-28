import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { SimpleLayout } from 'src/layouts/simple';
import { USER_COLORS, userGoldButtonSx } from 'src/layouts/user';
import { useTranslate } from 'src/locales/use-locales';
import { Iconify } from 'src/components/iconify';

import { varBounce, MotionContainer } from 'src/components/animate';

// ----------------------------------------------------------------------

const GOLD = USER_COLORS.gold;

export function NotFoundView() {
  const { t } = useTranslate();

  return (
    <SimpleLayout
      slotProps={{
        content: { compact: true },
      }}
    >
      <Box
        sx={{
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          bgcolor: '#050505',
          backgroundImage: `
            radial-gradient(ellipse 60% 40% at 50% 0%, ${alpha(GOLD, 0.12)} 0%, transparent 55%),
            linear-gradient(180deg, #0a0a0a 0%, #000000 100%)
          `,
        }}
      >
        <Container component={MotionContainer} sx={{ textAlign: 'center', py: 8 }}>
          <m.div variants={varBounce('in')}>
            <Typography
              className="font-tr"
              sx={{
                fontSize: { xs: 72, md: 96 },
                fontWeight: 800,
                lineHeight: 1,
                color: GOLD,
                letterSpacing: 2,
                mb: 2,
              }}
            >
              404
            </Typography>
          </m.div>

          <m.div variants={varBounce('in')}>
            <Typography
              className="font-tr"
              sx={{
                mb: 1.5,
                fontSize: { xs: 22, md: 28 },
                fontWeight: 800,
                textTransform: 'uppercase',
                color: '#ffffff',
              }}
            >
              {t('error.notFoundTitle')}
            </Typography>
          </m.div>

          <m.div variants={varBounce('in')}>
            <Typography
              sx={{
                color: alpha('#ffffff', 0.65),
                maxWidth: 420,
                mx: 'auto',
                mb: 4,
                lineHeight: 1.6,
              }}
            >
              {t('error.notFoundBody')}
            </Typography>
          </m.div>

          <m.div variants={varBounce('in')}>
            <Stack direction="row" justifyContent="center">
              <Button
                component={RouterLink}
                href={paths.user.shop}
                size="large"
                startIcon={<Iconify icon="solar:shop-bold" />}
                sx={{
                  ...userGoldButtonSx,
                  px: 3,
                  py: 1.25,
                }}
              >
                {t('error.goHome')}
              </Button>
            </Stack>
          </m.div>
        </Container>
      </Box>
    </SimpleLayout>
  );
}
