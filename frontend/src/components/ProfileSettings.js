import React, { useState, useEffect } from 'react';
import '../styles/ProfileSettings.css';

const ProfileSettings = () => {
  const [username, setUsername] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setUsername(data.username);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handleProfilePicChange = (e) => {
    setProfilePic(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/me/username`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Username updated successfully!' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update username.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred.' });
      console.error('Error updating username:', error);
    }
  };

  return (
    <div className="profile-settings">
      <h3>Profile Settings</h3>
      <form onSubmit={handleSubmit}>
        {message && <p className={`message ${message.type}`}>{message.text}</p>}
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={handleUsernameChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="profilePic">Profile Picture</label>
          <input
            type="file"
            id="profilePic"
            accept="image/*"
            onChange={handleProfilePicChange}
          />
        </div>
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default ProfileSettings;
