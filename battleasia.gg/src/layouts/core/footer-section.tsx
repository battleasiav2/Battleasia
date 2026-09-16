import { Box, Container, Typography } from '@mui/material';

import { RouterLink } from 'src/routes/components';
import { Iconify } from 'src/components/iconify';
import { useRouter, usePathname } from 'src/routes/hooks';
import { useTranslate } from 'src/locales/use-locales';
import { LANDING_V2 } from 'src/sections/home/landing-v2-theme';

import { createMenuClickHandler } from '../menu-items-config';

// ----------------------------------------------------------------------

const GOLD_24 = 'rgba(var(--ba-gold-rgb, 203, 251, 36), 0.24)';

const FOOTER_PARTNERS = [
  { label: 'battleasia.com', href: 'https://battleasia.com' },
  { label: 'baccoin.shop', href: 'https://baccoin.shop' },
  { label: 'battleasia.net', href: 'https://battleasia.net' },
  { label: 'pubg.com', href: 'https://www.pubg.com' },
  { label: 'bkash', href: 'https://www.bkash.com' },
  { label: 'nagad', href: 'https://nagadwallet.net' },
] as const;

const SOCIAL_LINKS = [
  { labelKey: 'footer.facebook', icon: 'mingcute:facebook-fill', href: 'https://www.facebook.com/share/14XUaoaUgUL/?mibextid=wwXIfr' },
  { labelKey: 'footer.discord', icon: 'mingcute:discord-fill', href: 'https://discord.gg/battleasia' },
  { labelKey: 'footer.tiktok', icon: 'mingcute:tiktok-fill', href: 'https://www.tiktok.com/@battleasia?_r=1&_t=ZN-93nBYQnjiGU' },
  { labelKey: 'footer.instagram', icon: 'mingcute:instagram-fill', href: 'https://www.instagram.com/battleasia' },
  { labelKey: 'footer.youtube', icon: 'mingcute:youtube-fill', href: 'https://www.youtube.com/@BattleAsia' },
  { labelKey: 'footer.telegram', icon: 'mingcute:telegram-fill', href: 'https://t.me/battleasiaofficial' },
] as const;

const PAY_CHIPS = [
  { labelKey: 'footer.bkash', src: LANDING_V2.assets.pay.bkash },
  { labelKey: 'footer.nagad', src: LANDING_V2.assets.pay.nagad },
  { labelKey: 'footer.crypto', src: LANDING_V2.assets.pay.crypto },
] as const;

const footerLabelSx = {
  display: 'block',
  fontFamily: LANDING_V2.sans,
  fontSize: '0.64rem',
  letterSpacing: '0.2em',
  textTransform: 'uppercase' as const,
  color: LANDING_V2.faint,
  fontWeight: 700,
  mb: '14px',
  lineHeight: 1.3,
};

const footerLinkSx = {
  fontFamily: LANDING_V2.sans,
  fontSize: '0.84rem',
  fontWeight: 500,
  color: LANDING_V2.muted,
  textDecoration: 'none',
  cursor: 'pointer',
  minHeight: 44,
  display: 'inline-flex',
  alignItems: 'center',
  transition: `color 0.3s ${LANDING_V2.ease}`,
  '&:hover': { color: LANDING_V2.gold },
};

function BrandWord({ name }: { name: string }) {
  const match = name.match(/^(.*?)(\s*2\.0\s*)$/i);
  if (!match) return <>{name}</>;
  return (
    <>
      {match[1].trim()}{' '}
      <Box component="span" sx={{ color: LANDING_V2.gold }}>
        2.0
      </Box>
    </>
  );
}

