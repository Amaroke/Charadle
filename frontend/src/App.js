import './App.css';
import Game from './components/Game/Game';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

function App() {
  const [difficulty, setDifficulty] = useState('easy');
  const [currentList, setCurrentList] = useState('top10');

  useEffect(() => {
    const storedDifficulty = Cookies.get('difficulty');
    if (storedDifficulty) {
      setDifficulty(storedDifficulty);
    }
  }, []);

  useEffect(() => {
    const storedCurrentList = Cookies.get('currentList');
    if (storedCurrentList) {
      setCurrentList(storedCurrentList);
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
    </div>
  );
}

export default App;
