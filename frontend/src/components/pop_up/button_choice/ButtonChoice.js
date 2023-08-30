import React from 'react';
import './buttonChoice.css';

const ButtonChoice = ({ text, isActive, onClick }) => {
    return (
        <button
            className={`popup-choice-button ${isActive ? 'active' : ''}`}
            onClick={onClick}
        >
            {text}
        </button>
    );
};

export default ButtonChoice;