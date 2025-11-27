import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import './AdminUsers.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [editData, setEditData] = useState({});
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
      showMessage('Failed to load users: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg, type = 'info') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setEditData({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'student',
      dept: user.dept || '',
      year: user.year || '',
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;

    try {
      const updateData = {
        name: editData.name,
        email: editData.email,
        role: editData.role,
        dept: editData.dept,
        year: editData.year ? parseInt(editData.year) : null,
      };

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', selectedUser.id);

      if (error) throw error;

      showMessage('✓ User profile updated successfully!', 'success');
      loadUsers();
      setSelectedUser(null);
    } catch (err) {
      console.error('Failed to update user:', err);
      showMessage('Failed to update user: ' + err.message, 'error');
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="admin-users-container"><p>Loading users...</p></div>;
  }

  return (
    <div className="admin-users-container">
      <h2 className="heading">👥 Manage Users</h2>

      {message && (
        <div className={`message message-${messageType}`}>
          {message}
        </div>
      )}

      <div className="admin-users-layout">
        {/* Users List */}
        <div className="users-list-section">
          <h3>Users ({filteredUsers.length})</h3>
          
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />

          <div className="users-list">
            {filteredUsers.length === 0 ? (
              <p className="empty-message">No users found.</p>
            ) : (
              filteredUsers.map(user => (
                <div
                  key={user.id}
                  className={`user-item ${selectedUser?.id === user.id ? 'active' : ''}`}
                  onClick={() => handleSelectUser(user)}
                >
                  <div className="user-item-info">
                    <div className="user-item-name">{user.name || 'Unnamed'}</div>
                    <div className="user-item-email">{user.email}</div>
                    <div className="user-item-role">
                      <span className={`role-badge role-${user.role}`}>{user.role}</span>
                      {user.dept && <span className="dept-badge">{user.dept}</span>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Edit Form */}
        <div className="user-edit-section">
          {selectedUser ? (
            <div>
              <h3>Edit User Profile</h3>
              
              <div className="form-group">
                <label>User ID (read-only)</label>
                <input
                  type="text"
                  value={selectedUser.id}
                  disabled
                  className="form-input disabled"
                />
              </div>

              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={editData.name}
                  onChange={handleEditChange}
                  className="form-input"
                  placeholder="Enter full name"
                />
              </div>

              <div className="form-group">
                <label>Email (read-only)</label>
                <input
                  type="email"
                  name="email"
                  value={editData.email}
                  disabled
                  className="form-input disabled"
                />
              </div>

              <div className="form-group">
                <label>Role</label>
                <select
                  name="role"
                  value={editData.role}
                  onChange={handleEditChange}
                  className="form-input"
                >
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                  <option value="instructor">Instructor</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Department</label>
                  <select
                    name="dept"
                    value={editData.dept}
                    onChange={handleEditChange}
                    className="form-input"
                  >
                    <option value="">Select Department</option>
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="ME">ME</option>
                    <option value="CE">CE</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Year</label>
                  <select
                    name="year"
                    value={editData.year}
                    onChange={handleEditChange}
                    className="form-input"
                  >
                    <option value="">Select Year</option>
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button className="save-btn" onClick={handleSaveUser}>
                  💾 Save Changes
                </button>
                <button className="cancel-btn" onClick={() => setSelectedUser(null)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <p>Select a user from the list to edit their profile.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
