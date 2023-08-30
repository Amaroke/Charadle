import React, { useEffect, useState, useCallback } from 'react';
import characterImageLoading from '../../assets/images/characterImageLoading.gif';
import './Game.css';
import { useAppContext } from '../../AppContext';
import CharacterInfo from './CharacterInfo/CharacterInfo';
import KeyboardRow from './KeyboardRow/KeyboardRow';
import KeyboardHints from './KeyboardHints/KeyboardHints';

const Game = () => {

    const {
        difficulty,
        currentList,
        isGameStart,
    } = useAppContext();

    const [animeName, setAnimeName] = useState("Loading...");
    const [characterImage, setCharacterImage] = useState(null);
    const [characterName, setCharacterName] = useState("Loading...");
    const [characterAllNames, setCharacterAllNames] = useState([]);

    const [isAnimeNameBlurred, setIsAnimeNameBlurred] = useState(true);
    const [areInitialsVisible, setAreInitialsVisible] = useState(false);
    const [isGameFinished, setIsGameFinished] = useState(false);
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
        setIsGameWon(false);
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

    const handleValidation = useCallback(() => {
        const listInput = inputText.split(' ');
        const characterAllNamesWithoutQuotes = characterAllNames.replace(/"/g, '').replace(/,/g, '');
        const listCharacterName = characterAllNamesWithoutQuotes.split(' ');
        listCharacterName.push(characterName);
        let lowercaseListInput = listInput.map(motInput => motInput.toLowerCase());
        lowercaseListInput = lowercaseListInput.filter(word => word.length >= 3);
        const lowercaseFilteredListCharacterName = listCharacterName.map(characterName => characterName.toLowerCase());
        if (lowercaseListInput.some(motInput => lowercaseFilteredListCharacterName.includes(motInput))) {
            winGame();
        } else {
            setIsTentativeFailed(true);
        }
    }, [characterAllNames, characterName, inputText]);

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === "Enter" || e.key === "Return") {
                console.log("Enter pressed");
                handleValidation();
            }
        };

        window.addEventListener("keydown", handleKeyPress);
    }, [handleValidation]);

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
        console.log(key);
        if (key === "remove") {
            setInputText(prevText => prevText.slice(0, -1));
        } else if (key === "validate") {
            handleValidation();
        } else {
            setInputText(prevText => prevText + key);
        }
    };

    return (
        <div className="game-container">
            <div className="image-container">
                {
                    characterImage && isGameStart ?
                        <img src={characterImage} className="characterImage" alt="character" />
                        : isGameStart ?
                            <img src={characterImageLoading} className="characterImage characterImageLoading" alt="characterloading" />
                            :
                            null
                }
            </div>
            <div className="content-container">
                <CharacterInfo
                    characterName={characterName}
                    animeName={animeName}
                    areInitialsVisible={areInitialsVisible}
                    isAnimeNameBlurred={isAnimeNameBlurred}
                    isGameFinished={isGameFinished}
                />
                <input
                    type="text"
                    placeholder="Guess the character name..."
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    className="input-field"
                />
                <div className="keyboard">
                    <KeyboardRow letters={['A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P']} handleKeyPress={handleKeyPress} />
                    <KeyboardRow letters={['Q', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M']} handleKeyPress={handleKeyPress} />

                    <div className="keyboard-row">
                        <button className="button-large" key="enter" onClick={() => handleKeyPress(" ")}>
                            <span className="enter-button-icon"></span>
                        </button>
                        {['W', 'X', 'C', 'V', 'B', 'N'].map(letter => (
                            <button key={letter} onClick={() => handleKeyPress(letter)}>{letter}</button>
                        ))}
                        <button className="button-large" key={"remove"} onClick={() => handleKeyPress("remove")}><span className="remove-button-icon"></span></button>
                    </div>

                    <KeyboardHints
                        revealAnime={revealAnime}
                        revealInitials={revealInitials}
                        revealAll={revealAll}
                        isAnimeNameBlurred={isAnimeNameBlurred}
                        areInitialsVisible={areInitialsVisible}
                        isGameFinished={isGameFinished}
                        nextGame={nextGame}
                        handleKeyPress={handleKeyPress}
                    />
                    <h1 className={isGameFinished ? isGameWon ? "won" : "failed" : ""}>
                        {isGameFinished ? isGameWon ? "You Won !" : "You Failed !" : isTentativeFailed ? "Try Again !" : " "}
                    </h1>
                </div>
            </div>

        </div>
    );
};

export default Game;
