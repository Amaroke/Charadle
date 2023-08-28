import React, { useEffect, useState } from 'react';
import characterImageLoading from '../../assets/images/characterImageLoading.gif';
import './Game.css';

const Game = () => {
    const [characterImage, setCharacterImage] = useState(null);
    const [characterName, setCharacterName] = useState("loading");
    const [animeName, setAnimeName] = useState("loading");
    const [inputText, setInputText] = useState('');
    const [isAnimeNameBlurred, setIsAnimeNameBlurred] = useState(true);
    const [areInitialsVisible, setAreInitialsVisible] = useState(false);
    const [isGameFinished, setIsGameFinished] = useState(false);

    const revealAnime = () => {
        setIsAnimeNameBlurred(false);
        setAreInitialsVisible(true);
    };

    const revealInitials = () => {
        setAreInitialsVisible(true);
    };

    const revealAll = () => {
        setIsAnimeNameBlurred(false);
        setAreInitialsVisible(true);
        setIsGameFinished(true);
    };

    const nextGame = () => {
        window.location.reload();
    };

    useEffect(() => {
        function fetchRandomTopAnime() {
            const apiURL = "https://charadle.vercel.app/randomUserAnime/Amaroke";

            fetch(apiURL)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Erreur de requête : ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    const dataSplit = data.split(' ');
                    const animeID = dataSplit[0];
                    setAnimeName(dataSplit.slice(1).join(' '));
                    const nouvelleURL = `https://charadle.vercel.app/randomCharacterImageName/${animeID}`;
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
                    const characterInfo = data.name.split('(');
                    setCharacterName(characterInfo[0]);

                })
                .catch(error => {
                    console.error(`Erreur : ${error.message}`);
                });
        }

        fetchRandomTopAnime();
    }, []);

    const handleKeyPress = (key) => {
        setInputText(prevText => prevText + key);
    };

    return (
        <div className="game-container">
            <div className="image-container">
                {
                    characterImage == null ?
                        <img src={characterImageLoading} className="characterImage characterImageLoading" alt="characterloading" />
                        :
                        <img src={characterImage} className="characterImage" alt="character" />
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
                    <p className="fromP no-blur">FROM</p>
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
                        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map(letter => (
                            <button key={letter} onClick={() => handleKeyPress(letter)}>{letter}</button>
                        ))}
                    </div>
                    <div className="keyboard-row">
                        {['K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'].map(letter => (
                            <button key={letter} onClick={() => handleKeyPress(letter)}>{letter}</button>
                        ))}
                    </div>
                    <div className="keyboard-row">
                        <button key={"enter"} onClick={() => handleKeyPress("enter")}>{"↲"}</button>
                        {['U', 'V', 'W', 'X', 'Y', 'Z'].map(letter => (
                            <button key={letter} onClick={() => handleKeyPress(letter)}>{letter}</button>
                        ))}
                        <button key={"remove"} onClick={() => handleKeyPress("remove")}>{"←"}</button>
                    </div>
                </div>
                <div className="hints">
                    <button onClick={revealAnime}>Reveal the Anime</button>
                    <button onClick={revealInitials}>Show the initial(s)</button>
                    {isGameFinished ? <button onClick={nextGame}>Another game !</button> : <button onClick={revealAll}>Give up !</button>}
                </div>
            </div>
        </div>
    );
};

export default Game;
