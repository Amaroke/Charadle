import React from 'react';
import logo from '../../assets/images/logo.png';
import './header.css';

function Header() {

    const handleSettingsButtonClick = () => {
        localStorage.setItem('visitedBefore', '');
        localStorage.setItem('isGameStart', false);
        window.location.reload();
    };

    return (
        <header className="header-container">
            <nav>
                <ul className="nav-list">
                    <li className="nav-item">
                        <img src={logo} className="logo" alt="logo" width={30} height={30} />
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
