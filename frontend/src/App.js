import React, { useState, useEffect } from 'react';
import './App.css';
import './petal.css';
import Game from './components/Game/Game';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import PopUp from './components/PopUp/PopUp';
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
        left: Math.random() * window.innerWidth * 0.98 + 'px',
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
