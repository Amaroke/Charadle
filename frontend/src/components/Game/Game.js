import React, { useEffect, useState } from 'react';
import "./Game.css"

const Game = () => {
    const [characterImage, setCharacterImage] = useState(null);
    const [characterName, setCharacterName] = useState(null);

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
                    setCharacterName(data.name.split('(')[0]);
                })
                .catch(error => {
                    console.error(`Erreur : ${error.message}`);
                });
        }

        fetchRandomTopAnime();

    }, []);

    return (
        <div className="game-container">
            <div className="image-container">
                <img src={characterImage} className="characterImage" alt="character" />
            </div>
            <div className="letters-container">
                {Array.from({ length: 5 }).map((_, sectionIndex) => (
                    <div key={sectionIndex} className="letter-row">
                        {characterName ? (
                            characterName.trimEnd().split('').map((letter, index) => (
                                <div key={index} className={`letter-box ${letter === ' ' ? 'empty' : 'filled'}`}>
                                    {letter === ' ' ? '' : letter}
                                </div>
                            ))
                        ) : (
                            <p>Chargement en cours...</p>
                        )}
                    </div>
                ))}
            </div>
            <div className="button-container">
                <button type="submit">
                    Deviner
                </button>
            </div>
        </div>
    );
};

export default Game;
