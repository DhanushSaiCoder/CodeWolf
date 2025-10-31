import React, { useState } from 'react';
import '../styles/SecuritySettings.css';

const SecuritySettings = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (newPassword !== confirmPassword) {
      setMessage({ text: 'New passwords do not match.', type: 'error' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/me/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: data.message, type: 'success' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ text: data.message || 'Failed to update password.', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'An unexpected error occurred.', type: 'error' });
      console.error('Error updating password:', error);
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/me`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Log out the user and redirect to the login page
        localStorage.removeItem('token');
        window.location.href = '/auth/login';
      } else {
        const data = await response.json();
        setMessage({ text: data.message || 'Failed to delete account.', type: 'error' });
        setShowDeleteModal(false);
      }
    } catch (error) {
      setMessage({ text: 'An unexpected error occurred.', type: 'error' });
      console.error('Error deleting account:', error);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="security-settings">
      <h3>Security Settings</h3>
      <form onSubmit={handlePasswordChange}>
        <h4>Change Password</h4>
        {message.text && <p className={`message ${message.type}`}>{message.text}</p>}
        <div className="form-group">
          <label htmlFor="currentPassword">Current Password</label>
          <input
            type="password"
            id="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="newPassword">New Password</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm New Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <button type="submit">Change Password</button>
      </form>
      <div className="delete-account-section">
        <h4>Delete Account</h4>
        <p>Once you delete your account, there is no going back. Please be certain.</p>
        <button className="delete-button" onClick={handleDeleteAccount}>
          Delete Your Account
        </button>
      </div>

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h4>Confirm Deletion</h4>
            <p>Are you sure you want to delete your account? This action cannot be undone.</p>
            <div className="modal-buttons">
              <button onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="delete-button" onClick={confirmDeleteAccount}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecuritySettings;
