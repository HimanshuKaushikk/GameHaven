import React, { createContext, useState, useContext, useEffect } from 'react';
import SoundManager from './SoundManager';

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    theme: 'dark', // 'dark' | 'light'
    volume: 50,
    fps: 60,
    vibration: true,
    ads: true,
  });

  const [scores, setScores] = useState({
    player1: 0,
    player2: 0,
  });

  const [tournament, setTournament] = useState({
    isActive: false,
    currentGameIndex: 0,
    gameQueue: [], // Array of game IDs
    p1Score: 0,
    p2Score: 0,
  });

  // Sound Engine Setup Hook
  useEffect(() => {
    SoundManager.init();
    SoundManager.setVolume(settings.volume);
  }, []);

  // Sync settings volume to SoundManager
  useEffect(() => {
    SoundManager.setVolume(settings.volume);
  }, [settings.volume]);

  // Helper functions
  const updateSettings = (newSettings) => setSettings({ ...settings, ...newSettings });
  const updateScores = (p1, p2) => setScores({ player1: p1, player2: p2 });
  const resetScores = () => setScores({ player1: 0, player2: 0 });
  
  const startTournament = (games) => {
    setTournament({
      isActive: true,
      currentGameIndex: 0,
      gameQueue: games,
      p1Score: 0,
      p2Score: 0,
    });
  };

  const advanceTournament = (winner) => {
    setTournament((prev) => {
      const nextIndex = prev.currentGameIndex + 1;
      const isFinished = nextIndex >= prev.gameQueue.length;
      return {
        ...prev,
        p1Score: prev.p1Score + (winner === 1 ? 1 : 0),
        p2Score: prev.p2Score + (winner === 2 ? 1 : 0),
        currentGameIndex: isFinished ? prev.currentGameIndex : nextIndex,
        isFinished,
      };
    });
  };

  const endTournament = () => {
    setTournament({
      isActive: false,
      currentGameIndex: 0,
      gameQueue: [],
      p1Score: 0,
      p2Score: 0,
    });
  };

  return (
    <GlobalContext.Provider value={{
      settings, updateSettings,
      scores, updateScores, resetScores,
      tournament, startTournament, advanceTournament, endTournament
    }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);
