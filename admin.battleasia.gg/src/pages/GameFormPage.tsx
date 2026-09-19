import { useEffect, useState } from 'react';
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { api, isApiError, unwrapData } from '../lib/api';

type Ctx = { toast: (m: string) => void };

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 24);
}

export function GameFormPage() {
  const { toast } = useOutletContext<Ctx>();
  const { id } = useParams();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [pkgLocked, setPkgLocked] = useState(Boolean(id));
  const [form, setForm] = useState({
    name: '',
    packageName: '',
    idPrefix: '',
    image: '',
    logo: '',
    rules: '',
    status: true,
    comingSoon: false,
    canCreateChallenge: true,
  });

  useEffect(() => {
    if (!id) return;
    api(`/api/v3/games/list/${id}`)
      .then((payload) => {
        const g = unwrapData<Record<string, unknown>>(payload);
        setForm({
          name: String(g.name || ''),
          packageName: String(g.packageName || g.slug || ''),
          idPrefix: String(g.idPrefix || ''),
          image: String(g.image || ''),
          logo: String(g.logo || ''),
          rules: String(g.rules || ''),
          status: g.status !== false,
          comingSoon: Boolean(g.comingSoon),
          canCreateChallenge: g.canCreateChallenge !== false,
        });
      })
      .catch((err) => setError(isApiError(err) ? err.message : 'Game missing'));
  }, [id]);

  return (
    <main className="admin-body">
      <h1>{id ? 'Edit game' : 'New game'}</h1>
      <p className="admin-lead">Package name auto-fills from the title. Override anytime.</p>
      {error ? <p className="form-error">{error}</p> : null}
      <form
        className="money-form"
        style={{ maxWidth: 560 }}
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            if (id) await api(`/api/v3/games/list/${id}`, { method: 'PUT', body: JSON.stringify(form) });
            else await api('/api/v3/games/list', { method: 'POST', body: JSON.stringify(form) });
            toast(id ? 'Game updated' : 'Game created');
            navigate('/games/list');
          } catch (err) {
            toast(isApiError(err) ? err.message : 'Save failed');
          } finally {
            setBusy(false);
          }
        }}
      >
        <label className="field">
          Name
          <input
            value={form.name}
            required
            onChange={(e) => {
              const name = e.target.value;
              const slug = slugify(name);
              setForm((prev) => ({
                ...prev,
                name,
                packageName: pkgLocked ? prev.packageName : `com.battleasia.${slug || 'game'}`,
                idPrefix: pkgLocked ? prev.idPrefix : slug.slice(0, 4).toUpperCase() || 'GAME',
              }));
            }}
          />
        </label>
        <label className="field">
          Package / slug
          <input
            value={form.packageName}
            required
            onChange={(e) => {
              setPkgLocked(true);
              setForm((prev) => ({ ...prev, packageName: e.target.value }));
            }}
          />
        </label>
        <label className="field">
          ID prefix
          <input value={form.idPrefix} required onChange={(e) => setForm((prev) => ({ ...prev, idPrefix: e.target.value }))} />
        </label>
        <label className="field">
          Image URL
          <input value={form.image} onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))} />
        </label>
        <label className="field">
          Logo URL
          <input value={form.logo} onChange={(e) => setForm((prev) => ({ ...prev, logo: e.target.value }))} />
        </label>
        <label className="field">
          Rules
          <input value={form.rules} onChange={(e) => setForm((prev) => ({ ...prev, rules: e.target.value }))} />
        </label>
        <label className="field">
          <input type="checkbox" checked={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.checked }))} /> Active
        </label>
        <label className="field">
          <input type="checkbox" checked={form.comingSoon} onChange={(e) => setForm((prev) => ({ ...prev, comingSoon: e.target.checked }))} /> Coming soon
        </label>
        <label className="field">
          <input
            type="checkbox"
            checked={form.canCreateChallenge}
            onChange={(e) => setForm((prev) => ({ ...prev, canCreateChallenge: e.target.checked }))}
          />{' '}
          Allow user challenge create
        </label>
        <div className="table-tools">
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {busy ? 'Saving…' : 'Save game'}
          </button>
          <Link className="btn btn-ghost" to="/games/list">
            Back
          </Link>
        </div>
      </form>
    </main>
  );
}
