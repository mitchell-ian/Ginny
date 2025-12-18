
import { GameConfig, Theme } from './types';

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 450;

export const CONFIG: GameConfig = {
  gravity: 0.9, 
  jumpForce: -15, 
  baseSpeed: 6, 
  speedIncrement: 0.001, 
  groundHeight: 380, 
};

export const PLAYERS = [
  { name: 'Lily', avatarColor: '#F472B6', icon: '👧' }, 
  { name: 'Theo', avatarColor: '#60A5FA', icon: '👦' }, 
];

export const THEME_THRESHOLDS = {
  [Theme.STREET_MORNING]: 0,
  [Theme.STREET_NIGHT]: 1000,
  [Theme.NEON_AVENUE]: 2500,
  [Theme.HYPER_SPEED]: 5000,
};

export const DEATH_MESSAGES = [
  // Classic
  "Why was 6 afraid of 7? Because 7 ate 9!",
  "Emotional Damage!",
  "Yeet!",
  "Mission Failed!",
  // Christmas Puns
  "Yule be sorry!",
  "Sleigh it ain't so!",
  "Oh deer...",
  "That was cold.",
  "Up to snow good?",
  "Rest in Peas (and carrots).",
  "You've been elf-ed.",
  "Snow way you missed that!",
  "Not very ice.",
  "Clause for concern.",
  "Wait for the myrrh-acle.",
  "Don't get your tinsel in a tangle.",
  "Birch, please.",
  "Fleece Navidad!",
  "Check your elf before you wreck your elf.",
  "Hold on for deer life!",
  "That bit.",
  "Oh snap! (Ginger-snap)",
  "Feeling pine?",
  "Mistle-toast.",
  "Bah humbug!",
  "Fir sure!",
  "Ice to meet you!",
  "There's snow place like home.",
  "Sleigh my name, sleigh my name.",
  "You crack me up.",
  "But wait—there's myrrh!",
  "Rebel without a Claus.",
  "Make it rein!",
];

export const THEME_COLORS = {
  [Theme.STREET_MORNING]: {
    bg: '#87CEEB', // Sky blue
    ground: '#78716c', // Asphalt
    groundDetail: '#d6d3d1', // Road markings
    accent: '#FFFFFF',
  },
  [Theme.STREET_NIGHT]: {
    bg: '#1e1b4b', // Dark blue
    ground: '#44403c', // Dark asphalt
    groundDetail: '#a8a29e', 
    accent: '#f0f9ff',
  },
  [Theme.NEON_AVENUE]: {
    bg: '#312e81', 
    ground: '#27272a', 
    groundDetail: '#e879f9', // Neon lines
    accent: '#e879f9',
  },
  [Theme.HYPER_SPEED]: {
    bg: '#000000', 
    ground: '#ef4444', 
    groundDetail: '#f87171',
    accent: '#fbbf24', 
  },
  [Theme.MERRY_MODE]: {
    bg: '#2e1065', // Base purple, heavily overridden by canvas dynamic colors
    ground: '#4c1d95', 
    groundDetail: '#f472b6',
    accent: '#fde047', 
  },
};
