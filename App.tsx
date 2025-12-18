
import React, { useState, useEffect, useRef } from 'react';
import GameCanvas from './components/GameCanvas';
import MainMenu from './components/MainMenu';
import GameOver from './components/GameOver';
import { GameState, PlayerProfile, HighScore, Theme } from './types';
import { Theme as ThemeEnum } from './types';
import { THEME_COLORS } from './constants';

const STORAGE_KEY = 'ginnys-magic-dash-scores';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [currentPlayer, setCurrentPlayer] = useState<PlayerProfile | null>(null);
  const [score, setScore] = useState(0);
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [currentTheme, setCurrentTheme] = useState<Theme>(ThemeEnum.STREET_MORNING);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setHighScores(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to load scores");
      }
    }
  }, []);

  const saveScore = (newScore: number) => {
    if (!currentPlayer) return;
    
    const newEntry: HighScore = {
      name: currentPlayer.name,
      score: newScore,
      date: new Date().toISOString()
    };

    const updated = [...highScores, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); 

    setHighScores(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleStartGame = (player: PlayerProfile) => {
    setCurrentPlayer(player);
    setScore(0);
    setGameState(GameState.PLAYING);
  };

  const handleGameOver = (finalScore: number) => {
    setScore(finalScore);
    saveScore(finalScore);
    setGameState(GameState.GAME_OVER);
  };

  const handleRestart = () => {
    setScore(0);
    setGameState(GameState.PLAYING);
  };

  const handleMenu = () => {
    setGameState(GameState.MENU);
    setCurrentPlayer(null);
  };

  // Level logic handles in GameCanvas via background objects now
  const handleScoreUpdate = (newScore: number) => {
      setScore(newScore);
  };

  const handleCollect = () => {
     // Optional: play sound effect logic here
  };

  const bgStyle = THEME_COLORS[currentTheme].bg;
  
  // Calculate battery charge (0 to 100% based on progress to next 1000)
  const batteryLevel = Math.min(100, (score % 1000) / 10);

  return (
    <div 
      className="fixed inset-0 w-full h-full flex items-center justify-center bg-black"
      style={{ backgroundColor: bgStyle }}
    >
      <div className="aspect-video w-full h-full max-h-full max-w-full relative shadow-2xl overflow-hidden bg-black">
        
        {/* Game HUD */}
        {gameState === GameState.PLAYING && (
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10 pointer-events-none">
             <div className="flex flex-col">
               <span className="text-white/80 text-xs uppercase tracking-widest font-bold drop-shadow-md text-shadow-sm">Magic Released</span>
               <span className="text-4xl font-mono text-white font-bold drop-shadow-md">{score}</span>
             </div>
             
             <div className="flex items-center gap-4">
                 {/* Battery Indicator */}
                 <div className="flex flex-col items-end">
                    <span className="text-yellow-300 text-[10px] uppercase font-bold mb-1 drop-shadow-md">Recharge Battery</span>
                    <div className="relative w-32 h-8 border-4 border-white/50 bg-black/40 rounded-lg backdrop-blur-sm overflow-hidden p-1">
                        <div 
                            className="h-full bg-gradient-to-r from-green-400 to-green-600 shadow-[0_0_15px_rgba(74,222,128,0.5)] transition-all duration-300 ease-out"
                            style={{ width: `${batteryLevel}%` }}
                        ></div>
                        {/* Battery tip */}
                        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-2 h-4 bg-white/50 rounded-r-sm"></div>
                        {/* Percentage text */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-bold text-white drop-shadow-md">{Math.floor(batteryLevel)}%</span>
                        </div>
                    </div>
                 </div>

                 {currentPlayer && (
                    <div className="hidden md:block bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
                       <span className="text-white font-fredoka text-sm shadow-black drop-shadow-md">Runner: <strong>{currentPlayer.name}</strong></span>
                    </div>
                 )}
             </div>
          </div>
        )}

        <GameCanvas 
          gameState={gameState} 
          onGameOver={handleGameOver}
          onScoreUpdate={handleScoreUpdate}
          onThemeUpdate={setCurrentTheme}
          onCollect={handleCollect}
          playerName={currentPlayer?.name || 'Guest'}
        />

        {gameState === GameState.MENU && (
          <MainMenu onStart={handleStartGame} highScores={highScores} />
        )}

        {gameState === GameState.GAME_OVER && (
          <GameOver 
            score={score} 
            onRestart={handleRestart} 
            onMenu={handleMenu}
            highScores={highScores}
          />
        )}
      </div>
    </div>
  );
};

export default App;
