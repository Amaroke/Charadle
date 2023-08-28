import './App.css';
import Game from './components/Game/Game';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Popup from './components/LoginPopup/LoginPopup';
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

function App() {
  const [difficulty, setDifficulty] = useState(null);
  const [currentList, setCurrentList] = useState(null);

  useEffect(() => {
    const difficultyFromCookie = Cookies.get('difficulty');
    const currentListFromCookie = Cookies.get('currentList');

    if (difficultyFromCookie) {
      setDifficulty(difficultyFromCookie);
    }

    if (currentListFromCookie) {
      setCurrentList(currentListFromCookie);
    }
  }, []);

  useEffect(() => {
    if (difficulty) {
      Cookies.set('difficulty', difficulty, { expires: 365 });
    }
  }, [difficulty]);

  useEffect(() => {
    if (currentList) {
      Cookies.set('currentList', currentList, { expires: 365 });
    }
  }, [currentList]);

  return (
    <div className="App">
      <Header
        difficulty={difficulty}
        currentList={currentList}
        setDifficulty={setDifficulty}
        setCurrentList={setCurrentList}
      />
      <Game
        difficulty={difficulty}
        currentList={currentList}
      />
      <Footer />
      <Popup
        difficulty={difficulty}
        currentList={currentList}
        setDifficulty={setDifficulty}
        setCurrentList={setCurrentList}
      />
    </div>
  );
}

export default App;
