import React, { useState } from 'react';
import "../styles/HorizontalMenu.css"

const HorizontalMenu = ({handleToggleTab}) => {
    const [activeTab, setActiveTab] = useState('output');

    const backgroundStyle = {
        left: activeTab === 'output' ? '0px' : '160px',
    };

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
        handleToggleTab(tabName);
    }

    return (
        <div className='HorizontalMenu'>
            <div className='horizontal_menu_button_container'>
                <div style={backgroundStyle} className='horizontal_menu_button_active_background'></div>
                <button onClick={() => handleTabClick('output')} className={activeTab === 'output' ? "horizontal_menu_button activeMenuBtn" : "horizontal_menu_button"}>Output</button>
                <button onClick={() => handleTabClick('testcases')} className={activeTab === 'testcases' ? "horizontal_menu_button activeMenuBtn" : "horizontal_menu_button"}>Test Cases</button>
            </div>
        </div>
    );
}

export default HorizontalMenu;
