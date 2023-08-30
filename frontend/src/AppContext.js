import React, { createContext, useContext, useState } from 'react';
import { useEffect } from 'react';
import Cookies from 'js-cookie';

const AppContext = createContext();

export const useAppContext = () => {
    return useContext(AppContext);
};

export const AppProvider = ({ children }) => {
    const [difficulty, setDifficulty] = useState(Cookies.get('difficulty'));
    const [currentList, setCurrentList] = useState(Cookies.get('currentList'));
    const [showWelcomePopup, setShowWelcomePopup] = useState(false);
    const [isGameStart, setIsGameStart] = useState(Cookies.get('isGameStart'));

    useEffect(() => {
        const isFirstVisit = !Cookies.get('visitedBefore');

        if (isFirstVisit) {
            setShowWelcomePopup(true);
            Cookies.set('visitedBefore', 'true', { expires: 365 });
        }

        if (difficulty) {
            Cookies.set('difficulty', difficulty, { expires: 365 });
        }

        if (currentList) {
            Cookies.set('currentList', currentList, { expires: 365 });
        }

        if (isGameStart) {
            Cookies.set('isGameStart', isGameStart, { expires: 365 });
        }

    }, [difficulty, currentList, isGameStart]);

    return (
        <AppContext.Provider
            value={{
                difficulty,
                setDifficulty,
                currentList,
                isGameStart,
                setCurrentList,
                showWelcomePopup,
                setShowWelcomePopup,
                setIsGameStart,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};
