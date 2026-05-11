import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`navbar ${isAdmin ? 'navbar-admin' : ''}`}>
      {isAdmin && (
        <div className="admin-strip">
          <span>Administrator Mode</span>
        </div>
      )}

      <div className="navbar-inner container">
        <Link to="/dashboard" className="navbar-brand">
          <span className="brand-text">TaskFlow</span>
          {isAdmin && <span className="brand-admin-tag">ADMIN</span>}
        </Link>

        <div className="navbar-links">
          <Link
            to="/dashboard"
            className={`nav-link ${isActive('/dashboard') ? 'nav-link-active' : ''}`}
          >
            Dashboard
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className={`nav-link ${isActive('/admin') ? 'nav-link-active' : ''}`}
            >
              Admin Panel
            </Link>
          )}
        </div>

        <div className="navbar-user">
          <div className="user-info">
            <div className="user-details">
              <span className="user-name">{user?.name}</span>
              <span className={`role-badge ${isAdmin ? 'role-admin' : 'role-user'}`}>
                {isAdmin ? 'Administrator' : 'User'}
              </span>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
