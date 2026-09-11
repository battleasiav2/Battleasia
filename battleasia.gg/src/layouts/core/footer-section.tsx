import { Box, Stack, Container, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';
import { Logo } from 'src/components/logo';
import { Iconify } from 'src/components/iconify';
import { useRouter, usePathname } from 'src/routes/hooks';
import { useTranslate } from 'src/locales/use-locales';

import { createMenuClickHandler } from '../menu-items-config';

// ----------------------------------------------------------------------
// CONSTANTS & EXISTING DATA
// ----------------------------------------------------------------------

const FOOTER_PARTNERS = [
  { label: 'battleasia.com', href: 'https://battleasia.com', icon: '/logo/logo.webp' },
  { label: 'baccoin.shop', href: 'https://baccoin.shop', icon: '/assets/images/currency.webp' },
  { label: 'battleasia.net', href: 'https://battleasia.net', icon: '/logo/logo.webp' },
  { label: 'pubg.com', href: 'https://www.pubg.com', icon: '/assets/images/games/pubg-mobile.png' },
  { label: 'www.bkash.com', href: 'https://www.bkash.com', icon: '/assets/images/bkash.webp' },
  { label: 'nagadwallet.net', href: 'https://nagadwallet.net', icon: '/assets/images/nagad.webp' },
] as const;

const SOCIAL_LINKS = [
  { labelKey: 'footer.facebook', icon: 'solar:facebook-bold', href: 'https://www.facebook.com/share/14XUaoaUgUL/?mibextid=wwXIfr' },
  { labelKey: 'footer.discord', icon: 'ic:baseline-discord', href: 'https://discord.gg/battleasia' },
  { labelKey: 'footer.tiktok', icon: 'ic:baseline-tiktok', href: 'https://www.tiktok.com/@battleasia?_r=1&_t=ZN-93nBYQnjiGU' },
  { labelKey: 'footer.instagram', icon: 'ri:instagram-fill', href: 'https://www.instagram.com/battleasia' },
  { labelKey: 'footer.youtube', icon: 'ri:youtube-fill', href: 'https://www.youtube.com/@BattleAsia' },
  { labelKey: 'footer.telegram', icon: 'ic:baseline-telegram', href: 'https://t.me/battleasiaofficial' },
] as const;

// ----------------------------------------------------------------------
// TOP SLOPED CONTOUR WITH CENTER HORNS / CREST & GREEN AMBIENT GLOW
// ----------------------------------------------------------------------

function FooterTopContour({ accentColor }: { accentColor: string }) {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: { xs: -36, sm: -48, md: -58 },
        left: 0,
        right: 0,
        height: { xs: 52, sm: 64, md: 74 },
        pointerEvents: 'none',
        zIndex: 3,
        overflow: 'visible',
      }}
    >
      {/* Soft Ambient Lime / Green Backlight Radiating Up Behind the Center Horns */}
      <Box
        sx={{
          position: 'absolute',
          top: { xs: '12%', md: '5%' },
          left: '50%',
          transform: 'translateX(-50%)',
          width: { xs: 180, sm: 260, md: 340 },
          height: { xs: 70, sm: 90, md: 110 },
          background: `radial-gradient(ellipse 65% 55% at 50% 85%, ${alpha(accentColor, 0.75)} 0%, ${alpha(accentColor, 0.28)} 40%, transparent 75%)`,
          filter: 'blur(16px)',
          pointerEvents: 'none',
        }}
      />

      {/* SVG Path: Sloped V Contour with Curved Upward Horns in Center */}
      <Box
        component="svg"
        viewBox="0 0 1920 80"
        preserveAspectRatio="none"
        sx={{
          width: 1,
          height: 1,
          display: 'block',
          overflow: 'visible',
        }}
      >
        <defs>
          <linearGradient id="footerLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={alpha(accentColor, 0.25)} />
            <stop offset="25%" stopColor={alpha(accentColor, 0.85)} />
            <stop offset="50%" stopColor={accentColor} />
            <stop offset="75%" stopColor={alpha(accentColor, 0.85)} />
            <stop offset="100%" stopColor={alpha(accentColor, 0.25)} />
          </linearGradient>

          <filter id="lineGlow" x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur stdDeviation="3" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Black silhouette fill below the sloped contour to seamlessly connect */}
        <path
          d="
            M 0 20
            L 900 48
            C 925 50 942 46 947 34
            C 951 24 947 12 943 5
            C 941 2 944 1 947 4
            C 953 9 957 20 957 36
            C 957 46 958 50 960 50
            C 962 50 963 46 963 36
            C 963 20 967 9 973 4
            C 976 1 979 2 977 5
            C 973 12 969 24 973 34
            C 978 46 995 50 1020 48
            L 1920 20
            L 1920 80
            L 0 80
            Z
          "
          fill="#060706"
        />

        {/* The Glowing Lime Contour Stroke */}
        <path
          d="
            M 0 20
            L 900 48
            C 925 50 942 46 947 34
            C 951 24 947 12 943 5
            C 941 2 944 1 947 4
            C 953 9 957 20 957 36
            C 957 46 958 50 960 50
            C 962 50 963 46 963 36
            C 963 20 967 9 973 4
            C 976 1 979 2 977 5
            C 973 12 969 24 973 34
            C 978 46 995 50 1020 48
            L 1920 20
          "
          fill="none"
          stroke="url(#footerLineGrad)"
          strokeWidth="2.2"
          filter="url(#lineGlow)"
        />
      </Box>
    </Box>
  );
}

