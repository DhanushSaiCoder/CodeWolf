import React from 'react';
import "../styles/FriendList.css";
import whatsappLogo from "../images/whatsapp.png"

export const FriendList = (props) => {
    return (
        <div className='FriendList'>
            <div className='friendListHeader'>
                <h2>FRIENDS</h2>
                <div className='inputDiv'>
                    <input className='searchInp' type='search' placeholder='Search by username...' />
                    <label className='checkBoxLabel' htmlFor='onlineCheckBox'>
                        <input id='onlineCheckBox' className='onlineCheckBox' type="checkbox" />Online only
                    </label>
                </div>

                <button className='inviteBtn'>Invite Friend
                    <img className='whatsappLogo' src={whatsappLogo} alt='whatsappLogo' width="30px" height="30px" />
                </button>
            </div>
        </div>
    );
}
