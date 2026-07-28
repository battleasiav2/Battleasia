import { Box, Link } from '@mui/material';

import { RouterLink } from 'src/routes/components';

import { authFooterTextSx, authLinkSx } from './auth-form-styles';

// ----------------------------------------------------------------------

type AuthFooterLink = {
  label: string;
  href: string;
};

type AuthFooterLinksProps = {
  prefix?: string;
  links: AuthFooterLink[];
};

export function AuthFooterLinks({ prefix, links }: AuthFooterLinksProps) {
  return (
    <Box sx={authFooterTextSx}>
      {prefix && `${prefix} `}
      {links.map((link, index) => (
        <Box key={link.href} component="span">
          {index > 0 && ' · '}
          <Link component={RouterLink} href={link.href} sx={authLinkSx}>
            {link.label}
          </Link>
        </Box>
      ))}
    </Box>
  );
}
