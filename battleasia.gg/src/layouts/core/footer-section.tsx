import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';

import { Logo } from 'src/components/logo';
import { BattleGoldDivider } from 'src/components/battle-gold-divider';
import { createMenuClickHandler } from '../menu-items-config';
import { useRouter, usePathname } from 'src/routes/hooks';
import { useTranslate } from 'src/locales/use-locales';

const GOLD = '#f5c518';

/** Trusted partner / affiliate domain pills */
const FOOTER_PARTNERS = [
  { label: 'battleasia.com', href: 'https://battleasia.com', icon: '/logo/logo.webp' },
  { label: 'baccoin.shop', href: 'https://baccoin.shop', icon: '/assets/images/currency.webp' },
  { label: 'battleasia.net', href: 'https://battleasia.net', icon: '/logo/logo.webp' },
  { label: 'pubg.com', href: 'https://www.pubg.com', icon: '/assets/images/games/pubg-mobile.png' },
  { label: 'www.bkash.com', href: 'https://www.bkash.com', icon: '/assets/images/bkash.webp' },
  { label: 'nagadwallet.net', href: 'https://nagadwallet.net', icon: '/assets/images/nagad.webp' },
  { label: 'coinremitter.com', href: 'https://coinremitter.com', icon: '/assets/images/currency.webp' },
] as const;

const linkSx = {
  color: alpha('#ffffff', 0.55),
  textDecoration: 'none',
  fontSize: { xs: 12, sm: 13 },
  lineHeight: 1.4,
  cursor: 'pointer',
  transition: 'color 0.2s ease',
  '&:hover': { color: GOLD },
};

