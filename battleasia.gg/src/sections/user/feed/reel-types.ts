export type ReelItem = {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  videoUrl: string;
  caption: string;
  musicTitle: string;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  createdAt: string;
};

export const mapApiReel = (raw: any): ReelItem => ({
  id: raw?.id || raw?._id || '',
  userId: raw?.userId || '',
  username: raw?.username || 'Player',
  avatar: raw?.avatar || '',
  videoUrl: raw?.videoUrl || '',
  caption: raw?.caption || '',
  musicTitle: raw?.musicTitle || '',
  totalViews: raw?.totalViews || 0,
  totalLikes: raw?.totalLikes || 0,
  totalComments: raw?.totalComments || 0,
  createdAt: raw?.createdAt || '',
});

export const getReelVideoUrl = (videoUrl: string) => {
  if (!videoUrl) return '';
  if (videoUrl.startsWith('http')) return videoUrl;
  if (videoUrl.startsWith('/assets/')) return videoUrl;
  return videoUrl;
};
