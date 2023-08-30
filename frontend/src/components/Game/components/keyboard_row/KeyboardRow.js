const KeyboardRow = ({ letters, handleKeyPress }) => {
    return (
        <div className="keyboard-row">
            {letters.map(letter => (
                <button key={letter} onClick={() => handleKeyPress(letter)}>{letter}</button>
            ))}
        </div>
    );
};

export default KeyboardRow;