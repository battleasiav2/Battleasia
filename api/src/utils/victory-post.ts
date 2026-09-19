import { Feed } from '../models/Feed.js';
import { FeedCategory } from '../models/FeedCategory.js';
import { User } from '../models/User.js';
import { getAppSettings } from '../models/AppSettings.js';
import { normalizeP1Flags } from './p1-flags.js';

export async function maybeVictoryAutoPost(params: {
  userId: string;
  amount: number;
  matchId: string;
  matchName: string;
  gameTag?: string;
}) {
  try {
    const settings = await getAppSettings();
    const flags = normalizeP1Flags(settings.p1);
    if (!flags.igVictoryAutoPost || params.amount <= 0) return;

    const exists = await Feed.findOne({
      authorId: params.userId,
      entityId: params.matchId,
      postType: 'match_result',
    }).select('_id');
    if (exists) return;

    const user = await User.findById(params.userId).select('username avatar');
    if (!user) return;

    let category = await FeedCategory.findOne({ slug: 'community' });
    if (!category) {
      category = await FeedCategory.create({ name: 'Community', slug: 'community' });
    }

    await Feed.create({
      categoryId: category._id,
      title: `Won ${params.amount} BAC`,
      description: `Won ${params.amount} BAC 🏆 from “${params.matchName}”. #victory`,
      postType: 'match_result',
      hashtags: ['victory'],
      visibility: 'public',
      status: 'published',
      authorId: user._id,
      authorName: user.username,
      authorAvatar: user.avatar || '',
      entityId: params.matchId,
      gameTag: (params.gameTag || '').toLowerCase().slice(0, 32),
    });
  } catch (error) {
    console.error('victory auto-post failed:', error);
  }
}
