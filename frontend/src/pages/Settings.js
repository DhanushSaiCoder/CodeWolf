import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Settings.css';
import Header from '../components/Header';
import Nav from '../components/Nav';

const Settings = () => {
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/auth/login');
        }
    }, [navigate]);

    return (
        <div className='Settings'>
            <Header />
            <div className='SettingsContainer'>

                <div className='settingsNavDiv'>
                    <Nav currPage="settings" />
                </div>
                <div className='settingsContent'>
                    <p>this is settings, section</p>
                </div>
            </div>
        </div>
    );
}

export default Settings;
