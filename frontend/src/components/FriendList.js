import React, { useState, useEffect } from 'react';
import "../styles/FriendList.css";
import whatsappLogo from "../images/whatsapp.png"
import { UserFriend } from './UserFriend';
import { NotUserFriend } from './NotUserFriend';
import { useSocket } from '../SocketContext';

export const FriendList = (props) => {
    const [onlineOnly, setOnlineOnly] = useState(false);
    const [notUserFriendsData, setNotUserFriendsData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userFriendsData, setUserFriendsData] = useState([]);
    const [UFloading, setUFLoading] = useState(true);
    const [userDoc, setUserDoc] = useState({})
    const socket = useSocket();

    const handleInviteClick = () => {
        const message = `Hey! I'd love for you to join me on this cool new web app where we can challenge each other in coding 1v1 debug matches! Test your skills and have some fun! Check it out: https://www.placeholderlink.com`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    };

    const handleOnlineOnly = () => {
        setOnlineOnly(!onlineOnly);
    };

    // Fetch non-friends data
    const fetchNonFriendsData = () => {
        fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/nonfriends`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(response => response.text())
            .then(text => {
                try {
                    const data = JSON.parse(text);
                    setNotUserFriendsData(data);
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                    console.error('Response text:', text);
                }
            })
            .catch(error => {
                console.error('Error fetching users:', error.message);
            });
    };

    const handleAddFriend = (id) => {
        setLoading(true);

        fetch(`${process.env.REACT_APP_BACKEND_URL}/friends`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                id: id
            })
        })
            .then(response => response.json())
            .then(data => {
                setLoading(false);
                fetchNonFriendsData();
            })
            .catch(error => {
                console.error('Error:', error);
                setLoading(false);
            })
            .finally(() => {
                fetchUserFriend()
            })
    };

    // Fetch user friends data
    const fetchUserFriend = () => {
        setUFLoading(true);

        // Fetch the populated friends list
        fetch(`${process.env.REACT_APP_BACKEND_URL}/friends/list`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(response => response.json())
            .then(data => {
                // The response is { friends: [...] }
                const sortedFriends = data.friends.sort((a, b) => (b.status === 'online') - (a.status === 'online'));
                setUserFriendsData(sortedFriends);
                setUFLoading(false);
            })
            .catch(error => {
                console.error('Error fetching friends:', error);
                setUFLoading(false);
            });
        
        // Also fetch the main user document for other purposes if needed
        fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => response.json())
        .then(data => {
            setUserDoc(data);
        })
        .catch(error => {
            console.error('Error fetching user doc:', error);
        });
    };

    useEffect(() => {
        fetchUserFriend();

        if (socket) {
            const handleStatusUpdate = ({ userId, status }) => {
                setUserFriendsData((prevFriends) =>
                    prevFriends.map((friend) =>
                        friend._id.toString() === userId.toString() ? { ...friend, status } : friend
                    )
                );
            };

            socket.on('statusUpdate', handleStatusUpdate);

            return () => {
                socket.off('statusUpdate', handleStatusUpdate);
            };
        }
    }, [socket]);

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
                <UserFriend userDoc={userDoc} fetchUserFriend={fetchUserFriend} userFriendsData={userFriendsData} UFloading={UFloading} setUFLoading={setUFLoading} onlineOnly={onlineOnly} />
                <NotUserFriend handleAddFriend={handleAddFriend} notUserFriendsData={notUserFriendsData} setLoading={setLoading} fetchNonFriendsData={fetchNonFriendsData} />
            </div>
        </div>
    );
};
