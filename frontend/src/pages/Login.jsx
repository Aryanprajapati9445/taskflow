import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminSplash, setAdminSplash] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleMode = () => {
    setIsAdminMode((prev) => !prev);
    setForm({ email: '', password: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userData = await login(form);

      if (isAdminMode && userData.role !== 'admin') {
        toast.error('This account does not have admin privileges.');
        setLoading(false);
        return;
      }

      if (userData.role === 'admin') {
        setAdminSplash(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2500);
      } else {
        toast.success('Welcome back!');
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (adminSplash) {
    return (
      <div className="admin-splash">
        <div className="admin-splash-content">
          <div className="admin-splash-check">✓</div>
          <h1>Admin Access Granted</h1>
          <p>Welcome back, Administrator</p>
          <div className="admin-splash-bar">
            <div className="admin-splash-bar-fill" />
          </div>
          <span className="admin-splash-label">Loading admin dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`auth-page ${isAdminMode ? 'auth-page-admin' : ''}`}>
      <div className={`auth-container ${isAdminMode ? 'auth-container-admin' : ''}`}>

        <div className="login-toggle">
          <button
            className={`toggle-btn ${!isAdminMode ? 'toggle-active' : ''}`}
            onClick={() => isAdminMode && toggleMode()}
            type="button"
          >
            User
          </button>
          <button
            className={`toggle-btn ${isAdminMode ? 'toggle-active toggle-admin' : ''}`}
            onClick={() => !isAdminMode && toggleMode()}
            type="button"
          >
            Admin
          </button>
        </div>

        <div className="auth-header">
          <h1>{isAdminMode ? 'Admin Login' : 'Welcome Back'}</h1>
          <p>
            {isAdminMode
              ? 'Sign in with administrator credentials'
              : 'Sign in to your TaskFlow account'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              {isAdminMode ? 'Admin Email' : 'Email'}
            </label>
            <input
              id="login-email"
              className="form-input"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder={isAdminMode ? 'admin@taskflow.com' : 'you@example.com'}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              className="form-input"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className={`btn btn-lg auth-submit ${isAdminMode ? 'btn-admin' : 'btn-primary'}`}
            disabled={loading}
          >
            {loading
              ? 'Signing in...'
              : isAdminMode
                ? 'Sign In as Admin'
                : 'Sign In'
            }
          </button>
        </form>

        {isAdminMode && (
          <div className="admin-login-note">
            Authorized personnel only. Activity is logged.
          </div>
        )}

        <p className="auth-footer">
          Don&apos;t have an account?{' '}
          <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
