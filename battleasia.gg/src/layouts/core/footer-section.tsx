import { Box, Stack, Container, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

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
  { labelKey: 'footer.facebook', icon: 'mingcute:facebook-fill', href: 'https://www.facebook.com/share/14XUaoaUgUL/?mibextid=wwXIfr' },
  { labelKey: 'footer.discord', icon: 'mingcute:discord-fill', href: 'https://discord.gg/battleasia' },
  { labelKey: 'footer.tiktok', icon: 'mingcute:tiktok-fill', href: 'https://www.tiktok.com/@battleasia?_r=1&_t=ZN-93nBYQnjiGU' },
  { labelKey: 'footer.instagram', icon: 'mingcute:instagram-fill', href: 'https://www.instagram.com/battleasia' },
  { labelKey: 'footer.youtube', icon: 'mingcute:youtube-fill', href: 'https://www.youtube.com/@BattleAsia' },
  { labelKey: 'footer.telegram', icon: 'mingcute:telegram-fill', href: 'https://t.me/battleasiaofficial' },
] as const;

// ----------------------------------------------------------------------
// MAIN FOOTER SECTION COMPONENT
// ----------------------------------------------------------------------

export function FooterSection() {
  const { t } = useTranslate();
  const pathname = usePathname();
  const router = useRouter();
  const handleMenuClick = createMenuClickHandler(pathname, router);

  const linkStyle = {
    color: alpha('#ffffff', 0.7),
    fontSize: { xs: 12.5, md: 13.5 },
    fontWeight: 500,
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
    lineHeight: 1.5,
    '&:hover': {
      color: alpha('#ffffff', 0.92),
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
        bgcolor: '#07080b',
        color: '#ffffff',
        pt: { xs: 5, sm: 6, md: 7.5 },
        pb: { xs: 4.5, sm: 5, md: 6 },
        mt: 0,
        overflow: 'hidden',
        borderTop: 'none',
      }}
    >
      <Box
        component="img"
        src="/assets/images/black_bg.webp"
        alt=""
        width={1920}
        height={1080}
        loading="lazy"
        decoding="async"
        sx={{
          position: 'absolute',
          inset: 0,
          width: 1,
          height: 1,
          objectFit: 'cover',
          objectPosition: 'center center',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background: `
            linear-gradient(180deg, rgba(7, 8, 11, 0.55) 0%, rgba(7, 8, 11, 0.72) 45%, rgba(7, 8, 11, 0.88) 100%),
            linear-gradient(90deg, rgba(7, 8, 11, 0.5) 0%, transparent 30%, transparent 70%, rgba(7, 8, 11, 0.5) 100%)
          `,
        }}
      />

      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 22,
          pointerEvents: 'none',
          zIndex: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ position: 'absolute', left: 0, right: 0, top: '50%', borderTop: `1px solid ${alpha('#ffffff', 0.08)}` }} />
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            px: 1,
            bgcolor: 'transparent',
            color: alpha('#ffffff', 0.28),
            display: 'flex',
            lineHeight: 0,
          }}
        >
          <Iconify icon="solar:alt-arrow-down-bold" width={16} />
        </Box>
      </Box>

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
                  color: alpha('#ffffff', 0.95),
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
                color: alpha('#ffffff', 0.45),
                textDecoration: 'none',
                mt: 1,
                letterSpacing: 0.6,
                '&:hover': { textDecoration: 'underline', color: alpha('#ffffff', 0.7) },
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
                  bgcolor: alpha('#ffffff', 0.04),
                  border: `1px solid ${alpha('#ffffff', 0.1)}`,
                  color: alpha('#ffffff', 0.55),
                  display: 'grid',
                  placeItems: 'center',
                  textDecoration: 'none',
                  transition: 'border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease',
                  '&:hover': {
                    bgcolor: alpha('#ffffff', 0.08),
                    borderColor: alpha('#ffffff', 0.18),
                    boxShadow: 'none',
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
                      borderColor: alpha('#ffffff', 0.18),
                      bgcolor: alpha('#ffffff', 0.06),
                      color: '#ffffff',
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
