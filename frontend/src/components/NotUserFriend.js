import React, { useEffect, useState } from 'react';
import "../styles/NotUserFriend.css";
import addFriend from "../images/add-friend.png";

export const NotUserFriend = (props) => {
    const {notUserFriendsData,setLoading,fetchNonFriendsData} = props
    

    useEffect(() => {
        // Fetch data when component mounts
        fetchNonFriendsData();
    }, []);

    const handleAddFriend = (id, username, rating) => {
        setLoading(true);

        fetch(`${process.env.REACT_APP_BACKEND_URL}/friends`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                id: id,
                username: username, // Use the actual username
                rating: rating, // Use the actual rating
            })
        })
        .then(response => response.json())
        .then(data => {
            setLoading(false);
            // Handle the response data
            console.log('Friend added:', data);
            // Refetch non-friends data after adding a friend
            fetchNonFriendsData();
        })
        .catch(error => {
            console.error('Error:', error);
            setLoading(false);
        });
    };

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
