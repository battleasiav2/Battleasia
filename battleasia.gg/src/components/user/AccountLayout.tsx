import { NavLink, Outlet } from 'react-router-dom';
import { useI18n } from '../../lib/i18n';

const LINKS = [
  ['/user/account/profile', 'acc.profile', 'Profile'],
  ['/user/account/my-matches', 'acc.matches', 'Matches'],
  ['/user/account/my-orders', 'acc.orders', 'Orders'],
  ['/user/account/my-statistics', 'acc.stats', 'Stats'],
  ['/user/account/my-referrals', 'acc.referrals', 'Referrals'],
  ['/user/account/notifications', 'acc.alerts', 'Alerts'],
  ['/user/account/leader-board', 'acc.board', 'Board'],
  ['/user/account/customer-support', 'acc.support', 'Support'],
] as const;

function Mark({ label }: { label: string }) {
  const d =
    label === 'Profile'
      ? 'M12 8.2a3.1 3.1 0 1 0 0-6.2 3.1 3.1 0 0 0 0 6.2ZM5.4 19.2c.8-3.6 3.2-5.4 6.6-5.4s5.8 1.8 6.6 5.4'
      : label === 'Matches'
        ? 'M8 20h8M12 20V13M7 4.5h10v4.2a5 5 0 0 1-10 0z'
        : label === 'Orders'
          ? 'M4.5 8.2h15A1.5 1.5 0 0 1 21 9.7v8.1a1.8 1.8 0 0 1-1.8 1.8H5.5A2 2 0 0 1 3.5 17.6V8.8A2 2 0 0 1 5.5 6.8h11'
          : label === 'Stats'
            ? 'M4.5 16.5 10 11l3.2 3.2 6.3-6.7M14.5 7.5h5v5'
            : label === 'Referrals'
              ? 'M7 8a2.4 2.4 0 1 0 0-4.8A2.4 2.4 0 0 0 7 8Zm10-1a2.4 2.4 0 1 0 0-4.8A2.4 2.4 0 0 0 17 7Zm-1 10a2.4 2.4 0 1 0 0-4.8A2.4 2.4 0 0 0 16 17ZM9 9.4 15 8.2M8.6 10.2 14.2 15.4'
              : label === 'Alerts'
                ? 'M6.5 10.2a5.5 5.5 0 0 1 11 0c0 4.2 1.2 5.3 1.2 5.3H5.3s1.2-1.1 1.2-5.3ZM10 18.4a2 2 0 0 0 4 0'
                : label === 'Board'
                  ? 'M8 20h8M7 4.5h10v4.2a5 5 0 0 1-10 0z'
                  : 'M5.5 12a6.5 6.5 0 1 1 13 0M5.5 12v3.2A2.2 2.2 0 0 0 7.7 17.4H8.5V12z';
  return (
    <svg viewBox="0 0 24 24" className="account-mark" aria-hidden>
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AccountLayout() {
  const { t } = useI18n();
  return (
    <div className="account-wrap">
      <aside className="account-nav" aria-label={t('nav.account')}>
        {LINKS.map(([to, key, mark]) => (
          <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'active' : '')}>
            <Mark label={mark} />
            {t(key)}
          </NavLink>
        ))}
      </aside>
      <div className="account-body">
        <Outlet />
      </div>
    </div>
  );
}
