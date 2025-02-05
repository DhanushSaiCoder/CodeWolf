import React, { useState, useEffect } from 'react';
import "../styles/FriendList.css";
import whatsappLogo from "../images/whatsapp.png"
import { UserFriend } from './UserFriend';
import { NotUserFriend } from './NotUserFriend';


export const FriendList = (props) => {
    const [onlineOnly, setOnlineOnly] = React.useState(false);
    const handleInviteClick = () => {
        const message = `Hey! I'd love for you to join me on this cool new web app where we can challenge each other in coding 1v1 debug matches! Test your skills and have some fun! Check it out: https://www.placeholderlink.com`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    };
    const handleOnlineOnly = () => {
        setOnlineOnly(!onlineOnly);
    }
    //notUSerFriends: 
    const [notUserFriendsData, setNotUserFriendsData] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchNonFriendsData = () => {
        fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/nonfriends`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(response => response.text())  // Read the response as text
            .then(text => {
                try {
                    const data = JSON.parse(text);  // Try to parse the text as JSON
                    setNotUserFriendsData(data);
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                    console.error('Response text:', text);  // Log the raw response text
                }
            })
            .catch(error => {
                console.error('Error fetching users:', error.message);
            });
    };

    //userFriends: 
    const [userFriendsData, setUserFriendsData] = useState([]);

    const [UFloading, setUFLoading] = useState(true);

    const fetchUserFriend = () => {
        setUFLoading(true); // Ensure loading state is set at the start

        fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(response => response.json())
            .then(data => {
                data.friends.sort((a, b) => b.online - a.online);
                setUserFriendsData(data.friends);
                console.log(data);
                setUFLoading(false);
            })
            .catch(error => {
                console.error('Error:', error);
                setUFLoading(false);
            });
    };


    useEffect(() => {
        fetchUserFriend()
    }, [])

    return (
        <div className='FriendList'>

            <div className='friendListHeader'>
                <h2>FRIENDS</h2>
                <div className='inputDiv'>
                    <input className='searchInp' type='search' placeholder='Search by username...' />
                    <label className='checkBoxLabel' htmlFor='onlineCheckBox'>
                        <input onChange={handleOnlineOnly} id='onlineCheckBox' className='onlineCheckBox' type="checkbox" />Online only
                    </label>
                </div>

                <button className='inviteBtn' onClick={handleInviteClick}>Invite Friend
                    <img className='whatsappLogo' src={whatsappLogo} alt='whatsappLogo' width="30px" height="30px" />
                </button>
            </div>

            <div className='friendListContent'>
                <UserFriend fetchUserFriend={fetchUserFriend} userFriendsData={userFriendsData} UFloading={UFloading} setUFLoading={setUFLoading} onlineOnly={onlineOnly} />
                <NotUserFriend notUserFriendsData={notUserFriendsData} setLoading={setLoading} fetchNonFriendsData={fetchNonFriendsData} />
            </div>
        </div>
    );
}
