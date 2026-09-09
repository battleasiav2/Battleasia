import React from 'react';
// @mui
import { alpha, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
// routes
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
// theme
import { bgGradient } from 'src/theme/css';
// components
import Logo from 'src/components/logo';
// utils
import { assetPath } from 'src/utils/asset-path';

// ----------------------------------------------------------------------

const METHODS = [
  {
    id: 'jwt',
    label: 'Jwt',
    path: paths.auth.login,
    icon: assetPath('/assets/icons/auth/ic_jwt.svg'),
  },
];

type Props = {
  title?: string;
  image?: string;
  children: React.ReactNode;
};

export default function AuthClassicLayout({ children, image, title }: Props) {
  const theme = useTheme();

  const mdUp = useResponsive('up', 'md');

  const renderLogo = (
    <Logo
      sx={{
        zIndex: 9,
        height: 100,
        width: "auto",
        position: 'absolute',
        m: { xs: 2, md: 5 },
      }}
    />
  );

  const renderContent = (
    <Stack
      sx={{
        width: 1,
        mx: 'auto',
        maxWidth: 500,
        px: { xs: 2.5, md: 5 },
        pt: { xs: 15, md: 18 },
        pb: { xs: 12, md: 0 },
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          p: { xs: 3, md: 4.5 },
          borderRadius: 2.5,
          bgcolor:
            theme.palette.mode === 'dark' ? 'rgba(17, 23, 38, 0.85)' : 'background.paper',
          border:
            theme.palette.mode === 'dark'
              ? '1px solid rgba(245, 166, 35, 0.22)'
              : `1px solid ${theme.palette.divider}`,
          boxShadow:
            theme.palette.mode === 'dark'
              ? '0 20px 60px rgba(0, 0, 0, 0.75), 0 0 24px rgba(245, 166, 35, 0.1)'
              : (theme.customShadows?.card || theme.shadows[2]),
          backdropFilter: 'blur(16px)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background:
              theme.palette.mode === 'dark'
                ? 'linear-gradient(90deg, transparent, rgba(245, 166, 35, 0.8), transparent)'
                : 'transparent',
          },
        }}
      >
        {children}
      </Box>
    </Stack>
  );

  const renderSection = (
    <Stack
      flexGrow={1}
      spacing={6}
      alignItems="center"
      justifyContent="center"
      sx={{
        position: 'relative',
        bgcolor: 'rgba(10, 14, 23, 0.35)',
        backdropFilter: 'blur(4px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        p: 4,
      }}
    >
      <Typography
        variant="h3"
        sx={{
          maxWidth: 480,
          textAlign: 'center',
          color: '#ffffff',
          fontWeight: 700,
          textShadow: '0 4px 20px rgba(0, 0, 0, 0.8)',
          letterSpacing: '-0.5px',
        }}
      >
        {title || 'Hi, Welcome back'}
      </Typography>

      {image && (
        <Box
          component="img"
          alt="auth"
          src={image}
          sx={{
            maxWidth: {
              xs: 480,
              lg: 560,
              xl: 720,
            },
          }}
        />
      )}

      <Stack direction="row" spacing={2}>
        {METHODS.map((option) => (
          <Tooltip key={option.label} title={option.label}>
            <Link component={RouterLink} href={option.path}>
              <Box
                component="img"
                alt={option.label}
                src={option.icon}
                sx={{
                  width: 32,
                  height: 32,
                  ...(option.id !== "jwt" && {
                    filter: 'grayscale(100%)',
                  }),
                }}
              />
            </Link>
          </Tooltip>
        ))}
      </Stack>
    </Stack>
  );

  return (
    <Stack
      component="main"
      direction="row"
      sx={{
        minHeight: '100vh',
        position: 'relative',
        backgroundImage: `linear-gradient(rgba(10, 14, 23, 0.65), rgba(10, 14, 23, 0.65)), url(${assetPath('/auth-background.jpeg')})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {renderLogo}

      {mdUp && renderSection}

      {renderContent}
    </Stack>
  );
}
