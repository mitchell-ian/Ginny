
import React from 'react';
import { PLAYERS } from '../constants';
import { PlayerProfile, HighScore } from '../types';

interface MainMenuProps {
  onStart: (player: PlayerProfile) => void;
  highScores: HighScore[];
}

const MainMenu: React.FC<MainMenuProps> = ({ onStart, highScores }) => {
  // Generate static snowflakes for the menu background
  const snowflakes = React.useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      left: `${Math.random() * 100}%`,
      animationDuration: `${3 + Math.random() * 5}s`,
      animationDelay: `${Math.random() * 5}s`,
      opacity: Math.random() * 0.5 + 0.3,
      fontSize: `${Math.random() * 10 + 10}px`
    }));
  }, []);

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0f172a] overflow-hidden">
      {/* Snow Background */}
      {snowflakes.map((flake, i) => (
        <div
          key={i}
          className="snowflake"
          style={{
            left: flake.left,
            animationDuration: flake.animationDuration,
            animationDelay: flake.animationDelay,
            opacity: flake.opacity,
            fontSize: flake.fontSize
          }}
        >
          ❄
        </div>
      ))}

      {/* Decorative Lights Top */}
      <div className="absolute top-0 w-full flex justify-around pointer-events-none">
         {Array.from({length: 12}).map((_,i) => (
           <div key={i} className={`w-3 h-3 rounded-full mt-[-6px] shadow-lg animate-pulse ${
             i % 3 === 0 ? 'bg-red-500 shadow-red-500' : 
             i % 3 === 1 ? 'bg-green-500 shadow-green-500' : 'bg-yellow-400 shadow-yellow-400'
           }`} style={{animationDelay: `${i*0.1}s`}}></div>
         ))}
         <div className="absolute top-0 w-full h-[2px] bg-gray-600"></div>
      </div>

      <div className="bg-red-900/90 border-4 border-yellow-500 rounded-xl shadow-[0_0_50px_rgba(220,38,38,0.5)] w-full max-w-2xl relative flex flex-col md:flex-row overflow-hidden m-4 z-10 backdrop-blur-sm">
        
        {/* Left Side: Ginny Character Art */}
        <div className="w-full md:w-1/3 bg-green-900/50 flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-yellow-500/30 relative">
            <div className="relative w-32 h-32 mt-20"> {/* Moved down significantly to prevent hat clipping */}
                
                {/* Santa Hat (Rebuilt for better alignment) */}
                <div className="absolute -top-16 left-1/2 z-20 flex flex-col items-center transform -translate-x-1/2 -rotate-12 origin-bottom">
                    {/* Pompom */}
                    <div className="w-7 h-7 bg-white rounded-full shadow-sm -mb-2 relative z-30"></div>
                    
                    {/* Triangle */}
                    <div className="w-0 h-0 border-l-[32px] border-l-transparent border-r-[32px] border-r-transparent border-b-[55px] border-b-red-600 relative z-10"></div>
                    
                    {/* Brim */}
                    <div className="w-28 h-8 bg-white rounded-full -mt-4 shadow-md relative z-20"></div>
                </div>

                {/* Gingerbread Head */}
                <div className="w-full h-full bg-[#8D6E63] rounded-full border-4 border-white/20 shadow-xl relative z-10 overflow-hidden">
                     {/* Face details inside overflow hidden if needed, or just background */}
                </div>
                 {/* Face Details overlay */}
                 <div className="absolute inset-0 pointer-events-none z-20">
                    {/* Eyes */}
                    <div className="absolute top-12 left-8 w-3 h-3 bg-white rounded-full"></div>
                    <div className="absolute top-12 right-8 w-3 h-3 bg-white rounded-full"></div>
                    {/* Cheeks */}
                    <div className="absolute top-14 left-5 w-4 h-2 bg-pink-400/20 rounded-full blur-[1px]"></div>
                    <div className="absolute top-14 right-5 w-4 h-2 bg-pink-400/20 rounded-full blur-[1px]"></div>
                    {/* Mouth */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-8 h-4 border-b-4 border-white rounded-full"></div>
                 </div>

                {/* Glow behind */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-yellow-400/20 rounded-full blur-xl animate-pulse -z-10"></div>
            </div>
            
            <div className="mt-4"></div> 
        </div>

        {/* Right Side: Menu Content */}
        <div className="flex-1 p-6 flex flex-col items-center relative">
          
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-2 pixel-font leading-tight relative">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-300 drop-shadow-[2px_2px_0_#b91c1c]">GINNY'S</span><br/>
            <span className="text-yellow-400 drop-shadow-[2px_2px_0_#b45309]">MAGIC DASH</span>
          </h1>
          
          <p className="text-white font-fredoka text-center mb-8 text-sm opacity-90 px-4">
            Ginny is overflowing with holiday magic! Help her shed the excess energy so she can recharge for next year.
          </p>

          <h2 className="text-green-300 font-bold mb-4 pixel-font text-[10px] uppercase tracking-widest">
            Select Your Helper
          </h2>

          <div className="flex gap-4 justify-center mb-8 w-full">
            {PLAYERS.map((player) => (
              <button
                key={player.name}
                onClick={() => onStart(player)}
                className="group relative px-6 py-4 bg-red-950 rounded-xl border-2 border-red-800 hover:border-yellow-400 hover:bg-red-900 transition-all transform hover:-translate-y-1 active:scale-95 flex flex-col items-center shadow-lg"
              >
                <div 
                  className="w-10 h-10 mb-2 rounded-full flex items-center justify-center text-xl shadow-inner border-2 border-white/10"
                  style={{ backgroundColor: player.avatarColor }}
                >
                  {/* @ts-ignore */}
                  {player.icon || '🧸'}
                </div>
                <span className="text-sm font-bold text-white font-fredoka group-hover:text-yellow-200">{player.name}</span>
              </button>
            ))}
          </div>

          {highScores.length > 0 && (
            <div className="w-full bg-black/30 border border-white/10 p-3 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                 <span className="text-yellow-500">🏆</span>
                 <h3 className="text-yellow-100 pixel-font text-[10px] uppercase tracking-wider">Top Scores</h3>
              </div>
              <div className="max-h-20 overflow-y-auto pr-2 custom-scrollbar">
                {highScores.map((score, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs py-1 border-b border-white/10 last:border-0">
                    <span className="text-gray-300 font-fredoka">{score.name}</span>
                    <span className="text-yellow-400 font-mono">{score.score}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
