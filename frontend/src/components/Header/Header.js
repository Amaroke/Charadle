import React from 'react';
import logo from '../../assets/images/logo.png';
import Cookies from 'js-cookie';
import './Header.css';

function Header() {

    const handleSettingsButtonClick = () => {
        Cookies.set('visitedBefore', '', { expires: 365 });
        window.location.reload();
    };

    return (
        <header className="header-container">
            <nav>
                <ul className="nav-list">
                    <li className="nav-item">
                        <img src={logo} className="logo" alt="logo" />
                        <span className="app-name">Charadle</span>
                    </li>
                    <li className="nav-item">
                        <div onClick={handleSettingsButtonClick} className="settings-button" />
                    </li>
                </ul>
            </nav>
        </header>
    );
}

export default Header;
