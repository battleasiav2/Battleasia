export type StoryItem = {
  id: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  caption: string;
  totalViews: number;
  expiresAt: string;
  createdAt: string;
  viewed: boolean;
};

export type StoryGroup = {
  userId: string;
  username: string;
  avatar: string;
  stories: StoryItem[];
};

export const STORY_DURATION_MS = 5000;

export const mapApiStoryGroup = (group: any): StoryGroup => ({
  userId: group.userId,
  username: group.username || 'User',
  avatar: group.avatar || '',
  stories: (group.stories || []).map((story: any) => ({
    id: story.id,
    mediaType: story.mediaType === 'video' ? 'video' : 'image',
    mediaUrl: story.mediaUrl || '',
    caption: story.caption || '',
    totalViews: story.totalViews || 0,
    expiresAt: story.expiresAt,
    createdAt: story.createdAt,
    viewed: !!story.viewed,
  })),
});
