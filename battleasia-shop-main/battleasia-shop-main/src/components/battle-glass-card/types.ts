export type GlassCardVariant = 'midnight-grid' | 'cyber-edge' | 'gold-frame' | 'frost-panel' | 'black-shimmer';

export type GlassCardTokens = {
  id: GlassCardVariant;
  label: string;
  description: string;
  shell: {
    bgcolor: string;
    border: string;
    boxShadow: string;
    backdropFilter: string;
    overlay?: string;
    shimmer?: boolean;
  };
  badge: {
    bgcolor: string;
    color: string;
    border: string;
    boxShadow?: string;
  };
  titleColor: string;
  subtitleColor: string;
  stat: {
    bgcolor: string;
    border: string;
    boxShadow: string;
    overlay?: string;
    labelColor: string;
    valueColor: string;
    suffixColor: string;
    shimmer?: boolean;
  };
};
