import React, { useEffect, useState } from 'react';
import "./Game.css"

const Game = () => {
    const [characterImage, setCharacterImage] = useState(null);
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
                    const animeID = data.split(' ')[0];
                    console.log("ID de l'anime : " + animeID);

                    const nouvelleURL = `https://charadle.vercel.app/randomCharacterImage/${animeID}`;
                    return fetch(nouvelleURL);
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Erreur de requête : ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log("Données de l'anime : ", data);
                    setCharacterImage(data);
                })
                .catch(error => {
                    console.error(`Erreur : ${error.message}`);
                });
        }

        fetchRandomTopAnime();


    }, []);


    const [guess, setGuess] = useState('');
    const [targetWord] = useState('APPLE');
    const [attempts, setAttempts] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);

    const handleGuessChange = (event) => {
        setGuess(event.target.value.toUpperCase());
    };

    const handleGuessSubmit = (event) => {
        event.preventDefault();
        if (guess.length !== 5) {
            alert('Le mot doit contenir 5 lettres.');
            return;
        }

        setAttempts(attempts + 1);

        if (guess === targetWord) {
            setIsGameOver(true);
        } else {
        }
    };

    const handleKeyboardClick = (letter) => {
        if (!isGameOver) {
            setGuess(guess + letter);
        }
    };

    const keyboardLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

    return (
        <div>
            <h1>Jeu Wordle</h1>
            <p>Devinez le mot de 5 lettres:</p>
            <img src={characterImage} alt="character" />
            <form onSubmit={handleGuessSubmit}>
                <input
                    type="text"
                    value={guess}
                    onChange={handleGuessChange}
                    disabled={isGameOver}
                />
                <button type="submit" disabled={isGameOver}>
                    Deviner
                </button>
            </form>
            {isGameOver && (
                <p>Félicitations! Vous avez deviné le mot "{targetWord}" en {attempts} tentatives.</p>
            )}
            <div className="keyboard">
                {keyboardLetters.map((letter, index) => (
                    <button
                        key={index}
                        className={`keyboard-button ${guess.includes(letter) ? 'disabled' : ''}`}
                        onClick={() => handleKeyboardClick(letter)}
                        disabled={guess.includes(letter) || isGameOver}
                    >
                        {letter}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Game;
