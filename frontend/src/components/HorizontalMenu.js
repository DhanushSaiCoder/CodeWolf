import React, { useState } from 'react';
import "../styles/HorizontalMenu.css"
import { PanelTopOpen } from "lucide-react"

const HorizontalMenu = ({ handleToggleTab, isMobile, toggleOpenMenu, menuOpened }) => {
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
            <button onClick={toggleOpenMenu} className='horiz_menu_open_panel_btn'>
                <PanelTopOpen className={menuOpened ? "panelIcon panelIconInverted" : "panelIcon panelIconNormal"} color="#d5bcf5" />
            </button>
        </div>
    );
}

export default HorizontalMenu;
