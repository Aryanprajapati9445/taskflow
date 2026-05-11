import { useState, useEffect, useCallback } from 'react';
import { userService, taskService } from '../services/endpoints';
import Navbar from '../components/Navbar/Navbar';
import ConfirmModal from '../components/ConfirmModal/ConfirmModal';
import toast from 'react-hot-toast';
import './Admin.css';

export default function Admin() {
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [userMeta, setUserMeta] = useState({});
  const [taskMeta, setTaskMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState({ open: false });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await userService.getAll({ limit: 50 });
      setUsers(data.data.users);
      setUserMeta(data.meta || {});
    } catch (err) {
      toast.error('Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllTasks = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await taskService.getAll({ limit: 50 });
      setTasks(data.data.tasks);
      setTaskMeta(data.meta || {});
    } catch (err) {
      toast.error('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'users') fetchUsers();
    else fetchAllTasks();
  }, [tab, fetchUsers, fetchAllTasks]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await userService.updateRole(userId, newRole);
      toast.success('Role updated!');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update role.');
    }
  };

  const handleDeactivate = (userId) => {
    setConfirm({
      open: true,
      title: 'Deactivate User',
      message: 'This user will no longer be able to log in. Are you sure you want to deactivate this account?',
      confirmLabel: 'Deactivate',
      variant: 'danger',
      onConfirm: async () => {
        setConfirm({ open: false });
        try {
          await userService.deactivate(userId);
          toast.success('User deactivated.');
          fetchUsers();
        } catch (err) {
          toast.error('Failed to deactivate user.');
        }
      },
    });
  };

  const handleActivate = (userId) => {
    setConfirm({
      open: true,
      title: 'Activate User',
      message: 'This will restore the user\'s access to the platform. Are you sure you want to activate this account?',
      confirmLabel: 'Activate',
      variant: 'primary',
      onConfirm: async () => {
        setConfirm({ open: false });
        try {
          await userService.activate(userId);
          toast.success('User activated.');
          fetchUsers();
        } catch (err) {
          toast.error('Failed to activate user.');
        }
      },
    });
  };

  return (
    <div className="dashboard-layout">
      <Navbar />

      <main className="dashboard-main container">
        <div className="dash-header">
          <div>
            <h1>Admin Panel</h1>
            <p>Manage users and view all tasks across the platform.</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="admin-tabs">
          <button
            className={`tab-btn ${tab === 'users' ? 'active' : ''}`}
            onClick={() => setTab('users')}
          >
            Users ({userMeta.total || 0})
          </button>
          <button
            className={`tab-btn ${tab === 'tasks' ? 'active' : ''}`}
            onClick={() => setTab('tasks')}
          >
            All Tasks ({taskMeta.total || 0})
          </button>
        </div>

        {loading ? (
          <div className="loading-screen"><div className="spinner" /></div>
        ) : tab === 'users' ? (
          /* ── Users Table ── */
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="td-name">{u.name}</td>
                    <td className="td-email">{u.email}</td>
                    <td>
                      <select
                        className="role-select"
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      <span className={`badge ${u.isActive ? 'badge-done' : 'badge-high'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="td-date">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      {u.isActive ? (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeactivate(u.id)}
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleActivate(u.id)}
                        >
                          Activate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* ── All Tasks ── */
          <div className="task-list">
            {tasks.length === 0 ? (
              <div className="empty-state">
                <h3>No tasks in the system</h3>
              </div>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="task-card card">
                  <div className="task-card-top">
                    <div className="task-card-info">
                      <h3 className="task-title">{task.title}</h3>
                      {task.description && <p className="task-desc">{task.description}</p>}
                    </div>
                    <span className="task-owner">
                      by {task.createdBy?.name || 'Unknown'}
                    </span>
                  </div>
                  <div className="task-card-bottom">
                    <span className={`badge badge-${task.status}`}>{task.status}</span>
                    <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                    {task.dueDate && (
                      <span className="task-due">{new Date(task.dueDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Confirm Modal */}
      <ConfirmModal
        open={confirm.open}
        title={confirm.title}
        message={confirm.message}
        confirmLabel={confirm.confirmLabel}
        variant={confirm.variant}
        onConfirm={confirm.onConfirm}
        onCancel={() => setConfirm({ open: false })}
      />
    </div>
  );
}
