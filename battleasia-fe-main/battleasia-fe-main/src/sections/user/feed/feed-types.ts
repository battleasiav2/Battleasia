import { orderBy } from 'es-toolkit';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

export type FeedItem = {
  id: string;
  title: string;
  description: string;
  publish: 'published' | 'draft';
  coverUrl: string;
  totalViews: number;
  totalShares: number;
  totalComments: number;
  totalLikes: number;
  isLiked?: boolean;
  createdAt: Date | string;
  author: {
    id: string;
    name: string;
    avatarUrl: string;
    role?: {
      id: string;
      name: string;
    } | null;
  };
};

export type FeedCategory = {
  id: string;
  name: string;
  slug: string;
};

export type FeedSortBy = 'latest' | 'oldest' | 'popular';

// ----------------------------------------------------------------------

export const getFeedCoverUrl = (coverUrl?: string) => {
  if (!coverUrl) return '';
  if (coverUrl.startsWith('http')) return coverUrl;
  if (coverUrl.startsWith('/assets/')) return coverUrl;
  if (CONFIG.serverUrl) return `${CONFIG.serverUrl}${coverUrl}`;
  return coverUrl;
};

export const mapApiFeedToItem = (feed: any): FeedItem => ({
  id: feed.id || feed._id,
  title: feed.title,
  description: feed.description,
  publish: feed.status,
  coverUrl: feed.coverUrl || '',
  totalViews: feed.totalViews || 0,
  totalShares: feed.totalShares || 0,
  totalComments: feed.totalComments || 0,
  totalLikes: feed.totalLikes || 0,
  isLiked: feed.isLiked || false,
  createdAt: feed.createdAt ? new Date(feed.createdAt) : new Date(),
  author: {
    id: feed.author?.id || '',
    name: feed.author?.name || 'Unknown',
    avatarUrl: feed.author?.avatarUrl || '',
    role: feed.author?.role || null,
  },
});

type ApplyFilterProps = {
  inputData: FeedItem[];
  sortBy: FeedSortBy;
};

export function applyFeedFilter({ inputData, sortBy }: ApplyFilterProps) {
  let filtered = [...inputData];

  if (sortBy === 'latest') {
    filtered = orderBy(filtered, ['createdAt'], ['desc']);
  } else if (sortBy === 'oldest') {
    filtered = orderBy(filtered, ['createdAt'], ['asc']);
  } else if (sortBy === 'popular') {
    filtered = orderBy(
      filtered,
      [(feed) => feed.totalViews + feed.totalComments + feed.totalShares],
      ['desc']
    );
  }

  return filtered;
}

export const isOfficialAuthor = (roleName?: string | null) =>
  roleName === 'admin' || roleName === 'official';
