import { Box, Stack, useTheme, Typography, useMediaQuery } from '@mui/material';

import { Logo } from 'src/components/logo';
import { Image } from 'src/components/image';

export function FooterSection() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <Box
            component="footer"
            sx={{
                background: '#131313',
                position: 'relative',
                marginTop: { xs: 20, sm: '300px' },
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    width: 1,
                    height: 108,
                    position: 'absolute',
                    top: -100,
                    left: 0,
                    zIndex: 2,
                    pointerEvents: 'none',
                    background: "url('/assets/images/foot-t.webp') no-repeat center top",
                    backgroundSize: 'cover',
                },
            }}
        >
            <Image
                src="/assets/images/foot_car-transparent.webp"
                alt="footer car"
                sx={{
                    width: { xs: 'auto', md: 649 },
                    maxWidth: { xs: 1, md: 649 },
                    height: { xs: 200, md: 505 },
                    position: 'absolute',
                    zIndex: 0,
                    [isMobile ? 'top' : 'bottom']: { xs: -50, md: 0 },
                    right: 0,
                    pointerEvents: 'none',
                    '& img': {
                        objectFit: 'contain',
                        objectPosition: 'right bottom',
                        width: 1,
                        height: 1,
                    },
                }}
            />
            <Stack
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    color: '#fff',
                    padding: { xs: '40px 8px 80px', md: '45px 0 10px 160px' },
                }}
            >
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 4, md: 10 }}>
                    <Stack spacing={2} maxWidth={300}>
                        <Logo sx={{ width: 100, height: 'auto' }} />
                    </Stack>

                    <Stack spacing={2} justifyContent="center" textAlign={{ xs: 'center', md: 'left' }}>
                        <Typography className="font-tr" fontSize={20} sx={{ maxWidth: 420, color: 'text.secondary' }}>
                            Asia&apos;s premier mobile gaming platform for competitive tournaments and real cash prizes.
                        </Typography>
                    </Stack>
                </Stack>

                <Box sx={{ mt: 1, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', py: 3 }}>
                        © {new Date().getFullYear()} BattleAsia Gaming Platform. All rights reserved.
                    </Typography>
                </Box>
            </Stack>
        </Box>
    );
}

export default FooterSection;
