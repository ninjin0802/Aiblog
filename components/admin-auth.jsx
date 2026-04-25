import React from 'react';
import AdminPage from './admin.jsx';

function AdminAuthGate({ palette: P, onBack, onOpenPost, onPostsChange, onMetaChange }) {
  const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
  const [authed, setAuthed] = React.useState(() => !!localStorage.getItem('blog:jwt'));
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const logout = () => {
    localStorage.removeItem('blog:jwt');
    setAuthed(false);
  };

  const login = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(`// error: ${data.error}`);
      } else {
        localStorage.setItem('blog:jwt', data.token);
        setAuthed(true);
      }
    } catch {
      setError('// error: network error');
    } finally {
      setLoading(false);
    }
  };

  if (authed) {
    return (
      <AdminPage
        palette={P}
        onBack={onBack}
        onOpenPost={onOpenPost}
        onPostsChange={onPostsChange}
        onMetaChange={onMetaChange}
        authControls={{ logout }}
      />
    );
  }

  return (
    <div style={{
      background: P.bg, color: P.text,
      fontFamily: mono, minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <button
          onClick={onBack}
          style={{
            background: 'transparent', border: 'none',
            color: P.dim, fontFamily: mono, fontSize: 12,
            padding: 0, cursor: 'pointer', marginBottom: 24,
          }}
        >← cd ..</button>

        <div style={{
          border: `1px solid ${P.border || P.rule}`,
          background: P.bgAlt || P.card || 'transparent',
          padding: '32px 36px',
        }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 10, color: P.faint, letterSpacing: 2 }}>/ ADMIN CONSOLE</div>
            <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.3, marginTop: 4 }}>
              <span style={{ color: P.accent || P.coral || '#ff5a5f' }}>⚿</span> $ authenticate
            </div>
            <div style={{ fontSize: 12, color: P.dim, marginTop: 4 }}>
              /admin · パスワードで認証
            </div>
          </div>

          {error && (
            <div style={{
              color: '#ff6b6b', fontSize: 12, marginBottom: 16,
              padding: '8px 12px',
              background: '#ff6b6b15',
              border: '1px solid #ff6b6b44',
            }}>{error}</div>
          )}

          <form onSubmit={login} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              autoFocus
              style={{
                background: P.bg || 'transparent',
                border: `1px solid ${P.border || P.rule}`,
                color: P.text, fontFamily: mono, fontSize: 13,
                padding: '10px 14px', outline: 'none',
                letterSpacing: 2,
              }}
            />
            <button
              type="submit"
              disabled={loading || !password}
              style={{
                background: P.accent || P.coral || '#ff5a5f',
                color: P.bg,
                fontFamily: mono, fontSize: 13, fontWeight: 600, letterSpacing: 0.5,
                padding: '11px 16px', cursor: loading ? 'wait' : 'pointer',
                border: 'none', opacity: loading || !password ? 0.6 : 1,
              }}
            >
              {loading ? '...' : '$ LOGIN →'}
            </button>
          </form>
        </div>

        <div style={{
          fontSize: 10, color: P.faint, textAlign: 'center',
          marginTop: 20, letterSpacing: 1,
        }}>
          // password auth · admin access only
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AdminAuthGate });
export default AdminAuthGate;
