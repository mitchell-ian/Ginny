
import React, { useEffect, useRef } from 'react';
import { GameState, Entity, Obstacle, Collectible, Particle, Theme, SnowFlake, SantaState, BackgroundObject } from '../types';
import { CONFIG, GAME_WIDTH, GAME_HEIGHT, THEME_COLORS } from '../constants';
import { checkCollision, generateObstacle, generateCollectible, getThemeForScore } from '../utils/gameUtils';

interface GameCanvasProps {
  gameState: GameState;
  onGameOver: (score: number) => void;
  onScoreUpdate: (score: number) => void;
  onThemeUpdate: (theme: Theme) => void;
  onCollect: () => void; 
  playerName: string;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  gameState, 
  onGameOver, 
  onScoreUpdate,
  onThemeUpdate,
  onCollect,
  playerName 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const scoreRef = useRef<number>(0);
  const themeRef = useRef<Theme>(Theme.STREET_MORNING);
  
  const playerRef = useRef<{
    x: number;
    y: number;
    width: number;
    height: number;
    dy: number;
    isJumping: boolean;
    rotation: number;
    legAngle: number; 
  }>({
    x: 100,
    y: CONFIG.groundHeight - 50,
    width: 30,
    height: 50,
    dy: 0,
    isJumping: false,
    rotation: 0,
    legAngle: 0,
  });

