import { useProfileSocialSettings } from '../use-profile-social-settings';
import { ProfileMutualFollowers } from './profile-mutual-followers';
import { ProfileSuggestedFollows } from './profile-suggested-follows';
import { ProfileRecentFollows } from './profile-recent-follows';

// ----------------------------------------------------------------------

type ProfileSocialExtrasProps = {
  profileUserId: string;
  isOwnProfile: boolean;
  isLoggedIn: boolean;
  onFollowChange?: () => void;
};

export function ProfileSocialExtras({
  profileUserId,
  isOwnProfile,
  isLoggedIn,
  onFollowChange,
}: ProfileSocialExtrasProps) {
  const { settings } = useProfileSocialSettings();

  if (!settings || !isLoggedIn) return null;

  return (
    <>
      {settings.showMutualFollowers && !isOwnProfile ? (
        <ProfileMutualFollowers
          profileUserId={profileUserId}
          isOwnProfile={isOwnProfile}
          isLoggedIn={isLoggedIn}
        />
      ) : null}

      {settings.showSuggestedFollows ? (
        <ProfileSuggestedFollows
          contextUserId={isOwnProfile ? undefined : profileUserId}
          isLoggedIn={isLoggedIn}
          onFollowChange={onFollowChange}
        />
      ) : null}

      {settings.showRecentFollows && !isOwnProfile ? (
        <ProfileRecentFollows profileUserId={profileUserId} isLoggedIn={isLoggedIn} />
      ) : null}
    </>
  );
}
