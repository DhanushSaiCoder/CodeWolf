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
                            onClick={() => handleAddFriend(notUserFriend._id)}
                        >
                            <img src={addFriend} alt="add friend icon" />
                        </button>
                    </div>
                ))}
            </div>
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
