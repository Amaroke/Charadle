import './App.css';
import './petal.css';
import Game from './components/Game/Game';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import PopUp from './components/PopUp/PopUp';
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

function App() {
  const [difficulty, setDifficulty] = useState(Cookies.get('difficulty'));
  const [currentList, setCurrentList] = useState(Cookies.get('currentList'));
  const [petals, setPetals] = useState([]);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);

  useEffect(() => {
    const generatedPetals = [];
    for (let i = 0; i < 50; i++) {
      generatedPetals.push({
        type: Math.floor(Math.random() * 3) + 1,
        left: Math.random() * window.innerWidth * 0.98 + 'px',
        animationDelay: Math.random() * 10 + 's',
      });
    }
    setPetals(generatedPetals);

    const isFirstVisit = !Cookies.get('visitedBefore');

    if (isFirstVisit) {
      setShowWelcomePopup(true);

      Cookies.set('visitedBefore', 'true', { expires: 365 });
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
      {showWelcomePopup && <PopUp
        difficulty={difficulty}
        currentList={currentList}
        setDifficulty={setDifficulty}
        setCurrentList={setCurrentList}
        setShowWelcomePopup={setShowWelcomePopup}
      />}
      {petals.map((petal, index) => (
        <div
          className={"petal" + petal.type}
          key={index}
          style={{
            left: petal.left,
            animationDelay: petal.animationDelay,
          }}
        ></div>
      ))}
      <Header
        difficulty={difficulty}
        currentList={currentList}
        setDifficulty={setDifficulty}
        setCurrentList={setCurrentList}
      />
      <Game
        difficulty={difficulty}
        currentList={currentList}
        showWelcomePopUp={showWelcomePopup}
      />
      <Footer />
    </div>
  );
}

export default App;
