import type { IconProps } from '@iconify/react/offline';

import { forwardRef } from 'react';
import { Icon } from '@iconify/react/offline';
import { mergeClasses } from 'minimal-shared/utils';

import { styled } from '@mui/material/styles';

import { resolveIconName } from './icon-aliases';
import { iconifyClasses } from './classes';
import './iconify-offline';

// ----------------------------------------------------------------------

export type IconifyProps = React.ComponentProps<typeof IconRoot> & IconProps;

export const Iconify = forwardRef<SVGSVGElement, IconifyProps>((props, ref) => {
  const { className, width = 20, sx, icon, ...other } = props;
  const resolvedIcon = typeof icon === 'string' ? resolveIconName(icon) : icon;

  return (
    <IconRoot
      ssr
      ref={ref}
      icon={resolvedIcon}
      className={mergeClasses([iconifyClasses.root, className])}
      sx={[
        {
          width,
          height: width,
          flexShrink: 0,
          display: 'inline-flex',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    />
  );
});

// ----------------------------------------------------------------------

const IconRoot = styled(Icon)``;
