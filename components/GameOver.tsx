import React from 'react';
import { DEATH_MESSAGES } from '../constants';
import { HighScore } from '../types';
import { getRandomDeathMessage } from '../utils/gameUtils';

interface GameOverProps {
  score: number;
  onRestart: () => void;
  onMenu: () => void;
  highScores: HighScore[];
}

const GameOver: React.FC<GameOverProps> = ({ score, onRestart, onMenu, highScores }) => {
  const message = React.useMemo(() => getRandomDeathMessage(DEATH_MESSAGES), []);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md z-20 p-4 animate-in fade-in duration-300">
      <div className="text-center transform scale-100 animate-in zoom-in-95 duration-200 w-full max-w-md">
        <h2 className="text-5xl md:text-6xl font-bold text-red-500 pixel-font mb-4 drop-shadow-[0_4px_0_rgba(100,0,0,1)]">
          CRASH!
        </h2>
        <p className="text-2xl text-yellow-300 pixel-font mb-2 leading-relaxed px-4">{message}</p>
        
        <div className="my-8">
          <p className="text-slate-400 text-sm uppercase tracking-widest mb-1">Magic Released</p>
          <p className="text-6xl font-mono text-white font-bold text-shadow-glow">
            {score}
          </p>
        </div>

        <div className="flex flex-col gap-3 w-64 mx-auto">
          <button
            onClick={onRestart}
            className="w-full py-4 bg-green-500 hover:bg-green-400 text-black font-bold text-lg md:text-xl rounded shadow-[0_4px_0_#15803d] active:shadow-none active:translate-y-1 transition-all pixel-font"
          >
            TRY AGAIN
          </button>
          <button
            onClick={onMenu}
            className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm md:text-base rounded shadow-[0_4px_0_#334155] active:shadow-none active:translate-y-1 transition-all pixel-font"
          >
            CHANGE HELPER
          </button>
        </div>

        {/* Mini Leaderboard */}
        <div className="mt-8 pt-6 border-t border-white/10 w-full mx-auto">
           <div className="flex justify-between items-center text-xs text-slate-500 uppercase tracking-widest mb-2">
             <span>Recent Best</span>
           </div>
           {highScores.slice(0, 3).map((s, i) => (
             <div key={i} className="flex justify-between text-slate-300 text-sm py-1">
               <span>{s.name}</span>
               <span>{s.score}</span>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default GameOver;