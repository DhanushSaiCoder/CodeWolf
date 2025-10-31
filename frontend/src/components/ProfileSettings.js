import React, { useState, useEffect } from 'react';
import '../styles/ProfileSettings.css';
import profileImg from "../images/profile.jpg"
import { SquarePen } from 'lucide-react';

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
      <div className='profile-settings_profileImageDiv'>
        <img src={profileImg} alt="profile Image" className='profileSettings_profileImage'></img>
        <button className='profile-settings_editProfileBtn'><SquarePen /> Edit</button>
      </div>
      <div profileSettings_formDiv>
        <form onSubmit={handleSubmit}>
          <label htmlFor='profile-settings_usernameInp'>
            Username
            <input
              id='profile-settings_usernameInp'
              className='profile-settings_usernameInp'
              type="text"
              value={username}
              onChange={handleUsernameChange}
              placeholder={username}
            />
          </label>
          <button type="submit" className="profile-settings_saveButton">Save Changes</button>
        </form>
        {message && (
          <p className={`profile-settings_message ${message.type === 'success' ? 'success' : 'error'}`}>
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProfileSettings;