export function FooterSection() {
  const { t } = useTranslate();
  const pathname = usePathname();
  const router = useRouter();
  const handleMenuClick = createMenuClickHandler(pathname, router);

  return (
    <Box
      component="footer"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        isolation: 'isolate',
        mt: 5,
        bgcolor: LANDING_V2.ink,
        color: LANDING_V2.text,
        '@keyframes footerLiveDot': {
          '0%': { boxShadow: `0 0 0 0 ${GOLD_24}` },
          '70%': { boxShadow: '0 0 0 8px rgba(0,0,0,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(0,0,0,0)' },
        },
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: -2,
        }}
      >
        <Box
          component="img"
          src={LANDING_V2.assets.footerBg}
          alt=""
          width={1920}
          height={1080}
          loading="lazy"
          decoding="async"
          sx={{
            width: 1,
            height: 1,
            objectFit: 'cover',
            opacity: 0.72,
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(to bottom, rgba(6,6,7,0.55) 0%, rgba(6,6,7,0.62) 28%, rgba(6,6,7,0.78) 100%)`,
          }}
        />
      </Box>

      <Box
        aria-hidden
        sx={{
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${GOLD_24}, transparent)`,
          position: 'relative',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            top: 0,
            transform: 'translate(-50%, -50%)',
            bgcolor: LANDING_V2.ink,
            color: LANDING_V2.gold,
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: `1px solid ${GOLD_24}`,
            display: 'grid',
            placeItems: 'center',
            fontSize: '0.85rem',
            lineHeight: 1,
          }}
        >
          ⌄
        </Box>
      </Box>

      <Container
        maxWidth={false}
        sx={{
          position: 'relative',
          zIndex: 1,
          maxWidth: LANDING_V2.wrap,
          px: { xs: 2.25, sm: 3 },
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr auto 1fr' },
            gap: { xs: 4.5, md: 4.5 },
            alignItems: 'start',
            py: { xs: 6.5, md: 'clamp(52px, 7vw, 92px)' },
            textAlign: { xs: 'center', md: 'initial' },
          }}
        >
          <Box
            sx={{
              order: { xs: 3, md: 1 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: { xs: 'center', md: 'flex-start' },
              minWidth: 0,
            }}
          >
            <Typography component="span" sx={footerLabelSx}>
              Follow the arena
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexWrap: { xs: 'wrap', md: 'nowrap' },
                gap: 1.25,
                justifyContent: { xs: 'center', md: 'flex-start' },
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
                    width: 46,
                    height: 46,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    color: LANDING_V2.text,
                    bgcolor: 'rgba(255,255,255,0.10)',
                    border: '1px solid transparent',
                    textDecoration: 'none',
                    transition: `background-color 0.3s ${LANDING_V2.ease}, color 0.3s ${LANDING_V2.ease}, transform 0.3s ${LANDING_V2.ease}`,
                    '&:hover': {
                      bgcolor: LANDING_V2.gold,
                      color: LANDING_V2.goldInk,
                      transform: 'translateY(-3px)',
                    },
                  }}
                >
                  <Iconify icon={item.icon} width={18} />
                </Box>
              ))}
            </Box>
          </Box>

          <Box
            sx={{
              order: { xs: 1, md: 2 },
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.75,
              maxWidth: { md: 520 },
              px: { md: 1 },
            }}
          >
            <Box
              component="img"
              src={LANDING_V2.assets.logo}
              alt={t('common.brandName')}
              width={72}
              height={72}
              loading="lazy"
              decoding="async"
              sx={{
                width: 72,
                height: 72,
                objectFit: 'contain',
                filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.6))',
              }}
            />
            <Typography
              sx={{
                fontFamily: LANDING_V2.display,
                fontWeight: 700,
                fontSize: '1.55rem',
                letterSpacing: '0.03em',
                mt: 0.5,
                lineHeight: 1.1,
                textTransform: 'uppercase',
                color: LANDING_V2.text,
              }}
            >
              <BrandWord name={t('common.brandName')} />
            </Typography>
            <Typography
              sx={{
                fontFamily: LANDING_V2.sans,
                fontSize: '0.64rem',
                letterSpacing: '0.24em',
                color: LANDING_V2.muted,
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              {t('common.brandTagline')}
            </Typography>
            <Box
              component="nav"
              aria-label="Footer"
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                columnGap: 2.25,
                rowGap: 0.75,
                mt: 2,
              }}
            >
              <Typography component={RouterLink} href="/privacy-policy" sx={footerLinkSx}>
                {t('footer.privacyPolicy')}
              </Typography>
              <Typography component={RouterLink} href="/terms-and-conditions" sx={footerLinkSx}>
                {t('footer.termsAndConditions')}
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
                sx={footerLinkSx}
              >
                {t('footer.rules')}
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
                sx={footerLinkSx}
              >
                {t('footer.howToPlay')}
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
                sx={footerLinkSx}
              >
                {t('footer.aboutUs')}
              </Typography>
            </Box>
            <Typography
              sx={{
                fontFamily: LANDING_V2.sans,
                fontSize: '0.74rem',
                color: LANDING_V2.faint,
                mt: 1.25,
              }}
            >
              {t('footer.copyright', { year: new Date().getFullYear() })}
            </Typography>
          </Box>

          <Box
            sx={{
              order: { xs: 2, md: 3 },
              textAlign: { xs: 'center', md: 'right' },
              display: 'flex',
              flexDirection: 'column',
              alignItems: { xs: 'center', md: 'flex-end' },
              gap: 1.5,
            }}
          >
            <Typography component="span" sx={{ ...footerLabelSx, mb: 0 }}>
              User support
            </Typography>
            <Typography
              component="a"
              href="mailto:support@battleasia.gg"
              sx={{
                fontFamily: LANDING_V2.display,
                fontWeight: 500,
                fontSize: '1.12rem',
                color: LANDING_V2.text,
                textDecoration: 'none',
                lineHeight: 1.3,
                transition: `color 0.3s ${LANDING_V2.ease}`,
                '&:hover': { color: LANDING_V2.gold },
              }}
            >
              support@battleasia.gg
            </Typography>
            <Box
              component={RouterLink}
              href="/support"
              sx={{
                bgcolor: 'rgba(255,255,255,0.05)',
                border: `1px solid ${GOLD_24}`,
                color: LANDING_V2.gold,
                px: 2.25,
                py: 1.75,
                borderRadius: LANDING_V2.radiusSm,
                fontFamily: LANDING_V2.sans,
                fontWeight: 700,
                fontSize: '0.74rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1.125,
                minHeight: 44,
                transition: `background-color 0.3s ${LANDING_V2.ease}, color 0.3s ${LANDING_V2.ease}`,
                '&:hover': {
                  bgcolor: LANDING_V2.gold,
                  color: LANDING_V2.goldInk,
                },
              }}
            >
              <Box
                aria-hidden
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  bgcolor: 'currentColor',
                  flexShrink: 0,
                  boxShadow: `0 0 0 0 ${GOLD_24}`,
                  animation: 'footerLiveDot 1.8s cubic-bezier(0.22, 0.61, 0.36, 1) infinite',
                }}
              />
              Live support relay
            </Box>
          </Box>
        </Box>
      </Container>

      <Box
        sx={{
          borderTop: `1px solid ${LANDING_V2.hair}`,
          bgcolor: 'rgba(6,6,7,0.55)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
      >
        <Container
          maxWidth={false}
          sx={{
            maxWidth: LANDING_V2.wrap,
            px: { xs: 2.25, sm: 3 },
            display: 'flex',
            justifyContent: 'space-between',
            gap: 3.5,
            flexWrap: 'wrap',
            py: 2.75,
            textAlign: { xs: 'center', md: 'initial' },
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'center', md: 'flex-start' },
          }}
        >
          <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            <Typography component="span" sx={{ ...footerLabelSx, mb: '10px' }}>
              {t('footer.payments')}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                flexWrap: 'wrap',
                justifyContent: { xs: 'center', md: 'flex-start' },
              }}
            >
              {PAY_CHIPS.map((chip) => (
                <Box
                  key={chip.labelKey}
                  component="span"
                  sx={{
                    fontFamily: LANDING_V2.sans,
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    color: LANDING_V2.text,
                    border: `1px solid ${LANDING_V2.hair2}`,
                    borderRadius: '8px',
                    px: 1.5,
                    py: 1,
                    bgcolor: 'rgba(255,255,255,0.04)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    minHeight: 40,
                  }}
                >
                  <Box
                    component="img"
                    src={chip.src}
                    alt=""
                    width={18}
                    height={18}
                    loading="lazy"
                    decoding="async"
                    sx={{ width: 18, height: 18, objectFit: 'contain' }}
                  />
                  {t(chip.labelKey)}
                </Box>
              ))}
            </Box>
          </Box>

          <Box sx={{ textAlign: { xs: 'center', md: 'right' } }}>
            <Typography component="span" sx={{ ...footerLabelSx, mb: '10px' }}>
              Trusted partners
            </Typography>
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                flexWrap: 'wrap',
                justifyContent: { xs: 'center', md: 'flex-end' },
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
                    fontFamily: LANDING_V2.sans,
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: LANDING_V2.muted,
                    border: `1px solid ${LANDING_V2.hair}`,
                    borderRadius: 999,
                    px: 1.625,
                    py: 1,
                    minHeight: 36,
                    display: 'inline-flex',
                    alignItems: 'center',
                    textDecoration: 'none',
                    transition: `color 0.3s ${LANDING_V2.ease}, border-color 0.3s ${LANDING_V2.ease}`,
                    '&:hover': {
                      color: LANDING_V2.text,
                      borderColor: LANDING_V2.hair2,
                    },
                  }}
                >
                  {partner.label}
                </Box>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default FooterSection;
