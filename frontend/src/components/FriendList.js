import React from 'react';
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
                <UserFriend onlineOnly={onlineOnly} />
                <NotUserFriend />
            </div>
        </div>
    );
}
