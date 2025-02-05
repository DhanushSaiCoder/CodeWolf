import React, { useEffect, useState } from 'react';
import "../styles/NotUserFriend.css";
import addFriend from "../images/add-friend.png"
export const NotUserFriend = () => {
    const [notUserFriendsData, setNotUserFriendsData] = React.useState([])

    useEffect(() => {
        // Fetch data from the API
        fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/nonfriends`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(response => {
                console.log('Response status:', response.status);
                return response.text();  // Read the response as text
            })
            .then(text => {
                try {
                    const data = JSON.parse(text);  // Try to parse the text as JSON
                    console.log(data);
                    // setNotUserFriendsData(data);
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                    console.error('Response text:', text);  // Log the raw response text
                }
            })
            .catch(error => {
                console.error('Error fetching users:', error.message);
            });
    }, []);



    return (<div className='NotUserFriend'>
        <h4 style={{ marginBottom: "10px" }}>OTHER USERS</h4>
        <div className='NUF_data'>
            {notUserFriendsData.map((notUserFriend, index) => {
                return (<div className="UserFriend__container" key={notUserFriend.id}>
                    <p>{index + 1}</p>
                    <div className='NotUserFriend__userDetails'>
                        <div>
                            <h3 className='NotUserFriend__username'>{notUserFriend.username}</h3>
                            <p><span className='NotUserFriend__rating'>&#8902; </span>{notUserFriend.rating}</p>
                        </div>
                    </div>

                    <button
                        className='inviteFriendBtn quickMatchBtn NotUserFriendQuickMatchBtn'
                        disabled={!notUserFriend.online}
                    >
                        <img src={addFriend} alt="add friend icon" />
                    </button>
                </div>)
            })}
        </div>
    </div>);
}