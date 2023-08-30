import "./KeyboardHints.css"

const KeyboardHints = ({ revealAnime, revealInitials, revealAll, isAnimeNameBlurred, areInitialsVisible, isGameFinished, nextGame, handleKeyPress }) => {
    return (
        <div className="keyboard-hints">
            <button onClick={revealAnime} disabled={isAnimeNameBlurred ? false : true}>Reveal the Anime</button>
            <button onClick={revealInitials} disabled={areInitialsVisible ? true : false}>Show the initial(s)</button>
            <button onClick={revealAll} disabled={isGameFinished ? true : false}>Give up !</button>
            {isGameFinished ? <button className="give-another" onClick={nextGame}>Another character !</button> : <button className="give-another" key={"enter"} onClick={() => handleKeyPress("validate")}>{"Validate"}</button>}
        </div>
    );
};

export default KeyboardHints; 