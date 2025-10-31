import React, { useState, useEffect, useRef } from 'react';
import '../styles/ProfileSettings.css';
import profileImg from "../images/profile.jpg";
import { SquarePen, Upload } from 'lucide-react';
import uploadProfilePic from '../uploadProfilePic';

const ProfileSettings = () => {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);

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
        setUser(data);
        setUsername(data.username);
        setProfilePic(data.profilePic);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const newProfilePicUrl = await uploadProfilePic(file);
        setProfilePic(newProfilePicUrl);
        
        const token = localStorage.getItem('token');
        await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/me/profile-pic`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ profilePic: newProfilePicUrl })
        });

      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to upload profile picture.' });
        console.error('Error uploading profile picture:', error);
      }
    }
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
        setMessage({ type: 'error',text: data.message || 'Failed to update username.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred.' });
      console.error('Error updating username:', error);
    }
  };

  const handleEditOrUploadClick = () => {
    fileInputRef.current.click();
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-settings">
      <div className='profile-settings_profileImageDiv'>
        <img src={profilePic || profileImg} alt="Profile" className='profileSettings_profileImage'></img>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleProfilePicChange}
          accept="image/*"
        />
        <button className='profile-settings_editProfileBtn' onClick={handleEditOrUploadClick}>
          {profilePic ? <><SquarePen /> Edit</> : <><Upload /> Upload</>}
        </button>
      </div>
      <div className='profile-settings_formDiv'>
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
