import React, { useEffect, useState } from 'react';
import "../styles/NotUserFriend.css";
import addFriend from "../images/add-friend.png";

export const NotUserFriend = (props) => {
    const {handleAddFriend,notUserFriendsData,setLoading,fetchNonFriendsData} = props
    

    useEffect(() => {
        // Fetch data when component mounts
        fetchNonFriendsData();
    }, []);

    
    return (
        <div className='NotUserFriend'>
            <h4 style={{ marginBottom: "10px" }}>ADD FRIENDS</h4>
            <div className='NUF_data'>
                {notUserFriendsData.map((notUserFriend, index) => (
                    <div className="UserFriend__container" key={notUserFriend._id}>
                        <p>{index + 1}</p>
                        <div className='NotUserFriend__userDetails'>
                            <div>
                                <h3 className='NotUserFriend__username'>{notUserFriend.username}</h3>
                                <p><span className='NotUserFriend__rating'>&#8902; </span>{notUserFriend.rating}</p>
                            </div>
                        </div>

                        <button
                            className='inviteFriendBtn quickMatchBtn NotUserFriendQuickMatchBtn'
                            disabled={!notUserFriend.status}
                            onClick={() => handleAddFriend(notUserFriend._id, notUserFriend.username, notUserFriend.rating)}
                        >
                            <img src={addFriend} alt="add friend icon" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
