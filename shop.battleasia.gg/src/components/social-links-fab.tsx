import { useMemo, useState } from 'react';

import { alpha, useTheme } from '@mui/material/styles';
import { Fab, Box, Tooltip, IconButton } from '@mui/material';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const SOCIAL_LINKS = [
  {
    label: 'Facebook',
    icon: 'ri:facebook-fill',
    color: '#1877F2',
    href: 'https://www.facebook.com/share/1HQV9D33ic/?mibextid=wwXIfr',
  },
  {
    label: 'YouTube',
    icon: 'ri:youtube-fill',
    color: '#FF0000',
    href: 'https://youtube.com/@battleasia?si=9ROsHqQNc3mVFMvl',
  },
  {
    label: 'WhatsApp',
    icon: 'ri:whatsapp-fill',
    color: '#25D366',
    href: 'https://whatsapp.com/channel/0029VbBDBVtGpLHQgYC7WM44',
  },
  {
    label: 'TikTok',
    icon: 'ri:tiktok-fill',
    color: '#000000',
    href: 'https://www.tiktok.com/@battleasia?_r=1&_t=ZN-91f9vFOUJcc',
  },
];

// ----------------------------------------------------------------------

export function SocialLinksFab() {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const positions = useMemo(() => {
    const total = SOCIAL_LINKS.length;
    const radius = 88;
    return SOCIAL_LINKS.map((_, index) => {
      if (total === 1) {
        return { x: -radius, y: 0 };
      }
      const angle = (Math.PI / 2) * (index / (total - 1 || 1));
      const distance = radius + index * 6;
      return {
        x: -Math.cos(angle) * distance,
        y: -Math.sin(angle) * distance,
      };
    });
  }, []);

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: { xs: 10, md: 32 },
        right: { xs: 16, md: 32 },
        zIndex: 1400,
        pointerEvents: 'none',
      }}
    >
      {SOCIAL_LINKS.map((link, index) => {
        const { x, y } = positions[index];
        return (
          <Tooltip key={link.label} title={link.label} placement="left">
            <IconButton
              component="a"
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 48,
                height: 48,
                color: '#fff',
                bgcolor: link.color,
                boxShadow: theme.shadows[8],
                transform: `translate(${open ? x : 0}px, ${open ? y : 0}px)`,
                opacity: open ? 1 : 0,
                pointerEvents: open ? 'auto' : 'none',
                transition: theme.transitions.create(['transform', 'opacity'], {
                  duration: 240,
                  easing: theme.transitions.easing.easeOut,
                }),
                '&:hover': {
                  bgcolor: alpha(link.color, 0.8),
                },
              }}
            >
              <Iconify icon={link.icon} width={22} />
            </IconButton>
          </Tooltip>
        );
      })}

      <Fab
        color="secondary"
        onClick={() => setOpen((prev) => !prev)}
        sx={{
          pointerEvents: 'auto',
          width: 50,
          height: 50,
          boxShadow: theme.shadows[12],
        }}
      >
        <Iconify
          icon={open ? 'solar:close-circle-bold-duotone' : 'mynaui:chat-messages'}
          width={28}
        />
      </Fab>
    </Box>
  );
}


