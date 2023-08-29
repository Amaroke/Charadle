import React, { useEffect, useState } from 'react';
import characterImageLoading from '../../assets/images/characterImageLoading.gif';
import './Game.css';

const Game = ({ difficulty, currentList }) => {
    const [animeName, setAnimeName] = useState("Loading...");
    const [characterImage, setCharacterImage] = useState(null);
    const [characterName, setCharacterName] = useState("Loading...");
    const [characterAllNames, setCharacterAllNames] = useState([]);

    const [isAnimeNameBlurred, setIsAnimeNameBlurred] = useState(true);
    const [areInitialsVisible, setAreInitialsVisible] = useState(false);
    const [isGameFinished, setIsGameFinished] = useState(false);
    const [isGameLost, setIsGameLost] = useState(false);
    const [isGameWon, setIsGameWon] = useState(false);
    const [isTentativeFailed, setIsTentativeFailed] = useState(false);

    const [inputText, setInputText] = useState('');

    const revealAnime = () => {
        setIsAnimeNameBlurred(false);
    };

    const revealInitials = () => {
        setAreInitialsVisible(true);
    };

    const revealAll = () => {
        setIsGameLost(true);
        setIsAnimeNameBlurred(false);
        setAreInitialsVisible(true);
        setIsGameFinished(true);
    };

    const winGame = () => {
        setIsGameWon(true);
        setIsAnimeNameBlurred(false);
        setAreInitialsVisible(true);
        setIsGameFinished(true);
    };

    const nextGame = () => {
        window.location.reload();
    };

    useEffect(() => {
        function fetchRandomTopAnime() {
            let apiURL;
            if (currentList === "top10" || currentList === null) {
                apiURL = "https://charadle.vercel.app/randomTopAnime/10";
            } else if (currentList === "top100") {
                apiURL = "https://charadle.vercel.app/randomTopAnime/100";
            } else {
                apiURL = "https://charadle.vercel.app/randomUserAnime/" + currentList;
            }
            fetch(apiURL)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Erreur de requête : ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    const animeID = data.id;
                    setAnimeName(data.title);

                    const nouvelleURL = `https://charadle.vercel.app/randomCharacterInformations/${animeID}/${difficulty}`;
                    return fetch(nouvelleURL);
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Erreur de requête : ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    setCharacterImage(data.imageUrl);
                    setCharacterName(data.name.replace(/\([^)]*\)/g, ''));
                    setCharacterAllNames(data.allNames);
                })
                .catch(error => {
                    console.error(`Erreur : ${error.message}`);
                });
        }

        fetchRandomTopAnime();
    }, [currentList, difficulty]);

    const handleKeyPress = (key) => {
        if (key === "remove") {
            setInputText(prevText => prevText.slice(0, -1));
        } else if (key === "validate") {
            const listInput = inputText.split(' ');
            const characterAllNamesWithoutQuotes = characterAllNames.replace(/"/g, '').replace(/,/g, '');
            const listCharacterName = characterAllNamesWithoutQuotes.split(' ');
            const filteredListCharacterName = listCharacterName.filter(word => word.length >= 4);
            filteredListCharacterName.push(characterName);
            console.log(filteredListCharacterName);
            const lowercaseListInput = listInput.map(motInput => motInput.toLowerCase());
            const lowercaseFilteredListCharacterName = filteredListCharacterName.map(characterName => characterName.toLowerCase());
            if (lowercaseListInput.some(motInput => lowercaseFilteredListCharacterName.includes(motInput))) {
                winGame();
            } else {
                setIsTentativeFailed(true);
            }
        } else {
            setInputText(prevText => prevText + key);
        }
    };

    return (
        <div className="game-container">
            <div className="image-container">
                {
                    characterImage ?
                        <img src={characterImage} className="characterImage" alt="character" />
                        :
                        <img src={characterImageLoading} className="characterImage characterImageLoading" alt="characterloading" />
                }
            </div>
            <div className="content-container">
                <div className="character-info">
                    <div className="characterNameContainer">
                        {characterName.split(' ').map((word, index) => (
                            <div className="characterName" key={index}>
                                <span className={areInitialsVisible ? 'no-blur' : 'blur-text'}>
                                    {word.charAt(0)}
                                </span>
                                <span className={isGameFinished ? 'no-blur' : 'blur-text'}>
                                    {word.slice(1)}
                                </span>
                            </div>
                        ))}
                    </div>
                    <p className={isAnimeNameBlurred ? "animeNameP blur-text" : "animeNameP no-blur"}>{animeName}</p>
                </div>
                <input
                    type="text"
                    placeholder="Guess the character name..."
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    className="input-field"
                />

                <div className="keyboard">
                    <div className="keyboard-row">
                        {['A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map(letter => (
                            <button key={letter} onClick={() => handleKeyPress(letter)}>{letter}</button>
                        ))}
                    </div>
                    <div className="keyboard-row">
                        {['Q', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M'].map(letter => (
                            <button key={letter} onClick={() => handleKeyPress(letter)}>{letter}</button>
                        ))}
                    </div>
                    <div className="keyboard-row">
                        <button className="button-large" key="enter" onClick={() => handleKeyPress("validate")}>
                            <span className="enter-button-icon"></span>
                        </button>

                        {['W', 'X', 'C', 'V', 'B', 'N'].map(letter => (
                            <button key={letter} onClick={() => handleKeyPress(letter)}>{letter}</button>
                        ))}
                        <button className="button-large" key={"remove"} onClick={() => handleKeyPress("remove")}><span className="remove-button-icon"></span></button>

                    </div>
                    <div className="keyboard-hints">
                        <button onClick={revealAnime}>Reveal the Anime</button>
                        <button onClick={revealInitials}>Show the initial(s)</button>
                        {isGameFinished ? <button className="give-another" onClick={nextGame}>Another game !</button> : <button className="give-another" onClick={revealAll}>Give up !</button>}
                        <button key={"enter"} onClick={() => handleKeyPress("validate")}>{"Validate"}</button>
                    </div>
                </div>

            </div>
        </div >
    );
};

export default Game;
