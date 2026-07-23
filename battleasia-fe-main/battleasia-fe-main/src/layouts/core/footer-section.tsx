import { Box, Grid, Stack, Divider, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';

import { Logo } from 'src/components/logo';
import { createMenuClickHandler } from '../menu-items-config';
import { useRouter, usePathname } from 'src/routes/hooks';
import { useTranslate } from 'src/locales/use-locales';

const FOOTER_TOP_IMAGE = '/assets/images/about-pubg-black.webp';

const linkSx = {
  color: alpha('#ffffff', 0.65),
  textDecoration: 'none',
  fontSize: 14,
  cursor: 'pointer',
  transition: 'color 0.2s ease',
  '&:hover': { color: '#feab02' },
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
        { labelKey: 'footer.facebook', href: 'https://www.facebook.com/share/14XUaoaUgUL/?mibextid=wwXIfr', scrollTarget: 'facebook' },
        { labelKey: 'footer.tiktok', href: 'https://www.tiktok.com/@battleasia?_r=1&_t=ZN-93nBYQnjiGU', scrollTarget: 'tiktok' },
        { labelKey: 'footer.instagram', href: 'https://www.instagram.com/battleasia', scrollTarget: 'instagram' },
        { labelKey: 'footer.twitter', href: 'https://twitter.com/battleasia', scrollTarget: 'twitter' },
        { labelKey: 'footer.youtube', href: 'https://www.youtube.com/@BattleAsia', scrollTarget: 'youtube' },
        { labelKey: 'footer.discord', href: 'https://discord.com/invite/battleasia', scrollTarget: 'discord' },
        { labelKey: 'footer.telegram', href: 'https://t.me/battleasiaofficial', scrollTarget: 'telegram' },
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
    <Box component="footer" sx={{ bgcolor: '#000000' }}>
      {/* Top image strip */}
      <Box
        sx={{
          position: 'relative',
          width: 1,
          height: { xs: 110, sm: 140, md: 160 },
          overflow: 'hidden',
        }}
      >
        <Box
          component="img"
          src={FOOTER_TOP_IMAGE}
          alt=""
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 40%',
            display: 'block',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(180deg, transparent 0%, ${alpha('#000000', 0.55)} 55%, #000000 100%)`,
          }}
        />
      </Box>

      <Stack
        spacing={{ xs: 3, md: 4 }}
        sx={{
          px: { xs: 2, md: 6 },
          py: { xs: 3.5, md: 5 },
          maxWidth: 1280,
          mx: 'auto',
        }}
      >
        {/* Logo + text — navbar style */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={{ xs: 1.25, sm: 1.5 }}
          sx={{ flexWrap: 'wrap' }}
        >
          <Logo
            sx={{
              width: { xs: 52, sm: 72, md: 84 },
              height: { xs: 52, sm: 72, md: 84 },
              flexShrink: 0,
              '& img': {
                borderRadius: '10%',
                width: 1,
                height: 1,
                objectFit: 'contain',
              },
            }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography
              className="font-tr"
              sx={{
                fontSize: isBengali
                  ? { xs: 18, sm: 22, md: 28 }
                  : { xs: 20, sm: 24, md: 28 },
                color: '#feab02',
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: 0.3,
              }}
            >
              {t('common.brandName')}
            </Typography>
            <Typography
              className="font-tr"
              sx={{
                mt: 0.4,
                fontSize: isBengali
                  ? { xs: 8, sm: 10, md: 12 }
                  : { xs: 10, sm: 12, md: 13 },
                color: alpha('#ffffff', 0.75),
                fontWeight: 500,
                letterSpacing: { xs: 0.6, md: 1 },
                textTransform: 'uppercase',
                lineHeight: 1.2,
              }}
            >
              {t('common.brandTagline')}
            </Typography>
          </Box>
        </Stack>

        {/* Nav links — flat, no cards */}
        <Grid container spacing={{ xs: 2.5, md: 3 }}>
          {navSections.map((section) => (
            <Grid item xs={12} sm={6} md={3} key={section.titleKey}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 800,
                  mb: 1.25,
                  letterSpacing: 0.6,
                  color: '#ffffff',
                  textTransform: 'uppercase',
                  fontSize: { xs: 12, sm: 13 },
                }}
              >
                {t(section.titleKey)}
              </Typography>
              <Stack spacing={0.85}>
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
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ borderColor: alpha('#ffffff', 0.1) }} />

        <Typography
          variant="body2"
          sx={{ color: alpha('#ffffff', 0.45), textAlign: { xs: 'center', md: 'left' } }}
        >
          {t('footer.copyright', { year: new Date().getFullYear() })}
        </Typography>
      </Stack>
    </Box>
  );
}

export default FooterSection;
