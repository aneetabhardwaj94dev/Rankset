import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdPlaceholder from './AdPlaceholder';

export default function Layout({ children, showAd = true }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <header className="header">
        <div className="container header-inner">
          <Link to="/" className="logo-wrap">
            <img src="/logo.png" alt="Rankset" className="logo" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling?.classList.add('show'); }} />
            <span className="logo-text show">Rankset</span>
          </Link>
          <nav className="nav">
            {user && (
              <>
                <Link to="/">Dashboard</Link>
                <Link to="/leaderboard">Leaderboard</Link>
                <Link to="/profile">Profile</Link>
                {(user.role === 'admin' || user.role === 'manager') && <Link to="/admin">Reports</Link>}
                <button type="button" className="btn btn-outline" style={{ marginLeft: '0.5rem' }} onClick={handleLogout}>Logout</button>
              </>
            )}
          </nav>
        </div>
      </header>

      {showAd && <AdPlaceholder position="top" />}

      <main className="main">
        <div className="container">{children}</div>
      </main>

      {showAd && <AdPlaceholder position="bottom" />}

      <footer className="footer">
        <div className="container footer-inner">
          <span>© Rankset</span>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
}
