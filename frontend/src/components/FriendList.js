import React, { useState, useEffect, useCallback } from 'react';
import "../styles/FriendList.css";
import whatsappLogo from "../images/whatsapp.png"
import { UserFriend } from './UserFriend';
import { NotUserFriend } from './NotUserFriend';
import { useSocket } from '../SocketContext';
import Fuse from 'fuse.js';

export const FriendList = (props) => {
    const [onlineOnly, setOnlineOnly] = useState(false);
    const [notUserFriendsData, setNotUserFriendsData] = useState([]);
    const [filteredNotUserFriends, setFilteredNotUserFriends] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userFriendsData, setUserFriendsData] = useState([]);
    const [filteredUserFriends, setFilteredUserFriends] = useState([]);
    const [UFloading, setUFLoading] = useState(true);
    const [userDoc, setUserDoc] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const socket = useSocket();

    const handleInviteClick = () => {
  const message = `⚡ Think you can outcode me? Join me for a 1v1 coding battle — fastest debug wins! ${process.env.REACT_APP_FRONTEND_URL}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
};

    const handleOnlineOnly = () => {
        setOnlineOnly(!onlineOnly);
    };

    // Fetch non-friends data
    const fetchNonFriendsData = useCallback(() => {
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
                    setFilteredNotUserFriends(data);
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                    console.error('Response text:', text);
                }
            })
            .catch(error => {
                console.error('Error fetching users:', error.message);
            });
    }, []);

    // Fetch user friends data
    const fetchUserFriend = useCallback(() => {
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
                setFilteredUserFriends(sortedFriends);
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
    }, []);

    const handleAddFriend = useCallback((id) => {
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
    }, [fetchNonFriendsData, fetchUserFriend]);

    useEffect(() => {
        fetchUserFriend();

        if (socket) {
            const handleStatusUpdate = ({ userId, status }) => {
                setUserFriendsData((prevFriends) => {
                    const updatedFriends = prevFriends.map((friend) =>
                        friend._id.toString() === userId.toString() ? { ...friend, status } : friend
                    );
                    setFilteredUserFriends(updatedFriends);
                    return updatedFriends;
                });
            };

            socket.on('statusUpdate', handleStatusUpdate);

            return () => {
                socket.off('statusUpdate', handleStatusUpdate);
            };
        }
    }, [socket, fetchUserFriend]);

    // Fuse.js options for searching friends
    const fuseOptions = {
        keys: ['username'],
        threshold: 0.3, // Adjust for fuzziness
    };

    useEffect(() => {
        if (searchQuery) {
            const fuseUserFriends = new Fuse(userFriendsData, fuseOptions);
            const fuseNotUserFriends = new Fuse(notUserFriendsData, fuseOptions);

            setFilteredUserFriends(fuseUserFriends.search(searchQuery).map(result => result.item));
            setFilteredNotUserFriends(fuseNotUserFriends.search(searchQuery).map(result => result.item));
        } else {
            // If search query is empty, show all friends
            setFilteredUserFriends(userFriendsData);
            setFilteredNotUserFriends(notUserFriendsData);
        }
    }, [searchQuery, userFriendsData, notUserFriendsData]);

    return (
        <div className='FriendList'>
            <div className='friendListHeader'>
                <h2>FRIENDS</h2>
                <div className='inputDiv'>
                    <input
                        className='searchInp'
                        type='search'
                        placeholder='Search by username...'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <label className='checkBoxLabel' htmlFor='onlineCheckBox'>
                        <input onChange={handleOnlineOnly} id='onlineCheckBox' className='onlineCheckBox' type="checkbox" />Online only
                    </label>
                </div>
                <button className='inviteBtn' onClick={handleInviteClick}>Invite Friend
                    <img className='whatsappLogo' src={whatsappLogo} alt='whatsappLogo' width="30px" height="30px" />
                </button>
            </div>
            <div className='friendListContent'>
                <UserFriend userDoc={userDoc} fetchUserFriend={fetchUserFriend} userFriendsData={filteredUserFriends} UFloading={UFloading} setUFLoading={setUFLoading} onlineOnly={onlineOnly} />
                <NotUserFriend handleAddFriend={handleAddFriend} notUserFriendsData={filteredNotUserFriends} setLoading={setLoading} fetchNonFriendsData={fetchNonFriendsData} />
            </div>
        </div>
    );
}
