import React, { useState, useEffect } from 'react';
import './app.css';
import './petal.css';
import Game from './components/game/Game';
import Header from './components/header/Header';
import Footer from './components/footer/Footer';
import PopUp from './components/pop_up/PopUp';
import { useAppContext } from './AppContext';

function App() {
  const [petals, setPetals] = useState([]);

  const {
    showWelcomePopup,
  } = useAppContext();

  useEffect(() => {
    const generatedPetals = [];
    for (let i = 0; i < 50; i++) {
      generatedPetals.push({
        type: Math.floor(Math.random() * 3) + 1,
        left: Math.random() * window.innerWidth * 0.95 + 'px',
        animationDelay: Math.random() * 10 + 's',
      });
    }
    setPetals(generatedPetals);
  }, []);

  return (
    <div className="App">
      {showWelcomePopup && <PopUp />}
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
      <Header />
      <Game />
      <Footer />
    </div>
  );
}

export default App;
