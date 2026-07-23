import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { GLASS_CARD_RADIUS } from 'src/components/battle-glass-card';

// ----------------------------------------------------------------------

type PlayTabsProps = {
  tabs: Array<{ label: string; value: string }>;
  defaultTab?: string;
  onChange?: (tab: string) => void;
};

const GOLD = '#feab02';

export function PlayTabs({
  tabs,
  defaultTab = 'tournament',
  activeTab: controlledActiveTab,
  onChange,
}: PlayTabsProps & { activeTab?: string }) {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultTab);

  const activeTab = controlledActiveTab ?? internalActiveTab;

  const handleTabChange = (value: string) => {
    if (!controlledActiveTab) {
      setInternalActiveTab(value);
    }
    onChange?.(value);
  };

  return (
    <Stack
      direction="row"
      spacing={0.75}
      sx={{
        mb: 3,
        p: 0.75,
        borderRadius: `${GLASS_CARD_RADIUS}px`,
        bgcolor: alpha('#0a0a0a', 0.65),
        border: `1px solid ${alpha('#ffffff', 0.1)}`,
        boxShadow: `inset 0 1px 0 ${alpha('#ffffff', 0.06)}`,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        overflowX: 'auto',
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value;
        return (
          <Box
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            sx={{
              px: { xs: 2, md: 3 },
              py: 1.25,
              cursor: 'pointer',
              position: 'relative',
              borderRadius: `${GLASS_CARD_RADIUS - 2}px`,
              flexShrink: 0,
              bgcolor: isActive ? alpha(GOLD, 0.14) : 'transparent',
              border: isActive ? `1px solid ${alpha(GOLD, 0.35)}` : '1px solid transparent',
              transition: 'background-color 0.25s ease, border-color 0.25s ease',
              '&:hover': {
                bgcolor: isActive ? alpha(GOLD, 0.18) : alpha('#ffffff', 0.05),
              },
            }}
          >
            <Typography
              variant="subtitle2"
              className="font-tr"
              sx={{
                color: isActive ? GOLD : alpha('#ffffff', 0.55),
                fontWeight: isActive ? 800 : 500,
                letterSpacing: 0.6,
                textTransform: 'uppercase',
                fontSize: { xs: 12, md: 13 },
              }}
            >
              {tab.label}
            </Typography>
          </Box>
        );
      })}
    </Stack>
  );
}
