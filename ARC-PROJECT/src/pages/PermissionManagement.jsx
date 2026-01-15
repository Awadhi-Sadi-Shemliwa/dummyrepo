import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getAuthorizedUsers,
  addAuthorizedUser,
  removeAuthorizedUser,
} from '../utils/database';
import { X, Plus, Trash2, Mail, User, Shield } from 'lucide-react';

const PermissionManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState(getAuthorizedUsers());
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'finance',
  });
  const [message, setMessage] = useState('');

  if (user?.role !== 'ceo') {
    return (
      <div className="min-h-screen bg-brand-black text-white flex items-center justify-center">
        <div className="text-center">
          <Shield size={48} className="mx-auto mb-4 text-brand-red" />
          <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
          <p className="text-brand-sand/70">Only the CEO can manage permissions.</p>
        </div>
      </div>
    );
  }

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.name) {
      setMessage('Please fill in all fields');
      return;
    }

    try {
      addAuthorizedUser({
        ...formData,
        authorizedBy: user.email,
      });
      setUsers(getAuthorizedUsers());
      setFormData({ email: '', name: '', role: 'finance' });
      setShowAddForm(false);
      setMessage('User authorized successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error adding user: ' + error.message);
    }
  };

  const handleRemoveUser = (userId) => {
    if (window.confirm('Are you sure you want to revoke access for this user?')) {
      removeAuthorizedUser(userId);
      setUsers(getAuthorizedUsers());
      setMessage('Access revoked successfully!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const financeUsers = users.filter((u) => u.role === 'finance');
  const operationsUsers = users.filter((u) => u.role === 'operations');

  return (
    <div className="min-h-screen bg-brand-black text-white py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold mb-2">Permission Management</h1>
          <p className="text-brand-sand/70">
            Grant or revoke access for Finance and Operations officers
          </p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-2xl border ${
              message.includes('success')
                ? 'border-brand-gold/50 bg-brand-gold/10 text-brand-gold'
                : 'border-brand-red/50 bg-brand-red/10 text-brand-red'
            }`}
          >
            {message}
          </div>
        )}

        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-2 rounded-full bg-brand-gold px-6 py-3 text-sm font-semibold text-brand-black hover:bg-brand-gold/90 transition"
          >
            <Plus size={18} />
            Authorize New User
          </button>
        </div>

        {showAddForm && (
          <div className="mb-8 rounded-3xl border border-brand-gold/30 bg-brand-black/70 p-8 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Authorize New User</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-brand-sand/70 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-brand-gold/70 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-2xl border border-brand-gold/20 bg-transparent px-4 py-3 text-white focus:border-brand-gold focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-gold/70 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-2xl border border-brand-gold/20 bg-transparent px-4 py-3 text-white focus:border-brand-gold focus:outline-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-gold/70 mb-2">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full rounded-2xl border border-brand-gold/20 bg-brand-black px-4 py-3 text-white focus:border-brand-gold focus:outline-none"
                >
                  <option value="finance">Finance Officer</option>
                  <option value="operations">Operations Officer</option>
                </select>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="rounded-full bg-brand-gold px-6 py-3 text-sm font-semibold text-brand-black hover:bg-brand-gold/90 transition"
                >
                  Authorize User
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="rounded-full border border-brand-gold/60 px-6 py-3 text-sm font-semibold text-brand-gold hover:bg-brand-gold/10 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-brand-gold/30 bg-brand-black/70 p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-brand-gold/20">
                <User size={24} className="text-brand-gold" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold">Finance Officers</h2>
                <p className="text-sm text-brand-sand/70">{financeUsers.length} authorized</p>
              </div>
            </div>
            <div className="space-y-3">
              {financeUsers.length === 0 ? (
                <p className="text-brand-sand/60 text-sm">No finance officers authorized yet</p>
              ) : (
                financeUsers.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between rounded-2xl border border-brand-gold/20 bg-brand-black/60 p-4"
                  >
                    <div>
                      <p className="font-semibold">{u.name}</p>
                      <p className="text-sm text-brand-sand/70 flex items-center gap-2 mt-1">
                        <Mail size={14} />
                        {u.email}
                      </p>
                      <p className="text-xs text-brand-gold/70 mt-1">
                        Authorized {new Date(u.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveUser(u.id)}
                      className="p-2 rounded-full hover:bg-brand-red/20 text-brand-red transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-brand-gold/30 bg-brand-black/70 p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-brand-gold/20">
                <Shield size={24} className="text-brand-gold" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold">Operations Officers</h2>
                <p className="text-sm text-brand-sand/70">{operationsUsers.length} authorized</p>
              </div>
            </div>
            <div className="space-y-3">
              {operationsUsers.length === 0 ? (
                <p className="text-brand-sand/60 text-sm">No operations officers authorized yet</p>
              ) : (
                operationsUsers.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between rounded-2xl border border-brand-gold/20 bg-brand-black/60 p-4"
                  >
                    <div>
                      <p className="font-semibold">{u.name}</p>
                      <p className="text-sm text-brand-sand/70 flex items-center gap-2 mt-1">
                        <Mail size={14} />
                        {u.email}
                      </p>
                      <p className="text-xs text-brand-gold/70 mt-1">
                        Authorized {new Date(u.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveUser(u.id)}
                      className="p-2 rounded-full hover:bg-brand-red/20 text-brand-red transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionManagement;
