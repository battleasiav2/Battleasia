import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

type PlayTabsProps = {
  tabs: Array<{ label: string; value: string }>;
  defaultTab?: string;
  onChange?: (tab: string) => void;
};

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
      spacing={0}
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        mb: 3,
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
              px: 3,
              py: 2,
              cursor: 'pointer',
              position: 'relative',
              bgcolor: isActive ? 'background.paper' : 'transparent',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                color: isActive ? 'common.black' : 'text.secondary',
                fontWeight: isActive ? 800 : 400,
              }}
            >
              {tab.label}
            </Typography>
            {isActive && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  bgcolor: 'primary.main',
                }}
              />
            )}
          </Box>
        );
      })}
    </Stack>
  );
}

