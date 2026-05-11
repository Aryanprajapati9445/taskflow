import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { taskService } from '../services/endpoints';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar/Navbar';
import TaskModal from '../components/TaskModal/TaskModal';
import ConfirmModal from '../components/ConfirmModal/ConfirmModal';
import toast from 'react-hot-toast';
import './Dashboard.css';

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ page: 1, status: '', priority: '', search: '' });
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [confirm, setConfirm] = useState({ open: false });
  const [selected, setSelected] = useState(new Set());

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
      const { data } = await taskService.getMyTasks(params);
      setTasks(data.data.tasks);
      setMeta(data.meta || {});
    } catch (err) {
      toast.error('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // Clear selection when tasks change
  useEffect(() => { setSelected(new Set()); }, [tasks]);

  const handleCreate = async (formData) => {
    try {
      await taskService.create(formData);
      toast.success('Task created!');
      setShowModal(false);
      fetchTasks();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create task.';
      toast.error(msg);
    }
  };

  const handleUpdate = async (formData) => {
    try {
      await taskService.update(editingTask.id, formData);
      toast.success('Task updated!');
      setEditingTask(null);
      setShowModal(false);
      fetchTasks();
    } catch (err) {
      toast.error('Failed to update task.');
    }
  };

  const handleDelete = (id) => {
    setConfirm({
      open: true,
      title: 'Delete Task',
      message: 'This task will be permanently deleted. This action cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        setConfirm({ open: false });
        try {
          await taskService.delete(id);
          toast.success('Task deleted.');
          fetchTasks();
        } catch (err) {
          toast.error('Failed to delete task.');
        }
      },
    });
  };

  // Quick status change for a single task
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskService.update(taskId, { status: newStatus });
      toast.success(`Status changed to ${newStatus}.`);
      fetchTasks();
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  // ── Multi-select ──
  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === tasks.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(tasks.map((t) => t.id)));
    }
  };

  // Bulk status change
  const handleBulkStatus = (newStatus) => {
    const count = selected.size;
    setConfirm({
      open: true,
      title: `Mark ${count} task${count > 1 ? 's' : ''} as "${newStatus}"`,
      message: `This will change the status of ${count} selected task${count > 1 ? 's' : ''} to "${newStatus}".`,
      confirmLabel: 'Update',
      variant: 'primary',
      onConfirm: async () => {
        setConfirm({ open: false });
        try {
          await Promise.all(
            [...selected].map((id) => taskService.update(id, { status: newStatus }))
          );
          toast.success(`${count} task${count > 1 ? 's' : ''} updated.`);
          fetchTasks();
        } catch (err) {
          toast.error('Some tasks failed to update.');
          fetchTasks();
        }
      },
    });
  };

  // Bulk delete
  const handleBulkDelete = () => {
    const count = selected.size;
    setConfirm({
      open: true,
      title: `Delete ${count} task${count > 1 ? 's' : ''}`,
      message: `This will permanently delete ${count} selected task${count > 1 ? 's' : ''}. This action cannot be undone.`,
      confirmLabel: 'Delete All',
      variant: 'danger',
      onConfirm: async () => {
        setConfirm({ open: false });
        try {
          await Promise.all([...selected].map((id) => taskService.delete(id)));
          toast.success(`${count} task${count > 1 ? 's' : ''} deleted.`);
          fetchTasks();
        } catch (err) {
          toast.error('Some tasks failed to delete.');
          fetchTasks();
        }
      },
    });
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  const openCreate = () => {
    setEditingTask(null);
    setShowModal(true);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const statusCounts = {
    todo: tasks.filter((t) => t.status === 'todo').length,
    'in-progress': tasks.filter((t) => t.status === 'in-progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
  };

  const hasSelected = selected.size > 0;

  return (
    <div className="dashboard-layout">
      <Navbar />

      <main className="dashboard-main container">
        {/* Admin Banner */}
        {isAdmin && (
          <div className="admin-banner">
            <div className="admin-banner-content">
              <div className="admin-banner-text">
                <h3>Administrator Access</h3>
                <p>You're logged in with full admin privileges. Manage users, roles, and view all platform activity.</p>
              </div>
            </div>
            <Link to="/admin" className="btn btn-admin-banner">
              Open Admin Panel
            </Link>
          </div>
        )}

        {/* Header */}
        <div className="dash-header">
          <div>
            <h1>{isAdmin ? 'Admin Dashboard' : 'My Tasks'}</h1>
            <p>
              {isAdmin
                ? `Welcome, ${user?.name}. You have admin access. Your personal tasks are below.`
                : `Welcome back, ${user?.name}. You have ${meta.total || 0} tasks.`
              }
            </p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>
            + New Task
          </button>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-count">{statusCounts.todo}</span>
            <span className="stat-label">To Do</span>
          </div>
          <div className="stat-card">
            <span className="stat-count">{statusCounts['in-progress']}</span>
            <span className="stat-label">In Progress</span>
          </div>
          <div className="stat-card">
            <span className="stat-count">{statusCounts.done}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <input
            className="form-input filter-search"
            type="text"
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
          <select
            className="form-select filter-select"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <select
            className="form-select filter-select"
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
          >
            <option value="">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Bulk Action Bar */}
        {hasSelected && (
          <div className="bulk-bar">
            <span className="bulk-count">{selected.size} selected</span>
            <div className="bulk-actions">
              <span className="bulk-label">Move to:</span>
              <button className="btn btn-secondary btn-sm" onClick={() => handleBulkStatus('todo')}>
                To Do
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => handleBulkStatus('in-progress')}>
                In Progress
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => handleBulkStatus('done')}>
                Done
              </button>
              <div className="bulk-divider" />
              <button className="btn btn-danger btn-sm" onClick={handleBulkDelete}>
                Delete
              </button>
            </div>
            <button className="btn-text" onClick={() => setSelected(new Set())}>
              Clear
            </button>
          </div>
        )}

        {/* Task List */}
        {loading ? (
          <div className="loading-screen"><div className="spinner" /></div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <h3>No tasks yet</h3>
            <p>Create your first task to get started.</p>
            <button className="btn btn-primary" onClick={openCreate}>+ Create Task</button>
          </div>
        ) : (
          <>
            {/* Select All */}
            <div className="select-all-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selected.size === tasks.length && tasks.length > 0}
                  onChange={toggleSelectAll}
                />
                <span>Select all</span>
              </label>
            </div>

            <div className="task-list">
              {tasks.map((task) => {
                const isDone = task.status === 'done';
                const isSelected = selected.has(task.id);

                return (
                  <div
                    key={task.id}
                    className={`task-card card ${isDone ? 'task-done' : ''} ${isSelected ? 'task-selected' : ''}`}
                  >
                    <div className="task-card-top">
                      <div className="task-checkbox">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(task.id)}
                        />
                      </div>
                      <div className="task-card-info">
                        <h3 className={`task-title ${isDone ? 'task-title-done' : ''}`}>
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className={`task-desc ${isDone ? 'task-desc-done' : ''}`}>
                            {task.description}
                          </p>
                        )}
                      </div>
                      <div className="task-actions">
                        <select
                          className="form-select status-select"
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        >
                          <option value="todo">To Do</option>
                          <option value="in-progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(task)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(task.id)}>Del</button>
                      </div>
                    </div>
                    <div className="task-card-bottom">
                      <span className={`badge badge-${task.status}`}>{task.status}</span>
                      <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                      {task.dueDate && (
                        <span className="task-due">{new Date(task.dueDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Pagination */}
        {meta.pages > 1 && (
          <div className="pagination">
            <button
              className="btn btn-secondary btn-sm"
              disabled={filters.page <= 1}
              onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}
            >
              Prev
            </button>
            <span className="page-info">
              Page {meta.page} of {meta.pages}
            </span>
            <button
              className="btn btn-secondary btn-sm"
              disabled={filters.page >= meta.pages}
              onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}
            >
              Next
            </button>
          </div>
        )}
      </main>

      {showModal && (
        <TaskModal
          task={editingTask}
          onSave={editingTask ? handleUpdate : handleCreate}
          onClose={() => { setShowModal(false); setEditingTask(null); }}
        />
      )}

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