  const obstaclesRef = useRef<Obstacle[]>([]);
  const collectiblesRef = useRef<Collectible[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const snowRef = useRef<SnowFlake[]>([]);
  const backgroundObjectsRef = useRef<BackgroundObject[]>([]);
  const santaRef = useRef<SantaState>({ active: false, x: GAME_WIDTH, y: 50 });
  const streamersRef = useRef<{x: number, y: number, color: string, phase: number}[]>([]);
  const nextLevelSignRef = useRef<number>(1); // Track next level sign to spawn
  
  const speedRef = useRef<number>(CONFIG.baseSpeed);
  const frameCountRef = useRef<number>(0);
  const totalDistanceRef = useRef<number>(0); 
  
  const inputRef = useRef({
    isHoldingJump: false,
    jumpBuffer: 0,
  });

  const spawnTimerRef = useRef<number>(0);
  const collectibleTimerRef = useRef<number>(0);

  useEffect(() => {
    // Fill snow
    for(let i=0; i<200; i++) {
        snowRef.current.push({
            x: Math.random() * GAME_WIDTH,
            y: Math.random() * GAME_HEIGHT,
            size: Math.random() * 3 + 1,
            speed: Math.random() * 2 + 1,
            swing: Math.random() * Math.PI * 2,
            color: '#fff' // Default white snow
        });
    }

    // Init Streamers
    for(let i=0; i<10; i++) {
        streamersRef.current.push({
            x: Math.random() * GAME_WIDTH,
            y: Math.random() * (GAME_HEIGHT/2),
            color: `hsl(${Math.random() * 360}, 100%, 50%)`,
            phase: Math.random() * Math.PI * 2
        });
    }
    
    // Initial Background Filling
    for (let i = 0; i < GAME_WIDTH + 200; i += 100) {
        spawnBackgroundObject(i);
    }

    const handleStart = () => {
      inputRef.current.isHoldingJump = true;
      inputRef.current.jumpBuffer = 6;
    };

    const handleEnd = () => {
      inputRef.current.isHoldingJump = false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        inputRef.current.isHoldingJump = true;
        inputRef.current.jumpBuffer = 6;
        e.preventDefault();
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        inputRef.current.isHoldingJump = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('touchstart', handleStart, { passive: false });
    window.addEventListener('touchend', handleEnd);
    window.addEventListener('mousedown', handleStart);
    window.addEventListener('mouseup', handleEnd);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('touchstart', handleStart);
      window.removeEventListener('touchend', handleEnd);
      window.removeEventListener('mousedown', handleStart);
      window.removeEventListener('mouseup', handleEnd);
    };
  }, []);

  const spawnBackgroundObject = (xOffset: number, forcedType?: BackgroundObject['type'], forcedLevelNum?: number) => {
      // Force spawn for level signs
      if (forcedType === 'level_sign') {
        backgroundObjectsRef.current.push({
            x: xOffset,
            y: CONFIG.groundHeight,
            type: 'level_sign',
            width: 40,
            height: 80,
            variant: 0,
            levelNumber: forcedLevelNum
        });
        return;
      }

      const typeRoll = Math.random();
      let type: BackgroundObject['type'] = 'house';
      let width = 80;
      let height = 100 + Math.random() * 50;
      let variant = Math.floor(Math.random() * 5);

      if (typeRoll < 0.45) {
          type = 'house';
      } else if (typeRoll < 0.55) {
          type = 'shop';
          width = 100;
          height = 80 + Math.random() * 30;
      } else if (typeRoll < 0.6) {
          type = 'gingerbread_house';
          width = 90;
          height = 90;
      } else if (typeRoll < 0.7) {
          type = 'market_stall';
          width = 70;
          height = 60;
      } else if (typeRoll < 0.85) {
          type = 'tree';
          width = 60;
          height = 120 + Math.random() * 40;
      } else if (typeRoll < 0.95) {
          type = 'snowman';
          width = 40;
          height = 50;
      } else {
          type = 'lamp';
          width = 10;
          height = 120;
      }

      const lastObj = backgroundObjectsRef.current[backgroundObjectsRef.current.length - 1];
      const startX = lastObj ? lastObj.x + lastObj.width + 20 + Math.random() * 50 : xOffset;

      backgroundObjectsRef.current.push({
          x: startX,
          y: CONFIG.groundHeight, 
          type,
          width,
          height,
          variant
      });
  };

  const resetGame = () => {
    playerRef.current = {
      x: 100,
      y: CONFIG.groundHeight - 50,
      width: 30,
      height: 50,
      dy: 0,
      isJumping: false,
      rotation: 0,
      legAngle: 0,
    };
    obstaclesRef.current = [];
    collectiblesRef.current = [];
    particlesRef.current = [];
    santaRef.current = { active: false, x: GAME_WIDTH, y: 50 };
    speedRef.current = CONFIG.baseSpeed;
    scoreRef.current = 0;
    frameCountRef.current = 0;
    totalDistanceRef.current = 0;
    spawnTimerRef.current = 0;
    collectibleTimerRef.current = 0;
    themeRef.current = Theme.STREET_MORNING;
    nextLevelSignRef.current = 1;
    inputRef.current.jumpBuffer = 0;
    inputRef.current.isHoldingJump = false;
    
    backgroundObjectsRef.current = [];
    for (let i = 0; i < GAME_WIDTH + 200; i += 100) {
        spawnBackgroundObject(i);
    }
    
    onThemeUpdate(Theme.STREET_MORNING);
    onScoreUpdate(0);
  };

  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      resetGame();
      requestRef.current = requestAnimationFrame(gameLoop);
    } else {
      cancelAnimationFrame(requestRef.current);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameState]);

  const update = () => {
    const player = playerRef.current;
    
    // Theme Update
    const newTheme = getThemeForScore(scoreRef.current);
    if (newTheme !== themeRef.current) {
      themeRef.current = newTheme;
      onThemeUpdate(newTheme);
    }

    // --- Santa Logic ---
    if (!santaRef.current.active && frameCountRef.current % 1500 === 600) {
        santaRef.current.active = true;
        santaRef.current.x = GAME_WIDTH + 200;
        santaRef.current.y = 40 + Math.random() * 60;
    }
    if (santaRef.current.active) {
        santaRef.current.x -= 2.5; 
        if (santaRef.current.x < -400) {
            santaRef.current.active = false;
        }
    }

    // --- Physics & Input ---
    const onGround = player.y + player.height >= CONFIG.groundHeight;
    const wantsToJump = inputRef.current.jumpBuffer > 0 || (inputRef.current.isHoldingJump && onGround);

    if (wantsToJump && onGround) {
       player.dy = CONFIG.jumpForce;
       player.isJumping = true;
       inputRef.current.jumpBuffer = 0;
       
       for(let i=0; i<5; i++) {
         particlesRef.current.push({
           x: player.x + player.width/2,
           y: player.y + player.height,
           width: 4,
           height: 4,
           color: '#e5e7eb',
           vx: (Math.random() - 0.5) * 4,
           vy: Math.random() * 2,
           life: 15,
           maxLife: 15
         });
       }
    }
    if (inputRef.current.jumpBuffer > 0) inputRef.current.jumpBuffer--;

    player.dy += CONFIG.gravity;
    player.y += player.dy;

    if (onGround) {
        player.legAngle = Math.sin(frameCountRef.current * 0.4) * 0.6;
        player.rotation = 0;
    } else {
        player.legAngle = 0.5; 
        player.rotation += 0.05; 
    }

    if (player.y + player.height > CONFIG.groundHeight) {
      player.y = CONFIG.groundHeight - player.height;
      player.dy = 0;
      player.isJumping = false;
    }

    // Speed & World
    speedRef.current += CONFIG.speedIncrement;
    totalDistanceRef.current += speedRef.current;

    // Background Management
    const bgSpeed = speedRef.current * 0.5; 
    for (let i = backgroundObjectsRef.current.length - 1; i >= 0; i--) {
        const obj = backgroundObjectsRef.current[i];
        obj.x -= bgSpeed;
        if (obj.x + obj.width < -100) {
            backgroundObjectsRef.current.splice(i, 1);
        }
    }

    // Logic to spawn background objects (Random or Level Sign)
    const lastObj = backgroundObjectsRef.current[backgroundObjectsRef.current.length - 1];
    const nextLevelScore = nextLevelSignRef.current * 1000;
    
    if (scoreRef.current >= nextLevelScore && lastObj && lastObj.x < GAME_WIDTH + 50) {
        spawnBackgroundObject(GAME_WIDTH + 150, 'level_sign', nextLevelSignRef.current + 1);
        nextLevelSignRef.current++;
    } 
    else if (lastObj && lastObj.x < GAME_WIDTH + 50) {
        spawnBackgroundObject(GAME_WIDTH + 100);
    }

    // Snow - Update
    snowRef.current.forEach((flake, index) => {
        flake.y += flake.speed;
        flake.x -= speedRef.current * 0.1; 
        flake.x += Math.sin(frameCountRef.current * 0.05 + flake.swing) * 0.5;
        
        // Confetti logic for Merry Mode
        if (themeRef.current === Theme.MERRY_MODE) {
           flake.color = `hsl(${(index * 30 + frameCountRef.current) % 360}, 100%, 50%)`;
        } else {
           flake.color = '#fff';
        }
        
        if (flake.y > GAME_HEIGHT) {
            flake.y = -10;
            flake.x = Math.random() * GAME_WIDTH;
        }
        if (flake.x < 0) flake.x = GAME_WIDTH;
    });

    scoreRef.current += 1;
    if (frameCountRef.current % 10 === 0) {
        onScoreUpdate(Math.floor(scoreRef.current));
    }

    // Spawning Obstacles
    spawnTimerRef.current -= 1;
    if (spawnTimerRef.current <= 0) {
      const minSpawnTime = 40; 
      const randomVar = Math.random() * 50;
      spawnTimerRef.current = (minSpawnTime + randomVar) - (speedRef.current * 1.5);
      if (spawnTimerRef.current < 25) spawnTimerRef.current = 25;

      obstaclesRef.current.push(generateObstacle(speedRef.current, themeRef.current));
    }

    // Spawning Collectibles
    collectibleTimerRef.current -= 1;
    if (collectibleTimerRef.current <= 0) {
      collectiblesRef.current.push(generateCollectible(speedRef.current));
      collectibleTimerRef.current = 80 + Math.random() * 150; 
    }

    const playerHitbox = {
        x: player.x + 8,
        y: player.y + 4,
        width: player.width - 16,
        height: player.height - 8
    };

    // Obstacles Update
    for (let i = obstaclesRef.current.length - 1; i >= 0; i--) {
      const obs = obstaclesRef.current[i];
      obs.x -= speedRef.current;
      
      const obsHitbox = {
          x: obs.x + 4,
          y: obs.y + 4,
          width: obs.width - 8,
          height: obs.height - 8
      };

      if (checkCollision(playerHitbox, obsHitbox)) {
        onGameOver(Math.floor(scoreRef.current));
        cancelAnimationFrame(requestRef.current);
        return;
      }
      if (obs.x + obs.width < 0) {
        obstaclesRef.current.splice(i, 1);
      }
    }

    // Collectibles Update
    for (let i = collectiblesRef.current.length - 1; i >= 0; i--) {
      const c = collectiblesRef.current[i];
      c.x -= speedRef.current;
      c.y = c.baseY + Math.sin(frameCountRef.current * 0.1 + c.floatOffset) * 5;

      const colHitbox = {
          x: c.x, y: c.y, width: c.width, height: c.height
      };
      
      if (!c.collected && checkCollision(playerHitbox, colHitbox)) {
          c.collected = true;
          scoreRef.current += 50; // Bonus points
          onCollect();
          // Sparkle particles
          for(let k=0; k<8; k++) {
              particlesRef.current.push({
                  x: c.x + c.width/2,
                  y: c.y + c.height/2,
                  width: 5,
                  height: 5,
                  color: c.subtype === 'star' ? '#fde047' : '#fbbf24',
                  vx: (Math.random() - 0.5) * 8,
                  vy: (Math.random() - 0.5) * 8,
                  life: 20,
                  maxLife: 20
              });
          }
      }

      if (c.collected) {
          collectiblesRef.current.splice(i, 1);
      } else if (c.x + c.width < 0) {
          collectiblesRef.current.splice(i, 1);
      }
    }

    // Particles
    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const p = particlesRef.current[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 1;
      p.width *= 0.9;
      p.height *= 0.9;
      if (p.life <= 0) particlesRef.current.splice(i, 1);
    }

    frameCountRef.current++;
  };

  const drawGingerbread = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, angle: number) => {
    // Magic Radiation
    ctx.save();
    ctx.translate(x + w/2, y + h/2);
    
    // Pulsing aura
    const pulse = Math.sin(frameCountRef.current * 0.2) * 5 + 20;
    const gradient = ctx.createRadialGradient(0, 0, 10, 0, 0, pulse + 15);
    gradient.addColorStop(0, 'rgba(255, 215, 0, 0.6)');
    gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, pulse + 20, 0, Math.PI * 2);
    ctx.fill();

    if (frameCountRef.current % 3 === 0) {
        particlesRef.current.push({
            x: x + Math.random() * w,
            y: y + Math.random() * h,
            width: 2, height: 2,
            color: '#fbbf24',
            vx: -2 - Math.random(),
            vy: (Math.random() - 0.5),
            life: 10, maxLife: 10
        });
    }

    ctx.restore();

    ctx.save();
    ctx.translate(x + w/2, y + h/2);
    ctx.rotate(angle);

    const brown = '#8D6E63'; 
    const icing = '#fff';
    const button = '#ef4444'; 
    
    ctx.fillStyle = brown;
    ctx.beginPath();
    ctx.arc(0, -h/3, w/2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillRect(-w/2 + 4, -h/4, w - 8, h/2 + 5);

    ctx.beginPath();
    ctx.lineCap = 'round';
    ctx.lineWidth = 8;
    ctx.strokeStyle = brown;
    ctx.moveTo(-w/4, -h/6);
    ctx.lineTo(-w, 0); 
    ctx.moveTo(w/4, -h/6);
    ctx.lineTo(w, 0); 
    ctx.stroke();

    ctx.beginPath();
    const legAngle = playerRef.current.legAngle;
    ctx.moveTo(-w/4, h/4);
    ctx.lineTo(-w/2 - (Math.sin(legAngle)*8), h/2); 
    ctx.moveTo(w/4, h/4);
    ctx.lineTo(w/2 + (Math.sin(legAngle)*8), h/2); 
    ctx.stroke();

    ctx.strokeStyle = icing;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-w + 2, 0); ctx.lineTo(-w + 2, 2); ctx.stroke(); 
    ctx.beginPath(); ctx.moveTo(w - 2, 0); ctx.lineTo(w - 2, 2); ctx.stroke(); 
    
    ctx.fillStyle = icing;
    ctx.beginPath(); ctx.arc(-5, -h/3 - 2, 2.5, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(5, -h/3 - 2, 2.5, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(0, -h/3 + 4, 3, 0, Math.PI, false); ctx.stroke(); 

    ctx.fillStyle = button;
    ctx.beginPath(); ctx.arc(0, -h/6 + 5, 3, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#22c55e'; 
    ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI*2); ctx.fill();

    ctx.restore();
  };

  const drawCollectible = (ctx: CanvasRenderingContext2D, c: Collectible) => {
      ctx.save();
      ctx.translate(c.x + c.width/2, c.y + c.height/2);
      
      if (c.subtype === 'present') {
          // Present box
          ctx.fillStyle = '#1e40af'; // Blue box
          ctx.fillRect(-12, -12, 24, 24);
          // Ribbon
          ctx.fillStyle = '#f59e0b'; // Gold ribbon
          ctx.fillRect(-4, -12, 8, 24);
          ctx.fillRect(-12, -4, 24, 8);
      } else if (c.subtype === 'star') {
          // Star
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          for(let i=0; i<5; i++) {
              ctx.lineTo(Math.cos((18+i*72)/180*Math.PI)*15, -Math.sin((18+i*72)/180*Math.PI)*15);
              ctx.lineTo(Math.cos((54+i*72)/180*Math.PI)*6, -Math.sin((54+i*72)/180*Math.PI)*6);
          }
          ctx.closePath();
          ctx.fill();
      } else {
          // Candy Cane
          ctx.strokeStyle = '#ef4444'; // Red
          ctx.lineWidth = 6;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(0, 10);
          ctx.lineTo(0, -5);
          ctx.bezierCurveTo(0, -15, -15, -15, -15, -5);
          ctx.stroke();
          
          ctx.strokeStyle = '#ffffff'; 
          ctx.lineWidth = 6;
          ctx.setLineDash([5, 5]); 
          ctx.lineDashOffset = 2;
          ctx.stroke();
      }
      ctx.restore();
  };

  const drawObstacle = (ctx: CanvasRenderingContext2D, obs: Obstacle) => {
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(obs.x + 5, obs.y + obs.height - 5, obs.width, 5);

      if (obs.typeId === 'car') {
          ctx.fillStyle = obs.color; 
          ctx.fillRect(obs.x, obs.y + 12, obs.width, obs.height - 12);
          
          const roofWidth = obs.width - 30;
          const roofX = obs.x + 15;
          const roofHeight = 15;
          
          ctx.fillRect(roofX, obs.y, 5, roofHeight); 
          ctx.fillRect(roofX + roofWidth - 5, obs.y, 5, roofHeight); 
          ctx.fillRect(roofX, obs.y, roofWidth, 3); 
          
          ctx.fillStyle = '#93c5fd'; 
          ctx.fillRect(roofX + 5, obs.y + 3, roofWidth - 10, roofHeight - 3);

          ctx.fillStyle = '#1f2937';
          ctx.beginPath(); ctx.arc(obs.x + 18, obs.y + obs.height, 7, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(obs.x + obs.width - 18, obs.y + obs.height, 7, 0, Math.PI*2); ctx.fill();
          
          ctx.fillStyle = '#d1d5db';
          ctx.beginPath(); ctx.arc(obs.x + 18, obs.y + obs.height, 3, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(obs.x + obs.width - 18, obs.y + obs.height, 3, 0, Math.PI*2); ctx.fill();

      } else if (obs.typeId === 'bin') {
          ctx.fillStyle = '#4b5563'; 
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
          ctx.fillStyle = '#374151'; 
          ctx.fillRect(obs.x - 2, obs.y, obs.width + 4, 8);
          ctx.fillStyle = '#000';
          ctx.beginPath(); ctx.arc(obs.x + 5, obs.y + obs.height, 5, 0, Math.PI*2); ctx.fill();
          ctx.fillStyle = '#6b7280';
          ctx.fillRect(obs.x + 5, obs.y + 15, obs.width - 10, 2);
          ctx.fillRect(obs.x + 5, obs.y + 25, obs.width - 10, 2);
      } else if (obs.typeId === 'postbox') {
          ctx.fillStyle = '#dc2626'; 
          ctx.beginPath();
          ctx.arc(obs.x + obs.width/2, obs.y + obs.width/2, obs.width/2, Math.PI, 0); 
          ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
          ctx.lineTo(obs.x, obs.y + obs.height);
          ctx.fill();
          ctx.fillStyle = '#000'; 
          ctx.fillRect(obs.x - 2, obs.y + obs.height - 5, obs.width + 4, 5);
          ctx.fillStyle = '#fff'; 
          ctx.fillRect(obs.x + obs.width/2 - 6, obs.y + 25, 12, 10);
          ctx.fillStyle = '#000'; 
          ctx.fillRect(obs.x + obs.width/2 - 8, obs.y + 15, 16, 4);
      } else if (obs.typeId === 'fence') {
          ctx.fillStyle = '#fff';
          const posts = 3;
          const w = obs.width / posts;
          for(let i=0; i<posts; i++) {
              ctx.fillRect(obs.x + (i*w) + 2, obs.y, w-4, obs.height);
              ctx.beginPath();
              ctx.moveTo(obs.x + (i*w) + 2, obs.y);
              ctx.lineTo(obs.x + (i*w) + (w/2), obs.y - 10);
              ctx.lineTo(obs.x + (i*w) + w - 2, obs.y);
              ctx.fill();
          }
          ctx.fillRect(obs.x, obs.y + 15, obs.width, 5);
          ctx.fillRect(obs.x, obs.y + 30, obs.width, 5);
      } else if (obs.typeId === 'cone') {
          ctx.fillStyle = '#f97316'; 
          ctx.beginPath();
          ctx.moveTo(obs.x + obs.width/2, obs.y);
          ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
          ctx.lineTo(obs.x, obs.y + obs.height);
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.fillRect(obs.x + 10, obs.y + 10, obs.width - 20, 5);
          ctx.fillStyle = '#000';
          ctx.fillRect(obs.x - 2, obs.y + obs.height - 4, obs.width + 4, 4);
      } else if (obs.typeId === 'barrier') {
          ctx.fillStyle = '#ef4444'; 
          ctx.fillRect(obs.x, obs.y, obs.width, 4); 
          ctx.fillRect(obs.x, obs.y + obs.height - 4, obs.width, 4); 
          ctx.fillRect(obs.x, obs.y, 4, obs.height); 
          ctx.fillRect(obs.x + obs.width - 4, obs.y, 4, obs.height);
          ctx.fillStyle = '#fff';
          ctx.fillRect(obs.x + 4, obs.y + 4, obs.width - 8, obs.height - 8);
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.moveTo(obs.x + 10, obs.y + 4);
          ctx.lineTo(obs.x + 20, obs.y + obs.height - 4);
          ctx.lineTo(obs.x + 30, obs.y + obs.height - 4);
          ctx.lineTo(obs.x + 20, obs.y + 4);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(obs.x + 40, obs.y + 4);
          ctx.lineTo(obs.x + 50, obs.y + obs.height - 4);
          ctx.lineTo(obs.x + 60, obs.y + obs.height - 4);
          ctx.lineTo(obs.x + 50, obs.y + 4);
          ctx.fill();
      }
  };

  const drawSanta = (ctx: CanvasRenderingContext2D) => {
      const s = santaRef.current;
      if (!s.active) return;
      ctx.save();
      ctx.translate(s.x, s.y);
      
      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      ctx.moveTo(10, 20);
      ctx.bezierCurveTo(10, 35, 40, 35, 50, 20); 
      ctx.lineTo(50, 10);
      ctx.lineTo(0, 10);
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(55, 10);
      ctx.quadraticCurveTo(55, 40, 10, 40);
      ctx.lineTo(-5, 30);
      ctx.stroke();

      ctx.fillStyle = '#854d0e';
      ctx.beginPath();
      ctx.arc(35, 5, 10, 0, Math.PI*2);
      ctx.fill();

      ctx.fillStyle = '#b91c1c'; 
      ctx.fillRect(10, 0, 20, 20);
      ctx.fillStyle = '#fff'; 
      ctx.beginPath(); ctx.arc(20, 5, 5, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#fca5a5'; 
      ctx.beginPath(); ctx.arc(20, 0, 4, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#b91c1c'; 
      ctx.beginPath(); ctx.moveTo(16, -3); ctx.lineTo(20, -10); ctx.lineTo(24, -3); ctx.fill();

      const drawReindeer = (rx: number, ry: number, isRudolph: boolean) => {
          ctx.fillStyle = '#78350f';
          ctx.fillRect(rx, ry, 25, 12); 
          ctx.fillRect(rx - 5, ry - 10, 8, 15); 
          ctx.beginPath(); ctx.arc(rx - 5, ry - 12, 6, 0, Math.PI*2); ctx.fill(); 
          ctx.strokeStyle = '#fde047';
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(rx - 5, ry - 15); ctx.lineTo(rx - 8, ry - 22); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(rx - 5, ry - 15); ctx.lineTo(rx - 2, ry - 22); ctx.stroke();
          ctx.fillStyle = '#78350f';
          ctx.fillRect(rx, ry + 12, 4, 8);
          ctx.fillRect(rx + 20, ry + 12, 4, 8);
          if (isRudolph) {
              ctx.fillStyle = '#ef4444';
              ctx.beginPath(); ctx.arc(rx - 11, ry - 12, 2.5, 0, Math.PI*2); ctx.fill();
              ctx.shadowColor = 'red'; ctx.shadowBlur = 5; ctx.fill(); ctx.shadowBlur = 0;
          }
      };

      ctx.strokeStyle = '#92400e';
      ctx.beginPath(); ctx.moveTo(0, 20); ctx.lineTo(-40, 25); ctx.lineTo(-80, 25); ctx.stroke();

      drawReindeer(-40, 20, false);
      drawReindeer(-80, 18, true);

      ctx.restore();
  };

  const drawBackgroundObjects = (ctx: CanvasRenderingContext2D) => {
      backgroundObjectsRef.current.forEach(obj => {
          const x = obj.x;
          const y = obj.y;
          const isParty = themeRef.current === Theme.NEON_AVENUE || themeRef.current === Theme.HYPER_SPEED || themeRef.current === Theme.MERRY_MODE;
          const isMerry = themeRef.current === Theme.MERRY_MODE;

          if (obj.type === 'level_sign') {
              // Draw Level Signpost
              const postH = 80;
              const signW = 60;
              const signH = 40;
              
              ctx.fillStyle = '#5c2b0c'; // Dark wood post
              ctx.fillRect(x + 15, y - postH, 10, postH);
              
              // Sign board
              ctx.fillStyle = '#78350f'; // Wood board
              ctx.fillRect(x, y - postH, signW, signH);
              ctx.strokeStyle = '#3f1d06'; // Border
              ctx.lineWidth = 2;
              ctx.strokeRect(x, y - postH, signW, signH);
              
              // Snow on top
              ctx.fillStyle = '#fff';
              ctx.fillRect(x, y - postH - 4, signW, 4);

              // Text
              ctx.fillStyle = '#fbbf24'; // Gold text
              ctx.font = 'bold 12px "Fredoka"';
              ctx.textAlign = 'center';
              ctx.fillText("LEVEL", x + signW/2, y - postH + 18);
              ctx.font = 'bold 16px "Fredoka"';
              ctx.fillText(`${obj.levelNumber}`, x + signW/2, y - postH + 34);

          } else if (obj.type === 'house' || obj.type === 'shop' || obj.type === 'gingerbread_house') {
              let color = '#fecaca';
              if (obj.type === 'gingerbread_house') color = '#78350f';
              else if (obj.variant === 1) color = '#bfdbfe';
              else if (obj.variant === 2) color = '#fde68a';
              else if (obj.variant === 3) color = '#e9d5ff';
              else if (obj.variant === 4) color = '#fed7aa';
              
              ctx.fillStyle = color;
              ctx.fillRect(x, y - obj.height, obj.width, obj.height);
              
              if (obj.type === 'gingerbread_house') {
                   // Icing roof
                   ctx.fillStyle = '#fff';
                   ctx.beginPath();
                   ctx.moveTo(x - 5, y - obj.height);
                   ctx.lineTo(x + obj.width / 2, y - obj.height - 30);
                   ctx.lineTo(x + obj.width + 5, y - obj.height);
                   ctx.fill();
                   // Candy buttons
                   for(let i=0; i<3; i++) {
                       ctx.fillStyle = ['#ef4444', '#22c55e', '#3b82f6'][i];
                       ctx.beginPath(); ctx.arc(x + 20 + (i*25), y - 40, 5, 0, Math.PI*2); ctx.fill();
                   }
                   // Door
                   ctx.fillStyle = '#5c2b0c';
                   ctx.beginPath(); ctx.arc(x + obj.width/2, y, 15, Math.PI, 0); ctx.fill();
              } else {
                // Regular House/Shop
                if (obj.type === 'shop') {
                    ctx.fillStyle = '#bfdbfe';
                    ctx.fillRect(x + 10, y - 60, obj.width - 20, 40);
                    ctx.fillStyle = '#1e293b';
                    ctx.fillRect(x + 5, y - obj.height + 10, obj.width - 10, 20);
                    ctx.fillStyle = '#fff';
                    ctx.font = '10px Fredoka';
                    ctx.textAlign = 'center';
                    ctx.fillText("OPEN", x + obj.width/2, y - obj.height + 25);
                } else {
                    ctx.fillStyle = '#fef08a'; 
                    ctx.fillRect(x + 10, y - obj.height + 20, 20, 20);
                    ctx.fillRect(x + obj.width - 30, y - obj.height + 20, 20, 20);
                }
                // Roof
                ctx.fillStyle = '#475569';
                ctx.beginPath();
                ctx.moveTo(x - 5, y - obj.height);
                ctx.lineTo(x + obj.width / 2, y - obj.height - 30);
                ctx.lineTo(x + obj.width + 5, y - obj.height);
                ctx.fill();
                // Snow Cap on Roof
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.moveTo(x - 5, y - obj.height);
                ctx.lineTo(x + obj.width / 2, y - obj.height - 30);
                ctx.lineTo(x + obj.width + 5, y - obj.height + 5);
                ctx.lineTo(x + obj.width/2, y - obj.height - 25);
                ctx.lineTo(x - 5, y - obj.height + 5);
                ctx.fill();

                const lightColors = ['#ef4444', '#22c55e', '#3b82f6', '#eab308'];
                for(let k=0; k<10; k++) {
                    const lx = x - 5 + (k * (obj.width+10)/10);
                    const ly = (y - obj.height) - (k < 5 ? k * 6 : (10-k)*6); 
                    // In Merry Mode, flash lights super fast
                    const flashSpeed = isMerry ? 2 : (isParty ? 2 : 10);
                    ctx.fillStyle = lightColors[(k + Math.floor(frameCountRef.current/ flashSpeed)) % 4];
                    ctx.beginPath(); ctx.arc(lx + 2, ly, 3, 0, Math.PI*2); ctx.fill();
                }
              }

          } else if (obj.type === 'market_stall') {
              ctx.fillStyle = '#78350f';
              ctx.fillRect(x + 10, y - 40, obj.width - 20, 40);
              ctx.fillStyle = '#ef4444';
              ctx.beginPath(); ctx.moveTo(x, y - 40); ctx.lineTo(x + obj.width/2, y - 70); ctx.lineTo(x + obj.width, y - 40); ctx.fill();
              ctx.fillStyle = '#fff';
              ctx.beginPath(); ctx.moveTo(x + 10, y - 46); ctx.lineTo(x + obj.width/2, y - 70); ctx.lineTo(x + obj.width - 10, y - 46); ctx.fill();
              
          } else if (obj.type === 'snowman') {
              ctx.fillStyle = '#fff';
              ctx.beginPath(); ctx.arc(x + 20, y - 15, 15, 0, Math.PI*2); ctx.fill(); 
              ctx.beginPath(); ctx.arc(x + 20, y - 35, 12, 0, Math.PI*2); ctx.fill(); 
              ctx.beginPath(); ctx.arc(x + 20, y - 52, 9, 0, Math.PI*2); ctx.fill(); 
              ctx.fillStyle = '#000';
              ctx.beginPath(); ctx.arc(x + 17, y - 54, 1.5, 0, Math.PI*2); ctx.fill();
              ctx.beginPath(); ctx.arc(x + 23, y - 54, 1.5, 0, Math.PI*2); ctx.fill();
              ctx.beginPath(); ctx.arc(x + 20, y - 35, 1.5, 0, Math.PI*2); ctx.fill();
              ctx.beginPath(); ctx.arc(x + 20, y - 30, 1.5, 0, Math.PI*2); ctx.fill();
              ctx.fillStyle = '#f97316';
              ctx.beginPath(); ctx.moveTo(x + 20, y - 52); ctx.lineTo(x + 28, y - 50); ctx.lineTo(x + 20, y - 48); ctx.fill();
              ctx.fillStyle = '#1e293b';
              ctx.fillRect(x + 14, y - 65, 12, 10);
              ctx.fillRect(x + 10, y - 57, 20, 3);
          } else if (obj.type === 'tree') {
              ctx.fillStyle = '#166534';
              const drawTri = (yOff: number, scale: number) => {
                  ctx.beginPath();
                  ctx.moveTo(x, y - yOff);
                  ctx.lineTo(x + obj.width/2, y - yOff - (40*scale));
                  ctx.lineTo(x + obj.width, y - yOff);
                  ctx.fill();
              };
              drawTri(20, 1.5);
              drawTri(50, 1.2);
              drawTri(80, 1.0);
              ctx.fillStyle = isMerry ? `hsl(${(frameCountRef.current * 10) % 360}, 100%, 80%)` : '#fff'; // Disco snow tips
              ctx.beginPath(); ctx.moveTo(x + obj.width/2, y - 140); ctx.lineTo(x+obj.width/2-10, y-125); ctx.lineTo(x+obj.width/2+10, y-125); ctx.fill();
              ctx.fillStyle = '#451a03';
              ctx.fillRect(x + obj.width/2 - 5, y - 20, 10, 20);
          } else if (obj.type === 'lamp') {
              ctx.fillStyle = '#1f2937';
              ctx.fillRect(x, y - 100, 4, 100);
              ctx.beginPath(); ctx.moveTo(x-10, y-100); ctx.lineTo(x+14, y-100); ctx.lineTo(x+10, y-115); ctx.lineTo(x-6, y-115); ctx.fill();
              ctx.fillStyle = isParty ? `hsl(${(frameCountRef.current * 10) % 360}, 100%, 70%)` : 'rgba(253, 224, 71, 0.6)';
              ctx.beginPath(); ctx.arc(x+2, y-105, 15, 0, Math.PI*2); ctx.fill();
          }
      });
  };

  const drawStreetSign = (ctx: CanvasRenderingContext2D) => {
      const startX = 600 - totalDistanceRef.current;
      if (startX < -200) return;

      const x = startX;
      const y = CONFIG.groundHeight - 120;
      
      // Pole
      ctx.fillStyle = '#1f2937'; // Darker grey pole
      ctx.fillRect(x + 5, y + 40, 10, 80);

      // Sign Plate (British Style: White rect, Black border, Black text)
      ctx.fillStyle = '#ffffff'; 
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      
      // Draw rounded rect manually for better control
      const w = 240;
      const h = 50;
      const r = 5;
      const sx = x - 110;
      
      ctx.beginPath();
      ctx.roundRect(sx, y, w, h, r);
      ctx.fill();
      ctx.stroke();

      // Text
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 20px "Fredoka", sans-serif'; 
      ctx.textAlign = 'center';
      ctx.fillText("Moseley Wood Gdns", sx + w/2, y + 32);
      
      // Subtitle number
      ctx.font = 'bold 14px "Fredoka", sans-serif';
      ctx.fillStyle = '#ef4444'; // Red number for flair
      ctx.fillText("87", sx + 20, y + 32);
  };

  const drawStreamers = (ctx: CanvasRenderingContext2D) => {
     if (themeRef.current !== Theme.NEON_AVENUE && themeRef.current !== Theme.HYPER_SPEED && themeRef.current !== Theme.MERRY_MODE) return;
     
     ctx.save();
     streamersRef.current.forEach((s, i) => {
         ctx.strokeStyle = s.color;
         ctx.lineWidth = 3;
         ctx.beginPath();
         // Wiggle logic
         const x = (s.x - (frameCountRef.current * 2)) % (GAME_WIDTH + 200);
         const drawX = x < -100 ? x + GAME_WIDTH + 200 : x;
         const y = s.y + Math.sin(frameCountRef.current * 0.05 + s.phase) * 20;
         
         ctx.moveTo(drawX, y);
         ctx.quadraticCurveTo(drawX + 30, y - 30, drawX + 60, y);
         ctx.stroke();
     });
     ctx.restore();
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    const themeColors = THEME_COLORS[themeRef.current];

    if (themeRef.current === Theme.NEON_AVENUE || themeRef.current === Theme.HYPER_SPEED) {
        const hue = (frameCountRef.current) % 360;
        ctx.fillStyle = `hsl(${hue}, 60%, 15%)`;
    } else if (themeRef.current === Theme.MERRY_MODE) {
        // Disco Sky for Merry Mode
        const hue = (frameCountRef.current * 0.5) % 360;
        ctx.fillStyle = `hsl(${hue}, 70%, 20%)`;
    } else {
        ctx.fillStyle = themeColors.bg;
    }
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    drawStreamers(ctx);
    drawBackgroundObjects(ctx);
    drawSanta(ctx);
    drawStreetSign(ctx);

    ctx.fillStyle = themeColors.ground;
    ctx.fillRect(0, CONFIG.groundHeight, GAME_WIDTH, GAME_HEIGHT - CONFIG.groundHeight);
    
    ctx.fillStyle = themeColors.groundDetail;
    const stripW = 60;
    const roadOff = Math.floor(totalDistanceRef.current % (stripW * 2));
    for (let i = -1; i < GAME_WIDTH / stripW + 1; i++) {
      const x = (i * stripW * 2) - roadOff;
      ctx.fillRect(x, CONFIG.groundHeight + 20, 40, 5); 
    }

    obstaclesRef.current.forEach(obs => drawObstacle(ctx, obs));
    collectiblesRef.current.forEach(c => drawCollectible(ctx, c));

    const p = playerRef.current;
    drawGingerbread(ctx, p.x, p.y, p.width, p.height, p.rotation);

    particlesRef.current.forEach(pt => {
        ctx.fillStyle = pt.color;
        ctx.fillRect(pt.x, pt.y, pt.width, pt.height);
    });

    // Dynamic Snow: Density based on score
    const maxSnow = 150;
    const snowDensity = Math.min(Math.floor(scoreRef.current / 50), maxSnow);
    
    // Snow color logic in update loop already handles confetti colors
    for(let i=0; i<snowDensity; i++) {
        const s = snowRef.current[i];
        if(!s) break;
        ctx.fillStyle = s.color || 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI*2);
        ctx.fill();
    }
  };

  const gameLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (gameState === GameState.PLAYING) {
        update();
    }
    draw(ctx);
    
    if (gameState === GameState.PLAYING) {
        requestRef.current = requestAnimationFrame(gameLoop);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={GAME_WIDTH}
      height={GAME_HEIGHT}
      className="w-full h-full object-contain touch-none image-pixelated"
    />
  );
};

export default GameCanvas;
