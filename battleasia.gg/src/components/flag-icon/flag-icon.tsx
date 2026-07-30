import type { Theme, SxProps } from '@mui/material/styles';

import { forwardRef, useEffect, useMemo, useState } from 'react';
import { mergeClasses } from 'minimal-shared/utils';

import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { flagIconClasses } from './classes';
import { getFlagSources } from './flag-sources';

// ----------------------------------------------------------------------

export type FlagIconProps = React.ComponentProps<'span'> & {
  code?: string;
  sx?: SxProps<Theme>;
};

export const FlagIcon = forwardRef<HTMLSpanElement, FlagIconProps>((props, ref) => {
  const { code, className, sx, ...other } = props;
  const sources = useMemo(() => getFlagSources(code), [code]);
  const [sourceIndex, setSourceIndex] = useState(0);

  useEffect(() => {
    setSourceIndex(0);
  }, [code, sources]);

  if (!code) {
    return null;
  }

  const src = sources[sourceIndex];
  const showFallback = !src || sourceIndex >= sources.length;

  return (
    <FlagRoot
      ref={ref}
      className={mergeClasses([flagIconClasses.root, className])}
      sx={sx}
      {...other}
    >
      {showFallback ? (
        <Typography
          component="span"
          sx={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 0.4,
            color: 'text.secondary',
            lineHeight: 1,
          }}
        >
          {code.toUpperCase()}
        </Typography>
      ) : (
        <FlagImg
          loading="lazy"
          alt={code}
          src={src}
          className={flagIconClasses.img}
          onError={() => setSourceIndex((prev) => prev + 1)}
        />
      )}
    </FlagRoot>
  );
});

// ----------------------------------------------------------------------

const FlagRoot = styled('span')(({ theme }) => ({
  width: 26,
  height: 20,
  flexShrink: 0,
  overflow: 'hidden',
  borderRadius: '2px',
  alignItems: 'center',
  display: 'inline-flex',
  justifyContent: 'center',
  backgroundColor: theme.vars.palette.background.neutral,
}));

const FlagImg = styled('img')(() => ({
  width: '100%',
  height: '100%',
  maxWidth: 'unset',
  objectFit: 'cover',
}));
