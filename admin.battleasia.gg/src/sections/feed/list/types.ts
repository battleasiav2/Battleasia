export interface IFeedRow {
  id: string;
  title: string;
  description: string;
  coverUrl?: string;
  status: 'published' | 'draft';
  premiumOnly?: boolean;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  categoryId?: string;
  totalViews: number;
  totalShares: number;
  totalComments: number;
  author?: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

