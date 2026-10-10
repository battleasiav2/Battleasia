import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { api, unwrapData, unwrapList, explainError } from '../lib/api';
import { can } from '../lib/auth';
import { cell } from '../lib/format';
import { useI18n } from '../lib/i18n';

type Ctx = { toast: (m: string, kind?: 'ok' | 'err') => void };

type UserRow = {
  id: string;
  username: string;
  email: string;
  status: boolean;
  balance: number;
  avatar: string;
  countryCode: string;
  mobileNo: string;
  pubgId: string;
  gameServer: string;
  referralCode: string;
  role: { id?: string | null; type?: string; name?: string };
  createdAt?: string;
  isPremium?: boolean;
  kycStatus?: string;
};

type RoleOption = { id: string; name: string; type: string };

type Tab = 'profile' | 'balance' | 'history' | 'security' | 'danger';

export function UserEditPage() {
  const { t } = useI18n();
  const { toast } = useOutletContext<Ctx>();
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('profile');
  const [user, setUser] = useState<UserRow | null>(null);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    password: '',
    status: true,
    avatar: '',
    countryCode: '',
    mobileNo: '',
    pubgId: '',
    gameServer: '',
    referralCode: '',
    roleId: '',
  });
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceNote, setBalanceNote] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [balanceRows, setBalanceRows] = useState<Array<Record<string, unknown>>>([]);
  const [loginRows, setLoginRows] = useState<Array<Record<string, unknown>>>([]);
  const [sessionCount, setSessionCount] = useState(0);

  const isAdminUser = user?.role?.type === 'admin';
  const canEdit = can('users.edit');
  const canDelete = can('users.delete');

  const loadUser = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const payload = await api(`/api/v3/users/list/${id}`);
      const row = unwrapData<UserRow>(payload);
      setUser(row);
      setProfile({
        username: row.username || '',
        email: row.email || '',
        password: '',
        status: row.status !== false,
        avatar: row.avatar || '',
        countryCode: row.countryCode || '',
        mobileNo: row.mobileNo || '',
        pubgId: row.pubgId || '',
        gameServer: row.gameServer || '',
        referralCode: row.referralCode || '',
        roleId: row.role?.id || '',
      });
    } catch (err) {
      setError(explainError(err, t('userEdit.loadFail')));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  const loadRoles = useCallback(async () => {
    try {
      const payload = await api('/api/v3/users/roles?limit=100');
      const list = unwrapList<Record<string, unknown>>(payload);
      setRoles(
        list.map((r) => ({
          id: String(r.id || r._id || ''),
          name: String(r.name || ''),
          type: String(r.type || ''),
        })),
      );
    } catch {
      setRoles([]);
    }
  }, []);

  const loadHistories = useCallback(async () => {
    if (!id) return;
    try {
      const [balPayload, logPayload, sessPayload] = await Promise.all([
        api(`/api/v4/payments/balance-histories?userId=${encodeURIComponent(id)}&limit=30`),
        api(`/api/v3/users/histories?userId=${encodeURIComponent(id)}&limit=20`),
        api(`/api/v3/users/sessions?userId=${encodeURIComponent(id)}`),
      ]);
      setBalanceRows(unwrapList(balPayload));
      setLoginRows(unwrapList(logPayload));
      const sess = unwrapData<{ results?: unknown[]; count?: number }>(sessPayload);
      const results = Array.isArray(sess?.results) ? sess.results : unwrapList(sessPayload);
      setSessionCount(Array.isArray(results) ? results.length : Number(sess?.count) || 0);
    } catch {
      setBalanceRows([]);
      setLoginRows([]);
      setSessionCount(0);
    }
  }, [id]);

  useEffect(() => {
    void loadUser();
    void loadRoles();
  }, [loadUser, loadRoles]);

  useEffect(() => {
    if (tab === 'history' || tab === 'security' || tab === 'balance') void loadHistories();
  }, [tab, loadHistories]);

  const tabs = useMemo(
    () =>
      [
        ['profile', t('userEdit.tabProfile')],
        ['balance', t('userEdit.tabBalance')],
        ['history', t('userEdit.tabHistory')],
        ['security', t('userEdit.tabSecurity')],
        ['danger', t('userEdit.tabDanger')],
      ] as const,
    [t],
  );

  if (!can('users.view')) return <Navigate to="/403" replace />;
  if (!id) return <Navigate to="/users/list" replace />;

  async function saveProfile() {
    if (!canEdit) {
      toast(t('premium.noEdit'), 'err');
      return;
    }
    if (!profile.username.trim() || !profile.email.trim()) {
      toast(t('userEdit.needIdentity'), 'err');
      return;
    }
    setBusy(true);
    try {
      const body: Record<string, unknown> = {
        username: profile.username.trim(),
        email: profile.email.trim(),
        status: profile.status,
        avatar: profile.avatar,
        countryCode: profile.countryCode,
        mobileNo: profile.mobileNo,
        pubgId: profile.pubgId,
        gameServer: profile.gameServer,
        referralCode: profile.referralCode,
      };
      if (profile.password.trim()) body.password = profile.password.trim();
      if (profile.roleId) body.role = profile.roleId;
      const payload = await api(`/api/v3/users/list/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      const row = unwrapData<UserRow>(payload);
      setUser(row);
      setProfile((p) => ({ ...p, password: '' }));
      toast(t('userEdit.saved'), 'ok');
    } catch (err) {
      toast(explainError(err, t('settings.fail')), 'err');
    } finally {
      setBusy(false);
    }
  }

  async function adjustBalance(type: 'deposit' | 'withdraw') {
    if (!canEdit) {
      toast(t('premium.noEdit'), 'err');
      return;
    }
    const amount = Number(balanceAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast(t('userEdit.badAmount'), 'err');
      return;
    }
    const confirmKey = type === 'deposit' ? 'userEdit.confirmAdd' : 'userEdit.confirmSub';
    if (!window.confirm(t(confirmKey))) return;
    setBusy(true);
    try {
      const payload = await api(`/api/v3/users/list/${id}/balance`, {
        method: 'PATCH',
        body: JSON.stringify({ amount, type, note: balanceNote.trim() }),
      });
      const row = unwrapData<UserRow>(payload);
      setUser(row);
      setBalanceAmount('');
      setBalanceNote('');
      toast(t('userEdit.balanceOk'), 'ok');
      await loadHistories();
    } catch (err) {
      toast(explainError(err, t('userEdit.balanceFail')), 'err');
    } finally {
      setBusy(false);
    }
  }

  async function toggleStatus(enable: boolean) {
    if (!canEdit) {
      toast(t('premium.noEdit'), 'err');
      return;
    }
    if (!enable && !statusReason.trim()) {
      toast(t('list.needReason'), 'err');
      return;
    }
    const confirmKey = enable ? 'list.confirmEnable' : 'list.confirmDisable';
    if (!window.confirm(t(confirmKey))) return;
    setBusy(true);
    try {
      const payload = await api(`/api/v3/users/list/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: enable, reason: statusReason.trim() }),
      });
      const row = unwrapData<UserRow>(payload);
      setUser(row);
      setProfile((p) => ({ ...p, status: row.status !== false }));
      setStatusReason('');
      toast(t('userEdit.statusOk'), 'ok');
    } catch (err) {
      toast(explainError(err, t('userEdit.statusFail')), 'err');
    } finally {
      setBusy(false);
    }
  }

  async function revokeSessions() {
    if (!canEdit) {
      toast(t('premium.noEdit'), 'err');
      return;
    }
    if (!window.confirm(t('userEdit.confirmLogout'))) return;
    setBusy(true);
    try {
      await api(`/api/v3/users/sessions/user/${id}`, { method: 'DELETE' });
      toast(t('userEdit.logoutOk'), 'ok');
      setSessionCount(0);
    } catch (err) {
      toast(explainError(err, t('userEdit.logoutFail')), 'err');
    } finally {
      setBusy(false);
    }
  }

  async function deleteUser() {
    if (!canDelete && !canEdit) {
      toast(t('userEdit.noDelete'), 'err');
      return;
    }
    if (!window.confirm(t('userEdit.confirmDelete'))) return;
    setBusy(true);
    try {
      await api(`/api/v3/users/list/${id}`, { method: 'DELETE' });
      toast(t('userEdit.deleted'), 'ok');
      navigate('/users/list', { state: { flash: t('userEdit.deleted') } });
    } catch (err) {
      toast(explainError(err, t('userEdit.deleteFail')), 'err');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-body">
      <header className="dash-head">
        <p className="dash-eyebrow">
          <Link to="/users/list">{t('nav.list')}</Link>
        </p>
        <h1>{user ? user.username : t('userEdit.title')}</h1>
        {user ? (
          <p className="admin-lead">
            {user.email} · {t('userEdit.balance')}: {cell(user.balance)} ·{' '}
            {user.status !== false ? t('userEdit.active') : t('userEdit.blocked')}
            {isAdminUser ? ` · ${t('userEdit.adminBadge')}` : ''}
          </p>
        ) : (
          <p className="admin-lead">{t('userEdit.lead')}</p>
        )}
      </header>

      {error ? <p className="form-error">{error}</p> : null}
      {loading ? (
        <p className="admin-lead">{t('list.loading')}…</p>
      ) : !user ? null : (
        <>
          <div className="chip-row" style={{ marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            {tabs.map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={tab === key ? 'btn btn-primary' : 'btn btn-ghost'}
                onClick={() => setTab(key)}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === 'profile' ? (
            <div className="dash-stage form-stage">
              <form
                className="admin-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  void saveProfile();
                }}
              >
                <div className="admin-form-grid">
                  <label className="field">
                    {t('userEdit.username')}
                    <input
                      value={profile.username}
                      onChange={(e) => setProfile((p) => ({ ...p, username: e.target.value }))}
                      disabled={!canEdit}
                    />
                  </label>
                  <label className="field">
                    {t('userEdit.email')}
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                      disabled={!canEdit}
                    />
                  </label>
                  <label className="field">
                    {t('userEdit.newPassword')}
                    <input
                      type="password"
                      autoComplete="new-password"
                      placeholder={t('userEdit.passwordPh')}
                      value={profile.password}
                      onChange={(e) => setProfile((p) => ({ ...p, password: e.target.value }))}
                      disabled={!canEdit}
                    />
                  </label>
                  <label className="field">
                    {t('userEdit.role')}
                    <select
                      value={profile.roleId}
                      onChange={(e) => setProfile((p) => ({ ...p, roleId: e.target.value }))}
                      disabled={!canEdit || isAdminUser}
                    >
                      <option value="">{user.role?.name || '—'}</option>
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.type})
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    PUBG ID
                    <input
                      value={profile.pubgId}
                      onChange={(e) => setProfile((p) => ({ ...p, pubgId: e.target.value }))}
                      disabled={!canEdit}
                    />
                  </label>
                  <label className="field">
                    {t('userEdit.gameServer')}
                    <input
                      value={profile.gameServer}
                      onChange={(e) => setProfile((p) => ({ ...p, gameServer: e.target.value }))}
                      disabled={!canEdit}
                    />
                  </label>
                  <label className="field">
                    {t('userEdit.mobile')}
                    <input
                      value={profile.mobileNo}
                      onChange={(e) => setProfile((p) => ({ ...p, mobileNo: e.target.value }))}
                      disabled={!canEdit}
                    />
                  </label>
                  <label className="field">
                    {t('userEdit.countryCode')}
                    <input
                      value={profile.countryCode}
                      onChange={(e) => setProfile((p) => ({ ...p, countryCode: e.target.value }))}
                      disabled={!canEdit}
                    />
                  </label>
                  <label className="field">
                    {t('userEdit.referral')}
                    <input
                      value={profile.referralCode}
                      onChange={(e) => setProfile((p) => ({ ...p, referralCode: e.target.value }))}
                      disabled={!canEdit}
                    />
                  </label>
                  <label className="field">
                    {t('userEdit.avatar')}
                    <input
                      value={profile.avatar}
                      onChange={(e) => setProfile((p) => ({ ...p, avatar: e.target.value }))}
                      disabled={!canEdit}
                    />
                  </label>
                  <label className="field" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={profile.status}
                      onChange={(e) => setProfile((p) => ({ ...p, status: e.target.checked }))}
                      disabled={!canEdit || isAdminUser}
                    />
                    {t('userEdit.accountEnabled')}
                  </label>
                </div>
                <div className="form-actions">
                  <button className="btn btn-primary" type="submit" disabled={busy || !canEdit}>
                    {busy ? t('settings.saving') : t('settings.save')}
                  </button>
                </div>
              </form>
            </div>
          ) : null}

          {tab === 'balance' ? (
            <div className="dash-stage form-stage">
              <p className="admin-lead">
                {t('userEdit.currentBalance')}: <strong>{cell(user.balance)}</strong>
              </p>
              <div className="admin-form-grid" style={{ maxWidth: 480 }}>
                <label className="field">
                  {t('userEdit.amount')}
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={balanceAmount}
                    onChange={(e) => setBalanceAmount(e.target.value)}
                    disabled={!canEdit}
                  />
                </label>
                <label className="field">
                  {t('userEdit.note')}
                  <input
                    value={balanceNote}
                    onChange={(e) => setBalanceNote(e.target.value)}
                    placeholder={t('userEdit.notePh')}
                    disabled={!canEdit}
                  />
                </label>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={busy || !canEdit}
                  onClick={() => void adjustBalance('deposit')}
                >
                  {t('userEdit.addBalance')}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={busy || !canEdit || isAdminUser}
                  onClick={() => void adjustBalance('withdraw')}
                >
                  {t('userEdit.subBalance')}
                </button>
              </div>
            </div>
          ) : null}

          {tab === 'history' ? (
            <div className="dash-stage">
              <h2>{t('userEdit.balanceHistory')}</h2>
              <div className="table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>{t('userEdit.colType')}</th>
                      <th>{t('userEdit.colAmount')}</th>
                      <th>{t('userEdit.colBefore')}</th>
                      <th>{t('userEdit.colAfter')}</th>
                      <th>{t('userEdit.colNote')}</th>
                      <th>{t('userEdit.colWhen')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {balanceRows.length ? (
                      balanceRows.map((row) => {
                        const detail = (row.detail as Record<string, unknown>) || {};
                        return (
                          <tr key={String(row.id || row._id)}>
                            <td>{cell(row.type)}</td>
                            <td>{cell(row.amount)}</td>
                            <td>{cell(row.balanceBefore)}</td>
                            <td>{cell(row.balanceAfter)}</td>
                            <td>{cell(detail.note || detail.adminName || '—')}</td>
                            <td>{cell(row.createdAt)}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6}>{t('list.empty')}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {tab === 'security' ? (
            <div className="dash-stage form-stage">
              <p className="admin-lead">
                {t('userEdit.sessionsActive')}: {sessionCount}
              </p>
              <button
                type="button"
                className="btn btn-ghost"
                disabled={busy || !canEdit || sessionCount === 0}
                onClick={() => void revokeSessions()}
              >
                {t('userEdit.logoutAll')}
              </button>
              <h2 style={{ marginTop: '1.5rem' }}>{t('nav.history')}</h2>
              <div className="table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>IP</th>
                      <th>{t('userEdit.colWhen')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loginRows.length ? (
                      loginRows.map((row) => (
                        <tr key={String(row.id || row._id)}>
                          <td>{cell(row.ip)}</td>
                          <td>{cell(row.createdAt)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2}>{t('list.empty')}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {tab === 'danger' ? (
            <div className="dash-stage form-stage">
              {!isAdminUser ? (
                <>
                  <label className="field">
                    {t('list.rejectPh')}
                    <input value={statusReason} onChange={(e) => setStatusReason(e.target.value)} disabled={!canEdit} />
                  </label>
                  <div className="form-actions">
                    {user.status !== false ? (
                      <button
                        type="button"
                        className="btn btn-ghost"
                        disabled={busy || !canEdit}
                        onClick={() => void toggleStatus(false)}
                      >
                        {t('userEdit.blockUser')}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-primary"
                        disabled={busy || !canEdit}
                        onClick={() => void toggleStatus(true)}
                      >
                        {t('userEdit.unblockUser')}
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-ghost"
                      style={{ color: 'var(--danger, #f87171)' }}
                      disabled={busy || (!canDelete && !canEdit)}
                      onClick={() => void deleteUser()}
                    >
                      {t('userEdit.deleteUser')}
                    </button>
                  </div>
                </>
              ) : (
                <p className="admin-lead">{t('userEdit.adminProtected')}</p>
              )}
            </div>
          ) : null}
        </>
      )}
    </main>
  );
}
