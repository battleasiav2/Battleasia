import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { api, explainError, unwrapData, unwrapList } from '../lib/api';
import { can } from '../lib/auth';
import { useI18n } from '../lib/i18n';

type Ctx = { toast: (m: string, kind?: 'ok' | 'err') => void };

type Perm = { key: string; label: string; category: string };
type Parent = { id: string; name: string };

export function RoleFormPage() {
  const { t } = useI18n();
  const { toast } = useOutletContext<Ctx>();
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('player');
  const [parent, setParent] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [catalog, setCatalog] = useState<Perm[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const groups = useMemo(() => {
    const map = new Map<string, Perm[]>();
    for (const row of catalog) {
      const list = map.get(row.category) || [];
      list.push(row);
      map.set(row.category, list);
    }
    return [...map.entries()];
  }, [catalog]);

  useEffect(() => {
    let live = true;
    setLoading(true);
    Promise.all([
      api('/api/v3/users/permissions'),
      api(`/api/v3/users/roles/available-parents${id ? `?exclude=${id}` : ''}`),
      id ? api(`/api/v3/users/roles/${id}`) : Promise.resolve(null),
    ])
      .then(([permPayload, parentPayload, rolePayload]) => {
        if (!live) return;
        setCatalog(unwrapList<Perm>(permPayload));
        setParents(unwrapList<Parent>(parentPayload));
        if (rolePayload) {
          const role = unwrapData<{
            name?: string;
            description?: string;
            type?: string;
            permissions?: string[];
            parent?: { id?: string } | null;
          }>(rolePayload);
          setName(role.name || '');
          setDescription(role.description || '');
          setType(role.type || 'player');
          setPermissions(role.permissions || []);
          setParent(role.parent?.id || '');
        }
      })
      .catch((err) => {
        if (!live) return;
        setError(explainError(err, t('roles.loadFail')));
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [id, t]);

  if (!can('users.view')) return <Navigate to="/403" replace />;

  function toggle(key: string) {
    setPermissions((cur) => (cur.includes(key) ? cur.filter((item) => item !== key) : [...cur, key]));
  }

  async function save() {
    if (!can('users.edit')) {
      toast(t('roles.noEdit'), 'err');
      return;
    }
    if (!name.trim()) {
      toast(t('roles.needName'), 'err');
      return;
    }
    setBusy(true);
    setError('');
    const body = {
      name: name.trim(),
      description: description.trim(),
      type,
      parent: parent || null,
      permissions,
    };
    try {
      if (editing) {
        await api(`/api/v3/users/roles/${id}`, { method: 'PUT', body: JSON.stringify(body) });
      } else {
        await api('/api/v3/users/roles', { method: 'POST', body: JSON.stringify(body) });
      }
      toast(t('roles.saved'), 'ok');
      navigate('/users/role');
    } catch (err) {
      const msg = explainError(err, t('roles.saveFail'));
      setError(msg);
      toast(msg, 'err');
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!id || !can('users.edit')) return;
    if (!window.confirm(t('roles.confirmDelete'))) return;
    setBusy(true);
    try {
      await api(`/api/v3/users/roles/${id}`, { method: 'DELETE' });
      toast(t('roles.deleted'), 'ok');
      navigate('/users/role');
    } catch (err) {
      toast(explainError(err, t('roles.saveFail')), 'err');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-body">
      <header className="dash-head">
        <p className="dash-eyebrow">{t('nav.roles')}</p>
        <h1>{editing ? t('roles.edit') : t('roles.new')}</h1>
        <p className="admin-lead">
          <Link to="/users/role">{t('roles.back')}</Link>
        </p>
      </header>
      {error ? <p className="form-error">{error}</p> : null}
      {loading ? (
        <p className="admin-lead">{t('list.loading')}…</p>
      ) : (
        <form
          className="admin-form"
          style={{ maxWidth: 820 }}
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
        >
          <label className="field">
            {t('roles.name')}
            <input value={name} onChange={(e) => setName(e.target.value)} disabled={busy} />
          </label>
          <label className="field">
            {t('roles.description')}
            <input value={description} onChange={(e) => setDescription(e.target.value)} disabled={busy} />
          </label>
          <label className="field">
            {t('roles.type')}
            <select value={type} onChange={(e) => setType(e.target.value)} disabled={busy}>
              {['player', 'agent', 'official', 'admin'].map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            {t('roles.parent')}
            <select value={parent} onChange={(e) => setParent(e.target.value)} disabled={busy}>
              <option value="">{t('roles.noParent')}</option>
              {parents.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.name}
                </option>
              ))}
            </select>
          </label>
          <div className="role-perm-grid">
            {groups.map(([category, rows]) => (
              <fieldset key={category} className="role-perm-group">
                <legend>{category}</legend>
                {rows.map((row) => (
                  <label key={row.key}>
                    <input
                      type="checkbox"
                      checked={permissions.includes(row.key)}
                      disabled={busy || !can('users.edit')}
                      onChange={() => toggle(row.key)}
                    />
                    {row.label}
                  </label>
                ))}
              </fieldset>
            ))}
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" type="submit" disabled={busy || !can('users.edit')}>
              {busy ? t('settings.saving') : t('settings.save')}
            </button>
            {editing && type !== 'admin' && can('users.edit') ? (
              <button className="btn btn-ghost" type="button" disabled={busy} onClick={() => void remove()}>
                {t('roles.delete')}
              </button>
            ) : null}
          </div>
        </form>
      )}
    </main>
  );
}
