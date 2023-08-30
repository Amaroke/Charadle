const CharacterInfo = ({ characterName, animeName, areInitialsVisible, isAnimeNameBlurred, isGameFinished }) => {
    return (
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
    );
};

export default CharacterInfo;