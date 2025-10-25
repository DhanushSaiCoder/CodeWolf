import React from 'react';
import "../styles/HorizontalMenu.css"

const HorizontalMenu = () => {
    return (
        <div className='HorizontalMenu'>
            <button className='horizontal_menu_button activeMenuBtn'>Output</button>
            <button className='horizontal_menu_button'>Test Cases</button>
        </div>
    );
}

export default HorizontalMenu;