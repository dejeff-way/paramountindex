import { useState, useEffect, useCallback } from 'react';
import Feed from './pages/Feed';
import LeadDetail from './pages/LeadDetail';
import Subscribe from './pages/Subscribe';
import Counties from './pages/Counties';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

/**
 * Simple hash-based router — zero dependencies.
 * Routes:
 *   #/              → Feed (filterable lead grid)
 *   #/leads/:id     → LeadDetail (single bid)
 *   #/subscribe     → Subscribe (email capture)
 *   #/counties      → Counties (coverage map)
 */
function useHashRoute(): [string, string | null] {
  const [hash, setHash] = useState(() => window.location.hash || '#/');

  useEffect(() => {
    const handler = () => setHash(window.location.hash || '#/');
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  // Parse: #/leads/OC-2025-001 → route="/leads/:id", param="OC-2025-001"
  const path = hash.replace(/^#/, '') || '/';
  const segments = path.split('/').filter(Boolean);

  if (segments[0] === 'leads' && segments[1]) {
    return [`/leads/:id`, segments[1]];
  }
  if (segments[0] === 'subscribe') return ['/subscribe', null];
  if (segments[0] === 'counties') return ['/counties', null];
  if (segments[0] === 'privacy') return ['/privacy', null];
  if (segments[0] === 'terms') return ['/terms', null];
  return ['/', null];
}

export default function App() {
  const [route, param] = useHashRoute();

  const renderPage = useCallback(() => {
    switch (route) {
      case '/':
        return <Feed />;
      case '/leads/:id':
        return param ? <LeadDetail projectId={param} /> : <Feed />;
      case '/subscribe':
        return <Subscribe />;
      case '/counties':
        return <Counties />;
      case '/privacy':
        return <Privacy />;
      case '/terms':
        return <Terms />;
      default:
        return <Feed />;
    }
  }, [route, param]);

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      {/* Top Navigation — shared across all routes */}
      <nav className="top-nav">
        <a href="#/" className="nav-brand" style={{ fontFamily: 'var(--font-sans)' }}>
          PARAMOUNT INDEX
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <a
            href="#/counties"
            style={{
              fontSize: 13,
              fontWeight: 500,
              color:
                route === '/counties'
                  ? 'var(--color-text-primary)'
                  : 'var(--color-text-quaternary)',
              textDecoration: 'none',
              fontFamily: 'var(--font-sans)',
            }}
          >
            Coverage
          </a>
          <a
            href="#/subscribe"
            style={{
              fontSize: 13,
              fontWeight: 500,
              color:
                route === '/subscribe'
                  ? 'var(--color-text-primary)'
                  : 'var(--color-text-quaternary)',
              textDecoration: 'none',
              fontFamily: 'var(--font-sans)',
            }}
          >
            Subscribe
          </a>
          <a
            href="mailto:jeffrey@paramountindex.com"
            className="nav-cta"
          >
            Get in Touch
          </a>
        </div>
      </nav>

      {/* Page Content */}
      {renderPage()}

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--color-border)',
        padding: '24px 40px',
        marginTop: 60,
        display: 'flex',
        justifyContent: 'center',
        gap: 24,
        fontSize: 12,
        color: 'var(--color-text-tertiary)',
      }}>
        <span>© {new Date().getFullYear()} Paramount Index</span>
        <a href="#/privacy" style={{ color: 'var(--color-text-tertiary)', textDecoration: 'none' }}>
          Privacy Policy
        </a>
        <a href="#/terms" style={{ color: 'var(--color-text-tertiary)', textDecoration: 'none' }}>
          Terms of Service
        </a>
      </footer>
    </div>
  );
}
