import { useMemo, useState } from 'react';

import { Box, Fab } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks/use-router';

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

export function SupportChat() {
    const [open] = useState(false);
    const router = useRouter();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    const handleOpenSupportChat = () => {
        router.push(paths.user.account.customerSupport);
    }

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
            <Fab
                onClick={() => handleOpenSupportChat()}
                sx={{
                    pointerEvents: 'auto',
                    width: 50,
                    height: 50,
                    bgcolor: alpha('#0a0a0a', 0.88),
                    color: '#feab02',
                    border: `1px solid ${alpha('#ffffff', 0.12)}`,
                    boxShadow: `0 8px 24px ${alpha('#000000', 0.55)}`,
                    backdropFilter: 'blur(12px)',
                    '&:hover': {
                        bgcolor: alpha('#feab02', 0.14),
                        borderColor: alpha('#feab02', 0.35),
                    },
                }}
            >
                <Iconify
                    icon={open ? 'solar:close-circle-bold-duotone' : 'solar:headphones-round-sound-bold'}
                    width={28}
                />
            </Fab>
        </Box>
    );
}


