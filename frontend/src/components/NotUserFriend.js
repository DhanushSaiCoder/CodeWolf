import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import "../styles/NotUserFriend.css";
import addFriend from "../images/add-friend.png";

export const NotUserFriend = (props) => {
    const { loading, handleAddFriend, notUserFriendsData, setLoading, fetchNonFriendsData } = props;
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                await fetchNonFriendsData();
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [fetchNonFriendsData, setLoading]);

    if (error) {
        return <div className='error'>{error}</div>;
    }

    return (
        <div className='NotUserFriend'>
            <h4 className='NotUserFriend__title'>ADD FRIENDS</h4> {/* Updated class name */}
            {loading ? (
                <div className='loading'>Loading...</div> 
            ) : (
                <div className='NotUserFriend__data'>
                    {!notUserFriendsData.length ? (
                        <p className='emptyMsg'>No more users to show!</p>
                    ) : (
                        notUserFriendsData.map((notUserFriend, index) => (
                            <div className="NotUserFriend__container" key={notUserFriend._id}> {/* Updated class name */}
                                <p>{index + 1}</p>
                                <div className='NotUserFriend__userDetails'>
                                    <div>
                                        <h3 className='NotUserFriend__username'>{notUserFriend.username}</h3>
                                        <p><span className='NotUserFriend__rating'>&#8902; </span>{notUserFriend.rating}</p>
                                    </div>
                                </div>

                                <button
                                    className='inviteFriendBtn quickMatchBtn NotUserFriend__btn'
                                    disabled={!notUserFriend.status}
                                    onClick={() => handleAddFriend(notUserFriend._id, notUserFriend.username, notUserFriend.rating)}
                                    
                                >
                                    <img src={addFriend} alt="add friend icon" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

// Add PropTypes for type checking
NotUserFriend.propTypes = {
    loading: PropTypes.bool.isRequired,
    handleAddFriend: PropTypes.func.isRequired,
    notUserFriendsData: PropTypes.array.isRequired,
    setLoading: PropTypes.func.isRequired,
    fetchNonFriendsData: PropTypes.func.isRequired,
};

export default NotUserFriend;
