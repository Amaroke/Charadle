import React from 'react';
import logo from '../../assets/images/logo.png';
import './Header.css';

function Header({ difficulty, currentList, setDifficulty, setCurrentList }) {

    const handleDifficultyChange = (event) => {
        setDifficulty(event.target.value);
    };

    const handleCurrentListChange = (event) => {
        if (event.target.value === 'newList') {
            const pseudo = window.prompt('MAL account to use :');
            if (pseudo !== null) {
                setCurrentList(pseudo);
                window.location.reload();
            }
        } else {
            setCurrentList(event.target.value);
            window.location.reload();
        }
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
                            <label className="label" htmlFor="difficultySelect">Difficulty :</label>
                            <select
                                id="difficultySelect"
                                value={difficulty}
                                onChange={handleDifficultyChange}
                                className="select"
                            >
                                <option value="easy">Easy</option>
                                <option value="advanced">Advanced</option>
                                <option value="expert">Expert</option>
                            </select>
                        </li>
                        <label className="label-spacing"></label>
                        <li className="nav-item">
                            <label className="label" htmlFor="choiceSelect">Current list :</label>
                            <select
                                id="choiceSelect"
                                value={currentList}
                                onChange={handleCurrentListChange}
                                className="select"
                            >
                                {currentList !== null && currentList !== "top10" && currentList !== "top100" ? <option value={currentList}>{currentList}</option> : null}
                                <option value="top10">Top 10</option>
                                <option value="top100">Top 100</option>
                                <option value="newList">Use MAL Account</option>
                            </select>
                        </li>
                    </div>
                </ul>
            </nav>
        </header>
    );
}

export default Header;
