import './App.css';
import Game from './components/Game/Game';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Popup from './components/LoginPopup/LoginPopup';
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

function App() {
  const [difficulty, setDifficulty] = useState(null);
  const [userChoice, setUserChoice] = useState(null);

  useEffect(() => {
    const difficultyFromCookie = Cookies.get('difficulty');
    const userChoiceFromCookie = Cookies.get('userChoice');

    if (difficultyFromCookie) {
      setDifficulty(difficultyFromCookie);
    }

    if (userChoiceFromCookie) {
      setUserChoice(userChoiceFromCookie);
    }
  }, []);

  useEffect(() => {
    if (difficulty) {
      Cookies.set('difficulty', difficulty, { expires: 365 });
    }
  }, [difficulty]);

  useEffect(() => {
    if (userChoice) {
      Cookies.set('userChoice', userChoice, { expires: 365 });
    }
  }, [userChoice]);

  return (
    <div className="App">
      <Header
        difficulty={difficulty}
        userChoice={userChoice}
        setDifficulty={setDifficulty}
        setUserChoice={setUserChoice}
      />
      <Game
        difficulty={difficulty}
        userChoice={userChoice}
      />
      <Footer />
      <Popup
        difficulty={difficulty}
        userChoice={userChoice}
        setDifficulty={setDifficulty}
        setUserChoice={setUserChoice}
      />
    </div>
  );
}

export default App;
