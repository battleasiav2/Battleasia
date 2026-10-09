import { useEffect, useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { api, unwrapList, explainError } from '../lib/api';

type Ctx = { toast: (m: string, kind?: 'ok' | 'err') => void };

export function SupportThreadPage() {
  const { toast } = useOutletContext<Ctx>();
  const { conversationId } = useParams();
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  function load() {
    if (!conversationId) return;
    api(`/api/v2/customer-support/conversation/${conversationId}/messages`)
      .then((payload) => setRows(unwrapList<Record<string, unknown>>(payload)))
      .catch((err) => setError(explainError(err, 'Thread offline')));
  }

  useEffect(() => {
    load();
  }, [conversationId]);

  return (
    <main className="admin-body">
      <h1>Support thread</h1>
      {error ? <p className="form-error">{error}</p> : null}
      <div className="admin-table-wrap" style={{ marginBottom: 16 }}>
        {rows.length === 0 ? (
          <div className="admin-empty">No messages</div>
        ) : (
          <table className="admin-table">
            <tbody>
              {rows.map((row, i) => (
                <tr key={String(row._id || i)}>
                  <td>{String(row.senderUsername || row.role || '')}</td>
                  <td>{String(row.message || row.text || '')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <label className="field">
        Reply
        <input value={text} onChange={(e) => setText(e.target.value)} />
      </label>
      <div className="table-tools">
        <button
          className="btn btn-primary"
          type="button"
          onClick={async () => {
            try {
              await api('/api/v2/customer-support/message', {
                method: 'POST',
                body: JSON.stringify({ conversationId, message: text }),
              });
              setText('');
              toast('Sent', 'ok');
              load();
            } catch (err) {
              toast(explainError(err, 'Send failed'), 'err');
            }
          }}
        >
          Reply
        </button>
        <button
          className="btn btn-ghost"
          type="button"
          onClick={async () => {
            if (!window.confirm('Close this conversation?')) return;
            try {
              await api(`/api/v2/customer-support/conversation/${conversationId}/close`, { method: 'PATCH' });
              toast('Closed', 'ok');
            } catch (err) {
              toast(explainError(err, 'Close failed'), 'err');
            }
          }}
        >
          Close
        </button>
      </div>
    </main>
  );
}
