import { CONFIG } from './config.js';
import { LEVELS } from './levels.js';
import { Grid } from './grid.js';
import { Renderer } from './renderer.js';
import { UI } from './ui.js';
import { InputManager } from './input.js';
import { GameLoop } from './game-loop.js';

const canvas = document.getElementById('gameCanvas');
const gl = canvas.getContext('webgl2', { antialias: true, alpha: false });
if (!gl) {
  throw new Error('WebGL2 not supported');
}

const renderer = new Renderer(gl);
const ui = new UI();
let inputManager = null;

const IMAGE_PATHS = ['image/image1.jpg', 'image/image2.jpg', 'image/image3.jpg'];

let currentLevelIndex = 0;
let grid = new Grid(LEVELS[currentLevelIndex]);
let layout = null;
let selectedTile = null;
let moves = 0;
let state = 'playing'; // 'playing' | 'complete'
let pendingResizeFrame = 0;
let textures = [];
let currentTexture = null;
let assetLoadError = null;

function updateViewportUnits() {
  const viewport = window.visualViewport;
  const width = viewport ? viewport.width : window.innerWidth;
  const height = viewport ? viewport.height : window.innerHeight;
  if (width > 0) {
    document.documentElement.style.setProperty('--app-width', `${width}px`);
  }
  if (height > 0) {
    document.documentElement.style.setProperty('--app-height', `${height}px`);
  }
}

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const displayWidth = Math.max(1, Math.floor(rect.width * dpr));
  const displayHeight = Math.max(1, Math.floor(rect.height * dpr));
  if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }
  layout = ui.computeLayout(canvas.width, canvas.height, grid.size);
}

function scheduleViewportSync() {
  updateViewportUnits();
  if (pendingResizeFrame) {
    cancelAnimationFrame(pendingResizeFrame);
  }
  pendingResizeFrame = window.requestAnimationFrame(() => {
    pendingResizeFrame = 0;
    resizeCanvas();
  });
}

function resetLevel(index) {
  currentLevelIndex = index;
  const level = LEVELS[currentLevelIndex % LEVELS.length];
  grid.reset(level);
  moves = 0;
  selectedTile = null;
  state = 'playing';
  grid.pulseTimer = 0;
  layout = ui.computeLayout(canvas.width, canvas.height, grid.size);
  if (textures.length > 0) {
    currentTexture = textures[currentLevelIndex % textures.length];
  }
}

function nextLevel() {
  resetLevel((currentLevelIndex + 1) % LEVELS.length);
}

function restartLevel() {
  resetLevel(currentLevelIndex);
}

function handleTap(point) {
  if (!layout) {
    return;
  }
  if (!currentTexture) {
    return;
  }
  if (state === 'complete') {
    const action = ui.hitTestCompletion(point);
    if (action === 'panelRestart') {
      restartLevel();
      return;
    }
    if (action === 'panelNext') {
      nextLevel();
      return;
    }
    return;
  }

  const uiAction = ui.hitTest(point);
  if (uiAction === 'restart') {
    restartLevel();
    return;
  }

  if (!grid.canSwap()) {
    return;
  }

  const tile = grid.getTileAtPoint(point, layout);
  if (!tile) {
    selectedTile = null;
    return;
  }

  if (selectedTile === tile) {
    selectedTile = null;
    return;
  }

  if (selectedTile) {
    grid.swapTiles(selectedTile, tile);
    selectedTile = null;
    moves += 1;
    if (grid.isSolved()) {
      state = 'complete';
      grid.triggerSolvePulse();
    }
    return;
  }

  selectedTile = tile;
}

function update(delta) {
  grid.update(delta);
}

function render() {
  renderer.begin(canvas.width, canvas.height, CONFIG.baseBackground);
  if (currentTexture) {
    ui.drawBoard(renderer, grid, currentTexture);
    ui.drawSelection(renderer, selectedTile, grid);
  } else if (assetLoadError) {
    renderer.drawText('Failed to load textures', canvas.width / 2, canvas.height / 2, {
      font: CONFIG.textFont,
      color: CONFIG.hudTextColor,
      align: 'center',
      baseline: 'middle',
    });
  } else {
    renderer.drawText('Loading images…', canvas.width / 2, canvas.height / 2, {
      font: CONFIG.textFont,
      color: CONFIG.hudTextColor,
      align: 'center',
      baseline: 'middle',
    });
  }
  ui.drawHud(renderer, {
    level: LEVELS[currentLevelIndex % LEVELS.length].id,
    moves,
  });
  if (state === 'complete') {
    ui.drawCompletionPanel(renderer, { moves });
  }
}

async function loadImage(path) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image: ${path}`));
    image.src = path;
  });
}

async function loadTextures() {
  const loadedTextures = [];
  for (const path of IMAGE_PATHS) {
    // eslint-disable-next-line no-await-in-loop
    const image = await loadImage(path);
    loadedTextures.push(renderer.createTextureFromImage(image));
  }
  return loadedTextures;
}

async function initializeAsync() {
  updateViewportUnits();
  resizeCanvas();

  try {
    textures = await loadTextures();
    if (textures.length > 0) {
      currentTexture = textures[currentLevelIndex % textures.length];
    }
  } catch (error) {
    console.error(error);
    assetLoadError = error;
  }

  inputManager = new InputManager(canvas, handleTap);

  const loop = new GameLoop({ update, render });
  loop.start();

  if (textures.length > 0) {
    resetLevel(currentLevelIndex);
  }

  if (window.ResizeObserver) {
    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    resizeObserver.observe(canvas);
  }

  window.addEventListener('resize', scheduleViewportSync, { passive: true });
  window.addEventListener('orientationchange', () => {
    scheduleViewportSync();
  });

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', scheduleViewportSync, {
      passive: true,
    });
    window.visualViewport.addEventListener('scroll', scheduleViewportSync, {
      passive: true,
    });
  }

  window.addEventListener('pageshow', scheduleViewportSync);
}

initializeAsync();