// ----------------------------------------------------------------------
// STEALTH WING BACKGROUND GRAPHICS (MATCHING ATTACHED DESIGN)
// ----------------------------------------------------------------------

function StealthWingBackdrop({ accentColor }: { accentColor: string }) {
  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      <Box
        component="svg"
        viewBox="0 0 1920 260"
        preserveAspectRatio="none"
        sx={{
          position: 'absolute',
          inset: 0,
          width: 1,
          height: 1,
          opacity: 0.45,
        }}
      >
        {/* Left Stealth Facets */}
        <polygon points="960,50 820,90 540,160 300,180 960,260" fill="rgba(255,255,255,0.015)" />
        <polygon points="960,50 880,120 720,200 960,250" fill="rgba(0,0,0,0.4)" />
        <line x1="960" y1="50" x2="400" y2="170" stroke={alpha(accentColor, 0.08)} strokeWidth="1" />
        <line x1="960" y1="50" x2="680" y2="220" stroke={alpha('#ffffff', 0.04)} strokeWidth="1" />

        {/* Right Stealth Facets */}
        <polygon points="960,50 1100,90 1380,160 1620,180 960,260" fill="rgba(255,255,255,0.015)" />
        <polygon points="960,50 1040,120 1200,200 960,250" fill="rgba(0,0,0,0.4)" />
        <line x1="960" y1="50" x2="1520" y2="170" stroke={alpha(accentColor, 0.08)} strokeWidth="1" />
        <line x1="960" y1="50" x2="1240" y2="220" stroke={alpha('#ffffff', 0.04)} strokeWidth="1" />
      </Box>
    </Box>
  );
}

// ----------------------------------------------------------------------
// MAIN FOOTER SECTION COMPONENT
// ----------------------------------------------------------------------

