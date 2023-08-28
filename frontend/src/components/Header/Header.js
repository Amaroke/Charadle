import React from 'react';
import './Header.css';
import logo from '../../assets/images/logo.png';

function Header({ difficulty, userChoice, setDifficulty, setUserChoice }) {
    const handleDifficultyChange = (event) => {
        const newDifficulty = event.target.value;
        setDifficulty(newDifficulty);
    };

    const handleUserChoiceChange = (event) => {
        const newUserChoice = event.target.value;
        setUserChoice(newUserChoice);
    };

    return (
        <header className="header-container">
            <nav>
                <ul className="nav-list">
                    <li className="nav-item">
                        <img src={logo} className="logo" alt="logo" />
                        <span className="app-name">Charadle</span>
                    </li>
                    <div className='parameters'>
                        <li className="nav-item">
                            <label className="label" htmlFor="difficultySelect">Difficulté :</label>
                            <select
                                id="difficultySelect"
                                value={difficulty}
                                onChange={handleDifficultyChange}
                                className="select"
                            >
                                <option value="easy">Facile</option>
                                <option value="advanced">Avancé</option>
                                <option value="expert">Expert</option>
                            </select>
                        </li>
                        <label className="label-spacing"></label>
                        <li className="nav-item">
                            <label className="label" htmlFor="choiceSelect">Choix Affiché :</label>
                            <select
                                id="choiceSelect"
                                value={userChoice}
                                onChange={handleUserChoiceChange}
                                className="select"
                            >
                                <option value="pseudo">Pseudo</option>
                                <option value="top10">Top 10</option>
                                <option value="top100">Top 100</option>
                            </select>
                        </li>
                    </div>
                </ul>
            </nav>
        </header>
    );
}

export default Header;
