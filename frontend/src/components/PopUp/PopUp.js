import "./PopUp.css";

const PopUp = ({ difficulty, currentList, setDifficulty, setCurrentList, setShowWelcomePopup }) => {
    return (
        <div className="blur-background">
            <div className="popup">
                <div className="popup-content">
                    <h2>Bienvenue sur Charadle !</h2>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla eget justo ut odio viverra vestibulum.</p>
                    <p>Explication de la difficulté : Vous pouvez choisir entre deux difficultés...</p>
                    <div>
                        <button
                            className={`popup-choice-button ${difficulty === 'normal' ? 'active' : ''}`}
                            onClick={() => setDifficulty('normal')}
                        >
                            Normal
                        </button>
                        <button
                            className={`popup-choice-button ${difficulty === 'expert' ? 'active' : ''}`}
                            onClick={() => setDifficulty('expert')}
                        >
                            Expert
                        </button>
                    </div>
                    <p>Explication du choix de la liste : 2-3 lignes de lorem ipsum</p>
                    <div>
                        <button
                            className={`popup-choice-button ${currentList === 'top10' ? 'active' : ''}`}
                            onClick={() => setCurrentList('top10')}
                        >
                            Top 10
                        </button>
                        <button
                            className={`popup-choice-button ${currentList === 'top100' ? 'active' : ''}`}
                            onClick={() => setCurrentList('top100')}
                        >
                            Top 100
                        </button>
                        <button className="popup-choice-button">
                            Saisir un pseudo MAL
                        </button>
                    </div>
                    <div>
                        <button className="popup-choice-button popup-close-button" onClick={() => setShowWelcomePopup(false)}>
                            Annuler
                        </button>
                        <button className="popup-choice-button popup-close-button">
                            Valider
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PopUp;