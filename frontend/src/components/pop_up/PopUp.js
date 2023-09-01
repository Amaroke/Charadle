import "./popUp.css";
import { useAppContext } from '../../AppContext';
import ButtonChoice from "./button_choice/ButtonChoice";

const PopUp = () => {

    const {
        difficulty,
        currentList,
        setDifficulty,
        setCurrentList,
        setShowWelcomePopup,
    } = useAppContext();

    const handlePseudoInputChange = (e) => {
        setCurrentList(e.target.value);
    };

    const handleValidateButtonClick = () => {
        setShowWelcomePopup(false);
        localStorage.setItem('isGameStart', true);
        window.location.reload();
    };

    return (
        <div className="blur-background">
            <div className="popup">
                <div className="popup-content">
                    <h1>🌸 Welcome to Charadle ! 🌸</h1>
                    <p>Charadle is a fun little website where you take a shot at guessing the anime character on the right. You've got endless tries!</p>
                    <p>There are two difficulty levels that affect the characters you'll be trying to guess. In 'Normal,' you'll encounter only the main characters, while in 'Expert,' every character is up for the challenge.</p>
                    <div>
                        <ButtonChoice
                            text="Normal ! 🙂"
                            isActive={difficulty === 'normal'}
                            onClick={() => setDifficulty('normal')}
                        />
                        <ButtonChoice
                            text="Expert ! 😈"
                            isActive={difficulty === 'expert'}
                            onClick={() => setDifficulty('expert')}
                        />
                    </div>
                    <p>After that, you can select the anime list you'd like to play with, either the Top 10 or the Top 100 anime ranked by popularity on MyAnimeList.</p>
                    <div>
                        <div>
                            <ButtonChoice
                                text="Top 10"
                                isActive={currentList === 'top10'}
                                onClick={() => setCurrentList('top10')}
                            />
                            <ButtonChoice
                                text="Top 100"
                                isActive={currentList === 'top100'}
                                onClick={() => setCurrentList('top100')}
                            />
                            <input
                                type="text"
                                placeholder="Input MAL pseudo"
                                value={currentList === 'top100' || currentList === 'top10' ? '' : currentList}
                                onChange={handlePseudoInputChange}
                                className={"popup-choice-button" + (currentList === 'top100' || currentList === 'top10' || currentList == null ? "" : " active")}
                            />
                        </div>


                    </div>
                    <p>When everything is ready, you can hit 'Let's play !', and don't worry, you'll be able to change these settings later!</p>
                    <div>
                        <button
                            disabled={
                                (difficulty && currentList) ? false : true
                            }
                            className="popup-choice-button popup-close-button"
                            onClick={handleValidateButtonClick}
                        >
                            Let's play !
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PopUp;
