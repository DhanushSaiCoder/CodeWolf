import React from 'react';
import "../styles/HorizontalMenu.css"

const HorizontalMenu = () => {
    return (
        <div className='HorizontalMenu'>
            <div className='horizontal_menu_button_container'>
                <div className='horizontal_menu_button_active_background'></div>
                <button className='horizontal_menu_button activeMenuBtn'>Output</button>
                <button className='horizontal_menu_button'>Test Cases</button>
            </div>
        </div>
    );
}

export default HorizontalMenu;