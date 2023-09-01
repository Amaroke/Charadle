import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppProvider = ({ children }) => {
  const [difficulty, setDifficulty] = useState(localStorage.getItem('difficulty') || '');
  const [currentList, setCurrentList] = useState(localStorage.getItem('currentList') || '');
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [isGameStart, setIsGameStart] = useState(localStorage.getItem('isGameStart') || '');

  useEffect(() => {
    const isFirstVisit = !localStorage.getItem('visitedBefore');

    if (isFirstVisit) {
      setShowWelcomePopup(true);
      localStorage.setItem('visitedBefore', 'true');
    }

    if (difficulty) {
      localStorage.setItem('difficulty', difficulty);
    }

    if (currentList) {
      localStorage.setItem('currentList', currentList);
    }

    if (isGameStart) {
      localStorage.setItem('isGameStart', isGameStart);
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
