import React from 'react';
import "../styles/FriendList.css";

export const FriendList = (props) => {
  return (
    <div className='FriendList'>
      <div className='friendListHeader'>
        <h1>FRIENDS</h1>
        <input type='search' placeholder='Search by username' />
        <label htmlFor='onlineCheckBox'>
          <input id='onlineCheckBox' type="checkbox" />Online only
        </label>
        <button>Invite Friend</button>
      </div>
    </div>
  );
}
