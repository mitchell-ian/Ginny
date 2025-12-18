
import { Entity, Obstacle, Collectible, Theme } from '../types';
import { THEME_THRESHOLDS, GAME_WIDTH, CONFIG } from '../constants';

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const checkCollision = (rect1: Rect, rect2: Rect): boolean => {
  const buffer = 4;
  return (
    rect1.x + buffer < rect2.x + rect2.width - buffer &&
    rect1.x + rect1.width - buffer > rect2.x + buffer &&
    rect1.y + buffer < rect2.y + rect2.height && 
    rect1.y + rect1.height - buffer > rect2.y + buffer
  );
};

export const getThemeForScore = (score: number): Theme => {
  // Logic: 1 level = 1000 points.
  // "Merry mode every 3 levels for 1 level" -> 3 normal, 1 merry, repeat.
  // Levels 0, 1, 2 = Normal. Level 3 = Merry. Level 4, 5, 6 = Normal. Level 7 = Merry.
  const level = Math.floor(score / 1000);
  
  if ((level + 1) % 4 === 0) {
      return Theme.MERRY_MODE;
  }

  // Normal Progression for non-Merry levels
  if (score >= THEME_THRESHOLDS[Theme.HYPER_SPEED]) return Theme.HYPER_SPEED;
  if (score >= THEME_THRESHOLDS[Theme.NEON_AVENUE]) return Theme.NEON_AVENUE;
  if (score >= THEME_THRESHOLDS[Theme.STREET_NIGHT]) return Theme.STREET_NIGHT;
  return Theme.STREET_MORNING;
};

export const generateCollectible = (currentSpeed: number): Collectible => {
  const y = CONFIG.groundHeight - 80 - (Math.random() * 60);
  const typeRoll = Math.random();
  let subtype: Collectible['subtype'] = 'cane';
  
  if (typeRoll < 0.5) subtype = 'cane';
  else if (typeRoll < 0.8) subtype = 'present';
  else subtype = 'star';

  return {
      x: GAME_WIDTH + 50 + Math.random() * 200,
      y: y,
      baseY: y,
      width: 30,
      height: 30,
      color: '#fff',
      collected: false,
      floatOffset: Math.random() * Math.PI * 2,
      subtype
  };
};

export const generateObstacle = (currentSpeed: number, theme: Theme): Obstacle => {
  const typeRoll = Math.random();
  let typeId: Obstacle['typeId'] = 'bin';
  let width = 30;
  let height = 30;
  let y = CONFIG.groundHeight - height;
  let color = '#000';

  if (typeRoll < 0.2) {
    typeId = 'cone';
    width = 25;
    height = 25;
    y = CONFIG.groundHeight - height;
  } else if (typeRoll < 0.4) {
    typeId = 'bin';
    width = 35;
    height = 50;
    y = CONFIG.groundHeight - height;
  } else if (typeRoll < 0.55) {
    typeId = 'postbox';
    width = 25;
    height = 55;
    y = CONFIG.groundHeight - height;
  } else if (typeRoll < 0.75) {
    typeId = 'barrier';
    width = 60;
    height = 30;
    y = CONFIG.groundHeight - height;
  } else if (typeRoll < 0.9) {
    typeId = 'fence';
    width = 30;
    height = 40; 
    y = CONFIG.groundHeight - height;
  } else {
    typeId = 'car';
    width = 90;
    height = 35;
    y = CONFIG.groundHeight - height;
    // Car Color
    const carColors = ['#dc2626', '#2563eb', '#16a34a', '#eab308', '#000000', '#9ca3af'];
    color = carColors[Math.floor(Math.random() * carColors.length)];
  }

  const spawnX = GAME_WIDTH + 100 + Math.random() * 300;

  return {
    x: spawnX,
    y,
    width,
    height,
    color, 
    typeId,
    passed: false,
  };
};

export const getRandomDeathMessage = (messages: string[]): string => {
  const index = Math.floor(Math.random() * messages.length);
  return messages[index];
};
