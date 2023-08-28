import './App.css';
import Game from './components/Game/Game';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Popup from './components/LoginPopup/LoginPopup';
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

function App() {
  const [difficulty, setDifficulty] = useState(Cookies.get('difficulty'));
  const [currentList, setCurrentList] = useState(Cookies.get('currentList'));

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
