import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { PasswordField } from '../components/PasswordField';
import { api, isApiError, unwrapList } from '../lib/api';
import { fetchAdminMe, readAdminUser } from '../lib/auth';
import { cell, rowId } from '../lib/format';

type Ctx = { toast: (m: string) => void };

export function ProfilePage() {
  const { toast } = useOutletContext<Ctx>();
  const me = readAdminUser();
  const [sessions, setSessions] = useState<Array<Record<string, unknown>>>([]);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');

  useEffect(() => {
    void fetchAdminMe().catch(() => undefined);
    api('/api/v3/users/sessions?mine=1')
      .then((payload) => setSessions(unwrapList<Record<string, unknown>>(payload)))
      .catch(() => setSessions([]));
  }, []);

  return (
    <main className="admin-body">
      <h1>Profile</h1>
      <p className="admin-lead">{me?.email} · {me?.role?.type || 'staff'}</p>
      <PasswordField id="current" label="Current password" value={current} onChange={setCurrent} autoComplete="current-password" />
      <PasswordField id="next" label="New password" value={next} onChange={setNext} autoComplete="new-password" meter />
      <button
        className="btn btn-primary"
        type="button"
        onClick={async () => {
          try {
            await api('/api/v3/users/auth/profile', {
              method: 'PATCH',
              body: JSON.stringify({ currentPassword: current, newPassword: next }),
            });
            toast('Profile updated');
          } catch (err) {
            toast(isApiError(err) ? err.message : 'Update failed');
          }
        }}
      >
        Save password
      </button>
      <h2>Sessions</h2>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>IP</th>
              <th>Expiry</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((row) => {
              const id = rowId(row);
              return (
                <tr key={id || cell(row.ip)}>
                  <td>{cell(row.ip)}</td>
                  <td>{cell(row.expiration)}</td>
                  <td>
                    <button
                      className="btn btn-ghost"
                      type="button"
                      onClick={async () => {
                        if (!id) return;
                        try {
                          await api(`/api/v3/users/sessions/${id}`, { method: 'DELETE' });
                          setSessions((s) => s.filter((r) => rowId(r) !== id));
                          toast('Revoked');
                        } catch (err) {
                          toast(isApiError(err) ? err.message : 'Revoke failed');
                        }
                      }}
                    >
                      Revoke
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
