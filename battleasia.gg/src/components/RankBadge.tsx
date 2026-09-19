import { useI18n } from '../lib/i18n';
import { type TierId } from '../lib/tier';

export function RankBadge({ tier }: { tier: TierId }) {
  const { t } = useI18n();
  return (
    <span className={`rank-badge is-${tier}`} title={t(`rank.${tier}`)}>
      {t(`rank.${tier}`)}
    </span>
  );
}