export function FooterSection() {
  const theme = useTheme();
  const { t } = useTranslate();
  const pathname = usePathname();
  const router = useRouter();
  const handleMenuClick = createMenuClickHandler(pathname, router);

  // Lime-green accent matching the attached image design
  const accentColor = theme.palette.primary.main || '#a3e635';

  const linkStyle = {
    color: alpha('#ffffff', 0.7),
    fontSize: { xs: 12.5, md: 13.5 },
    fontWeight: 500,
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
    lineHeight: 1.5,
    '&:hover': {
      color: accentColor,
      textDecoration: 'underline',
    },
  };

  const sectionLabelSx = {
    fontFamily: 'monospace',
    fontSize: { xs: 10, md: 11 },
    fontWeight: 700,
    letterSpacing: 1.4,
    color: alpha('#ffffff', 0.42),
    textTransform: 'uppercase' as const,
    lineHeight: 1.3,
  };

  return (
    <Box
      component="footer"
      sx={{
        position: 'relative',
        bgcolor: '#060706',
        color: '#ffffff',
        pt: { xs: 5, sm: 6, md: 7.5 },
        pb: { xs: 4.5, sm: 5, md: 6 },
        mt: { xs: 6, md: 9 },
        overflow: 'visible',
        backgroundImage: `
          repeating-linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0) 0px,
            rgba(0, 0, 0, 0) 3px,
            rgba(0, 0, 0, 0.72) 3px,
            rgba(0, 0, 0, 0.72) 6px
          ),
          linear-gradient(
            180deg,
            #080a08 0%,
            #060706 60%,
            #030403 100%
          )
        `,
      }}
    >
      <FooterTopContour accentColor={accentColor} />
      <StealthWingBackdrop accentColor={accentColor} />

      <Container
        maxWidth="xl"
        sx={{
          position: 'relative',
          zIndex: 2,
          px: { xs: 2.25, sm: 3.5, md: 5 },
        }}
      >
        {/* Primary block: brand → links → support → social */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'center', md: 'flex-start' }}
          justifyContent="space-between"
          spacing={{ xs: 3.5, md: 4 }}
          sx={{
            pt: { xs: 1, md: 1.5 },
            pb: { xs: 0.5, md: 1 },
          }}
        >
          {/* Brand — strongest signal */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.75}
            sx={{
              flexShrink: 0,
              order: { xs: 1, md: 2 },
            }}
          >
            <Logo
              sx={{
                width: { xs: 60, md: 72 },
                height: { xs: 60, md: 72 },
                filter: `drop-shadow(0 0 12px ${alpha(accentColor, 0.35)})`,
              }}
            />
            <Box>
              <Typography
                className="font-brand-gaming"
                sx={{
                  fontSize: { xs: 24, md: 28 },
                  fontWeight: 900,
                  fontStyle: 'italic',
                  lineHeight: 1.05,
                  letterSpacing: 0.5,
                  color: '#ffffff',
                  textTransform: 'uppercase',
                }}
              >
                {t('common.brandName')}
              </Typography>
              <Typography
                sx={{
                  ...sectionLabelSx,
                  mt: 0.6,
                  color: alpha('#ffffff', 0.5),
                }}
              >
                {t('common.brandTagline')}
              </Typography>
            </Box>
          </Stack>

          {/* Legal + nav + copyright */}
          <Box
            sx={{
              textAlign: { xs: 'center', md: 'left' },
              order: { xs: 2, md: 3 },
              flexGrow: 1,
              px: { md: 2.5 },
              maxWidth: { md: 560 },
              minWidth: 0,
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent={{ xs: 'center', md: 'flex-start' }}
              flexWrap="wrap"
              useFlexGap
              spacing={{ xs: 1.25, md: 1.75 }}
              sx={{ rowGap: { xs: 1, md: 1.1 }, mb: { xs: 1.5, md: 1.75 } }}
            >
              <Typography component={RouterLink} href="/privacy-policy" sx={linkStyle}>
                {t('footer.privacyPolicy')}
              </Typography>
              <Typography sx={{ color: alpha('#ffffff', 0.22), fontSize: 12, lineHeight: 1 }} aria-hidden>
                ·
              </Typography>
              <Typography component={RouterLink} href="/terms-and-conditions" sx={linkStyle}>
                {t('footer.termsAndConditions')}
              </Typography>
              <Typography sx={{ color: alpha('#ffffff', 0.22), fontSize: 12, lineHeight: 1 }} aria-hidden>
                ·
              </Typography>
              <Typography
                component="span"
                onClick={(e: React.MouseEvent<HTMLAnchorElement>) =>
                  handleMenuClick(e, {
                    labelKey: 'footer.rules',
                    href: '/dashboard/rules',
                    scrollTarget: 'rules',
                    isActive: () => false,
                  })
                }
                sx={linkStyle}
              >
                {t('footer.rules')}
              </Typography>
              <Typography sx={{ color: alpha('#ffffff', 0.22), fontSize: 12, lineHeight: 1 }} aria-hidden>
                ·
              </Typography>
              <Typography
                component="span"
                onClick={(e: React.MouseEvent<HTMLAnchorElement>) =>
                  handleMenuClick(e, {
                    labelKey: 'footer.howToPlay',
                    href: '/dashboard/how-to-play',
                    scrollTarget: 'how-to-play',
                    isActive: () => false,
                  })
                }
                sx={linkStyle}
              >
                {t('footer.howToPlay')}
              </Typography>
              <Typography sx={{ color: alpha('#ffffff', 0.22), fontSize: 12, lineHeight: 1 }} aria-hidden>
                ·
              </Typography>
              <Typography
                component="span"
                onClick={(e: React.MouseEvent<HTMLAnchorElement>) =>
                  handleMenuClick(e, {
                    labelKey: 'footer.aboutUs',
                    href: '/dashboard/about-us',
                    scrollTarget: 'about-us',
                    isActive: () => false,
                  })
                }
                sx={linkStyle}
              >
                {t('footer.aboutUs')}
              </Typography>
            </Stack>

            <Typography
              sx={{
                fontSize: { xs: 12, md: 13 },
                color: alpha('#ffffff', 0.48),
                lineHeight: 1.55,
                letterSpacing: 0.15,
              }}
            >
              {t('footer.copyright', { year: new Date().getFullYear() })}
            </Typography>
          </Box>

          {/* Support — secondary column */}
          <Box
            sx={{
              textAlign: { xs: 'center', md: 'right' },
              flexShrink: 0,
              order: { xs: 3, md: 4 },
              pt: { md: 0.25 },
            }}
          >
            <Typography sx={{ ...sectionLabelSx, mb: 0.85, color: alpha('#ffffff', 0.45) }}>
              User Support
            </Typography>
            <Typography
              component="a"
              href="mailto:support@battleasia.gg"
              sx={{
                display: 'block',
                fontSize: { xs: 13, md: 14 },
                fontWeight: 600,
                color: alpha('#ffffff', 0.88),
                textDecoration: 'none',
                lineHeight: 1.35,
                transition: 'color 0.2s ease',
                '&:hover': {
                  color: accentColor,
                  textDecoration: 'underline',
                },
              }}
            >
              support@battleasia.gg
            </Typography>
            <Typography
              component={RouterLink}
              href="/support"
              sx={{
                display: 'inline-block',
                fontSize: 11.5,
                fontFamily: 'monospace',
                fontWeight: 700,
                color: accentColor,
                textDecoration: 'none',
                mt: 1,
                letterSpacing: 0.6,
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              [ LIVE SUPPORT RELAY ]
            </Typography>
          </Box>

          {/* Social — quiet utility row on mobile */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.35}
            sx={{
              flexShrink: 0,
              order: { xs: 4, md: 1 },
              pt: { xs: 0.5, md: 0.75 },
            }}
          >
            {SOCIAL_LINKS.map((item) => (
              <Box
                key={item.labelKey}
                component="a"
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t(item.labelKey)}
                sx={{
                  width: { xs: 34, md: 36 },
                  height: { xs: 34, md: 36 },
                  borderRadius: '50%',
                  bgcolor: '#0e130e',
                  border: `1.2px solid ${alpha(accentColor, 0.4)}`,
                  color: accentColor,
                  display: 'grid',
                  placeItems: 'center',
                  textDecoration: 'none',
                  transition: 'all 0.22s ease',
                  '&:hover': {
                    bgcolor: alpha(accentColor, 0.2),
                    borderColor: accentColor,
                    boxShadow: `0 0 12px ${alpha(accentColor, 0.65)}`,
                    transform: 'translateY(-2px)',
                    color: '#ffffff',
                  },
                }}
              >
                <Iconify icon={item.icon} width={17} />
              </Box>
            ))}
          </Stack>
        </Stack>

        {/* Secondary strip: payments + partners */}
        <Box
          sx={{
            mt: { xs: 3.5, md: 4.5 },
            pt: { xs: 2.75, md: 3.25 },
            borderTop: `1px solid ${alpha('#ffffff', 0.1)}`,
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'center', sm: 'flex-start' }}
            justifyContent="space-between"
            spacing={{ xs: 2.75, sm: 3 }}
            flexWrap="wrap"
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              alignItems="center"
              spacing={{ xs: 0.85, sm: 1.5 }}
              flexWrap="wrap"
              useFlexGap
            >
              <Typography sx={sectionLabelSx}>{t('footer.payments')}</Typography>
              <Typography
                sx={{
                  fontSize: { xs: 12, md: 12.5 },
                  color: alpha('#ffffff', 0.62),
                  lineHeight: 1.45,
                }}
              >
                {t('footer.bkash')} · {t('footer.nagad')} · {t('footer.crypto')}
              </Typography>
            </Stack>

            <Stack
              direction="row"
              alignItems="center"
              spacing={1.1}
              flexWrap="wrap"
              useFlexGap
              justifyContent={{ xs: 'center', sm: 'flex-end' }}
              sx={{ rowGap: 1 }}
            >
              <Typography sx={{ ...sectionLabelSx, mr: { sm: 0.25 } }}>
                {t('footer.trustedPartners')}
              </Typography>
              {FOOTER_PARTNERS.map((partner) => (
                <Box
                  key={partner.label}
                  component="a"
                  href={partner.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.65,
                    px: 1.15,
                    py: 0.5,
                    borderRadius: '6px',
                    border: `1px solid ${alpha('#ffffff', 0.1)}`,
                    bgcolor: alpha('#ffffff', 0.03),
                    color: alpha('#ffffff', 0.7),
                    fontSize: 11.5,
                    fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: alpha(accentColor, 0.5),
                      bgcolor: alpha(accentColor, 0.08),
                      color: accentColor,
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={partner.icon}
                    alt=""
                    sx={{ width: 14, height: 14, objectFit: 'contain', borderRadius: '2px' }}
                  />
                  <span>{partner.label}</span>
                </Box>
              ))}
            </Stack>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

export default FooterSection;
