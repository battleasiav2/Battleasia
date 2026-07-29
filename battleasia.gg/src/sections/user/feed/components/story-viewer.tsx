import { useRef, useState, useEffect, useCallback } from 'react';

import { alpha } from '@mui/material/styles';
import {
  Box,
  Stack,
  Dialog,
  Avatar,
  IconButton,
  Typography,
  LinearProgress,
} from '@mui/material';

import { fDateTime } from 'src/utils/format-time';
import { getImageUrl } from 'src/utils/get-image-url';
import { USER_COLORS } from 'src/layouts/user';
import { Iconify } from 'src/components/iconify';

import type { StoryGroup } from './story-types';
import { STORY_DURATION_MS } from './story-types';

// ----------------------------------------------------------------------

type StoryViewerProps = {
  open: boolean;
  groups: StoryGroup[];
  initialGroupIndex: number;
  initialStoryIndex?: number;
  onClose: () => void;
  onViewStory: (storyId: string) => Promise<void> | void;
};

export function StoryViewer({
  open,
  groups,
  initialGroupIndex,
  initialStoryIndex = 0,
  onClose,
  onViewStory,
}: StoryViewerProps) {
  const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
  const [storyIndex, setStoryIndex] = useState(initialStoryIndex);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const viewedRef = useRef<Set<string>>(new Set());
  const videoRef = useRef<HTMLVideoElement>(null);

  const group = groups[groupIndex];
  const story = group?.stories[storyIndex];

  useEffect(() => {
    if (!open) return;
    setGroupIndex(initialGroupIndex);
    setStoryIndex(initialStoryIndex);
    setProgress(0);
    setPaused(false);
    viewedRef.current = new Set();
  }, [open, initialGroupIndex, initialStoryIndex]);

  const goNext = useCallback(() => {
    if (!group) return;

    if (storyIndex < group.stories.length - 1) {
      setStoryIndex((prev) => prev + 1);
      setProgress(0);
      return;
    }

    if (groupIndex < groups.length - 1) {
      setGroupIndex((prev) => prev + 1);
      setStoryIndex(0);
      setProgress(0);
      return;
    }

    onClose();
  }, [group, storyIndex, groupIndex, groups.length, onClose]);

  const goPrev = useCallback(() => {
    if (storyIndex > 0) {
      setStoryIndex((prev) => prev - 1);
      setProgress(0);
      return;
    }

    if (groupIndex > 0) {
      const prevGroup = groups[groupIndex - 1];
      setGroupIndex((prev) => prev - 1);
      setStoryIndex(Math.max(0, prevGroup.stories.length - 1));
      setProgress(0);
    }
  }, [storyIndex, groupIndex, groups]);

  useEffect(() => {
    if (!open || !story) return undefined;

    if (!viewedRef.current.has(story.id)) {
      viewedRef.current.add(story.id);
      void onViewStory(story.id);
    }

    if (story.mediaType === 'video') {
      setProgress(0);
      return undefined;
    }

    if (paused) return undefined;

    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const nextProgress = Math.min(100, (elapsed / STORY_DURATION_MS) * 100);
      setProgress(nextProgress);
      if (nextProgress >= 100) {
        window.clearInterval(timer);
        goNext();
      }
    }, 50);

    return () => window.clearInterval(timer);
  }, [open, story, paused, goNext, onViewStory]);

  useEffect(() => {
    if (!open || story?.mediaType !== 'video') return;
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;
    if (!paused) {
      void video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  }, [open, story?.id, story?.mediaType, paused]);

  if (!open || !group || !story) {
    return null;
  }

  const mediaUrl = getImageUrl(story.mediaUrl);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      PaperProps={{
        sx: {
          bgcolor: '#000000',
          backgroundImage: 'none',
        },
      }}
    >
      <Box sx={{ position: 'relative', width: 1, height: 1, overflow: 'hidden' }}>
        <Stack
          direction="row"
          spacing={0.5}
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            right: 12,
            zIndex: 3,
          }}
        >
          {group.stories.map((item, index) => (
            <Box key={item.id} sx={{ flex: 1, height: 3, bgcolor: alpha('#ffffff', 0.25), borderRadius: 1, overflow: 'hidden' }}>
              <LinearProgress
                variant="determinate"
                value={index < storyIndex ? 100 : index === storyIndex ? progress : 0}
                sx={{
                  height: 3,
                  bgcolor: 'transparent',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: USER_COLORS.gold,
                    boxShadow: `0 0 8px ${alpha(USER_COLORS.gold, 0.6)}`,
                  },
                }}
              />
            </Box>
          ))}
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          spacing={1.25}
          sx={{
            position: 'absolute',
            top: 28,
            left: 16,
            right: 16,
            zIndex: 3,
          }}
        >
          <Avatar
            src={getImageUrl(group.avatar)}
            alt={group.username}
            sx={{ width: 36, height: 36, border: `1px solid ${alpha(USER_COLORS.gold, 0.45)}` }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>{group.username}</Typography>
            <Typography sx={{ fontSize: 11, color: alpha('#ffffff', 0.65) }}>
              {fDateTime(story.createdAt)}
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: '#ffffff' }}>
            <Iconify icon="eva:close-fill" width={24} />
          </IconButton>
        </Stack>

        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#000000',
          }}
        >
          {story.mediaType === 'video' && mediaUrl ? (
            <Box
              component="video"
              ref={videoRef}
              src={mediaUrl}
              playsInline
              muted={false}
              onEnded={goNext}
              onTimeUpdate={(e) => {
                const video = e.currentTarget;
                if (video.duration > 0) {
                  setProgress((video.currentTime / video.duration) * 100);
                }
              }}
              onMouseDown={() => setPaused(true)}
              onMouseUp={() => setPaused(false)}
              onTouchStart={() => setPaused(true)}
              onTouchEnd={() => setPaused(false)}
              sx={{
                maxWidth: '100%',
                maxHeight: '100%',
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          ) : mediaUrl ? (
            <Box
              component="img"
              src={mediaUrl}
              alt={group.username}
              sx={{
                maxWidth: '100%',
                maxHeight: '100%',
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          ) : null}
        </Box>

        <Box
          onClick={goPrev}
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: '35%',
            zIndex: 2,
            cursor: 'pointer',
          }}
        />
        <Box
          onClick={goNext}
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            width: '35%',
            zIndex: 2,
            cursor: 'pointer',
          }}
        />

        {story.caption ? (
          <Box
            sx={{
              position: 'absolute',
              left: 16,
              right: 16,
              bottom: 24,
              zIndex: 3,
              p: 1.5,
              bgcolor: alpha('#000000', 0.45),
              border: `1px solid ${alpha('#ffffff', 0.12)}`,
            }}
          >
            <Typography sx={{ fontSize: 14, color: '#ffffff', lineHeight: 1.5 }}>{story.caption}</Typography>
          </Box>
        ) : null}
      </Box>
    </Dialog>
  );
}