export function FooterSection() {
  const { t, currentLang } = useTranslate();
  const isBengali = currentLang?.value === 'bn';

  const pathname = usePathname();
  const router = useRouter();
  const handleMenuClick = createMenuClickHandler(pathname, router);

  const navSections = [
    {
      titleKey: 'footer.information',
      links: [
        { labelKey: 'footer.home', href: '/dashboard', scrollTarget: 'home' },
        { labelKey: 'footer.aboutUs', href: '/dashboard/about-us', scrollTarget: 'about-us' },
        { labelKey: 'footer.howToPlay', href: '/dashboard/how-to-play', scrollTarget: 'how-to-play' },
        { labelKey: 'footer.rules', href: '/dashboard/rules', scrollTarget: 'rules' },
      ],
    },
    {
      titleKey: 'footer.social',
      links: [
        { labelKey: 'footer.facebook', href: 'https://www.facebook.com/share/14XUaoaUgUL/?mibextid=wwXIfr' },
        { labelKey: 'footer.tiktok', href: 'https://www.tiktok.com/@battleasia?_r=1&_t=ZN-93nBYQnjiGU' },
        { labelKey: 'footer.instagram', href: 'https://www.instagram.com/battleasia' },
        { labelKey: 'footer.youtube', href: 'https://www.youtube.com/@BattleAsia' },
        { labelKey: 'footer.telegram', href: 'https://t.me/battleasiaofficial' },
      ],
    },
    {
      titleKey: 'footer.payments',
      links: [
        { labelKey: 'footer.bkash' },
        { labelKey: 'footer.nagad' },
        { labelKey: 'footer.crypto' },
      ],
    },
    {
      titleKey: 'footer.securityAndConfidentiality',
      links: [
        { labelKey: 'footer.privacyPolicy', href: '/privacy-policy' },
        { labelKey: 'footer.termsAndConditions', href: '/terms-and-conditions' },
      ],
    },
  ];

  return (
    <Box
      component="footer"
      sx={{
        position: 'relative',
        overflowX: 'hidden',
        bgcolor: '#0a0a0a',
        borderTop: `1px solid ${alpha('#ffffff', 0.06)}`,
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse 60% 40% at 50% 0%, ${alpha(GOLD, 0.06)} 0%, transparent 55%)`,
          pointerEvents: 'none',
        },
      }}
    >
      <Stack
        spacing={{ xs: 2.5, md: 3.5 }}
        sx={{
          position: 'relative',
          zIndex: 1,
          px: { xs: 2, sm: 3, md: 4 },
          pt: { xs: 3, md: 4.5 },
          pb: { xs: 2.5, md: 3.5 },
          maxWidth: 1280,
          mx: 'auto',
        }}
      >
        {/* Brand — logo + title + gold line (matches header / arena strip) */}
        <Box sx={{ width: 1, maxWidth: { xs: 340, sm: 380, md: 420 } }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={{ xs: 1.25, sm: 1.5 }}
            sx={{ minWidth: 0 }}
          >
            <Logo
              sx={{
                width: { xs: 52, sm: 64, md: 72 },
                height: { xs: 52, sm: 64, md: 72 },
                flexShrink: 0,
              }}
            />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                className="font-brand-gaming"
                sx={{
                  fontSize: isBengali
                    ? { xs: 14, sm: 18, md: 20 }
                    : { xs: 16, sm: 20, md: 22 },
                  fontWeight: 800,
                  lineHeight: 1.1,
                  background: `linear-gradient(180deg, #ffe08a 0%, ${GOLD} 48%, #d4a017 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: `drop-shadow(0 0 12px ${alpha(GOLD, 0.4)})`,
                }}
              >
                {t('common.brandName')}
              </Typography>
              <Typography
                className="font-tr"
                sx={{
                  mt: 0.35,
                  fontSize: { xs: 9, sm: 11, md: 12 },
                  color: alpha('#ffffff', 0.5),
                  fontWeight: 600,
                  letterSpacing: { xs: 0.5, md: 0.9 },
                  textTransform: 'uppercase',
                  lineHeight: 1.25,
                }}
              >
                {t('common.brandTagline')}
              </Typography>
            </Box>
          </Stack>

          <BattleGoldDivider
            variant="title"
            sx={{
              mt: 1.25,
              width: 1,
              maxWidth: 1,
            }}
          />
        </Box>

        {/* Link columns — 2 on mobile, 4 on desktop */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, minmax(0, 1fr))',
              md: 'repeat(4, minmax(0, 1fr))',
            },
            gap: { xs: 2.5, sm: 3, md: 3.5 },
            rowGap: { xs: 2.75, md: 3 },
          }}
        >
          {navSections.map((section) => (
            <Box key={section.titleKey} sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 800,
                  mb: { xs: 1, md: 1.25 },
                  letterSpacing: 0.8,
                  color: '#ffffff',
                  textTransform: 'uppercase',
                  fontSize: { xs: 11, sm: 12 },
                  lineHeight: 1.3,
                }}
              >
                {t(section.titleKey)}
              </Typography>
              <Stack spacing={{ xs: 0.7, md: 0.85 }}>
                {section.links.map((link: { labelKey: string; href?: string; scrollTarget?: string }) => {
                  const isExternalLink =
                    link.href?.startsWith('http://') || link.href?.startsWith('https://');

                  if (isExternalLink) {
                    return (
                      <Typography
                        key={link.labelKey}
                        component="a"
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={linkSx}
                      >
                        {t(link.labelKey)}
                      </Typography>
                    );
                  }

                  return (
                    <Typography
                      key={link.labelKey}
                      component={link.href ? RouterLink : 'span'}
                      {...(link.href ? { href: link.href } : {})}
                      onClick={(e: React.MouseEvent<HTMLAnchorElement>) =>
                        handleMenuClick(e, {
                          labelKey: link.labelKey,
                          href: link.href || '',
                          scrollTarget: link.scrollTarget || '',
                          isActive: () => false,
                        })
                      }
                      sx={linkSx}
                    >
                      {t(link.labelKey)}
                    </Typography>
                  );
                })}
              </Stack>
            </Box>
          ))}
        </Box>

        {/* Trusted partners — centered pills with icons */}
        <Box
          sx={{
            pt: { xs: 2.25, md: 3 },
            mt: { xs: 0.5, md: 1 },
            borderTop: `1px solid ${alpha('#ffffff', 0.08)}`,
          }}
        >
          <Typography
            sx={{
              mb: { xs: 1.75, md: 2.25 },
              textAlign: 'center',
              fontSize: { xs: 12, sm: 13 },
              fontWeight: 500,
              color: alpha('#ffffff', 0.45),
            }}
          >
            {t('footer.trustedPartners')}
          </Typography>

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              gap: { xs: 1, sm: 1.25 },
              maxWidth: 980,
              mx: 'auto',
            }}
          >
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
                  gap: 1,
                  px: { xs: 1.25, sm: 1.5 },
                  py: { xs: 0.75, sm: 0.9 },
                  minHeight: { xs: 36, sm: 40 },
                  borderRadius: '10px',
                  border: `1px solid ${alpha('#ffffff', 0.16)}`,
                  bgcolor: alpha('#ffffff', 0.04),
                  color: '#ffffff',
                  textDecoration: 'none',
                  transition: 'border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease',
                  '&:hover': {
                    borderColor: alpha(GOLD, 0.55),
                    bgcolor: alpha(GOLD, 0.08),
                    transform: 'translateY(-1px)',
                    '& .partner-label': { color: GOLD },
                  },
                }}
              >
                <Box
                  component="img"
                  src={partner.icon}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  sx={{
                    width: { xs: 20, sm: 22 },
                    height: { xs: 20, sm: 22 },
                    objectFit: 'contain',
                    borderRadius: '4px',
                    flexShrink: 0,
                    bgcolor: alpha('#000000', 0.25),
                  }}
                />
                <Typography
                  className="partner-label"
                  sx={{
                    color: '#ffffff',
                    fontSize: { xs: 12, sm: 13 },
                    fontWeight: 700,
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                    transition: 'color 0.2s ease',
                  }}
                >
                  {partner.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Bottom bar */}
        <Box
          sx={{
            pt: { xs: 1.5, md: 2 },
            mt: { xs: 0.5, md: 1 },
            borderTop: `1px solid ${alpha('#ffffff', 0.08)}`,
          }}
        >
          <Typography
            sx={{
              color: alpha('#ffffff', 0.35),
              textAlign: 'center',
              fontSize: { xs: 11, sm: 12 },
              lineHeight: 1.5,
            }}
          >
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

export default FooterSection;
