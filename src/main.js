import { CONFIG, hexToRgba } from './config.js';
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

const IMAGE_PATHS = Array.from(new Set(LEVELS.map((level) => level.image)));

let currentLevelIndex = 0;
let grid = new Grid(LEVELS[currentLevelIndex]);
let layout = null;
let selectedTile = null;
let moves = 0;
let state = 'playing'; // 'playing' | 'celebrating' | 'complete'
let celebrationTimer = 0;
let confettiPieces = [];
let pendingResizeFrame = 0;
let textures = new Map();
let currentTexture = null;
let assetLoadError = null;
const tutorial = {
  active: false,
  seen: false,
  timer: 0,
};

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
  celebrationTimer = 0;
  confettiPieces = [];
  grid.pulseTimer = 0;
  layout = ui.computeLayout(canvas.width, canvas.height, grid.size);
  if (textures.size > 0) {
    currentTexture = textures.get(level.image) || null;
  }
  if (currentLevelIndex === 0 && !tutorial.seen) {
    tutorial.active = true;
    tutorial.timer = 0;
  } else {
    tutorial.active = false;
    tutorial.timer = 0;
  }
}

function nextLevel() {
  resetLevel((currentLevelIndex + 1) % LEVELS.length);
}

function restartLevel() {
  resetLevel(currentLevelIndex);
}

function handleTap(point) {
  if (tutorial.active) {
    tutorial.active = false;
    tutorial.seen = true;
    tutorial.timer = 0;
    return;
  }
  if (!layout) {
    return;
  }
  if (!currentTexture) {
    return;
  }
  if (state === 'celebrating') {
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

  const tile = grid.getTileAtPoint(point, layout, ui.getTileSpacingRatio());
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
      grid.triggerSolvePulse();
      beginCelebration();
    }
    return;
  }

  selectedTile = tile;
}

function randomInRange(range) {
  const [min, max] = range;
  return min + Math.random() * (max - min);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function randomColorRgba(alpha = 0.92) {
  const palette = CONFIG.colors;
  const color = palette[Math.floor(Math.random() * palette.length)] ?? '#ffffff';
  return hexToRgba(color, alpha);
}

function applyConfettiPresentation(piece) {
  const flip = Math.abs(Math.sin(piece.time * piece.flipSpeed));
  const phase = piece.time * piece.flipSpeed + piece.swingPhase;
  const widthScale = 0.45 + 0.55 * flip;
  const heightScale = 0.45 + 0.55 * Math.abs(Math.cos(phase));
  const swingOffset = Math.sin(phase) * piece.swingAmplitude;
  piece.renderWidth = piece.baseWidth * widthScale;
  piece.renderHeight = Math.max(2, piece.baseHeight * heightScale);
  piece.renderX = piece.x + swingOffset - piece.renderWidth / 2;
  piece.renderY = piece.y;
}

function resetConfettiPiece(piece, width, height, refreshColor = false, initial = false) {
  const dpr = window.devicePixelRatio || 1;
  const cssWidth = width / dpr;
  const cssHeight = height / dpr;
  const referenceSize = Math.min(cssWidth, cssHeight);
  const sizeScale = 1.1 * clamp(referenceSize / 720, 1, 2.2);
  const baseSize = randomInRange(CONFIG.confettiSize) * sizeScale;
  const aspect = 0.45 + Math.random() * 0.85;
  piece.baseWidth = baseSize;
  piece.baseHeight = baseSize * aspect;
  piece.x = Math.random() * width;
  if (initial) {
    piece.y = Math.random() * height;
  } else {
    piece.y = -Math.random() * height - baseSize;
  }
  piece.fallSpeed = randomInRange(CONFIG.confettiFallSpeed);
  piece.driftSpeed = randomInRange(CONFIG.confettiDriftSpeed);
  piece.swingAmplitude = randomInRange(CONFIG.confettiSwing);
  piece.swingPhase = Math.random() * Math.PI * 2;
  piece.flipSpeed = randomInRange(CONFIG.confettiFlipSpeed);
  piece.time = Math.random() * Math.PI * 2;
  if (refreshColor || !piece.color) {
    piece.color = randomColorRgba();
  }
  applyConfettiPresentation(piece);
}

function beginCelebration() {
  state = 'celebrating';
  celebrationTimer = 0;
  const width = canvas.width;
  const height = canvas.height;
  confettiPieces = [];
  for (let i = 0; i < CONFIG.confettiCount; i += 1) {
    const piece = {
      baseWidth: 0,
      baseHeight: 0,
      color: null,
      fallSpeed: 0,
      driftSpeed: 0,
      swingAmplitude: 0,
      swingPhase: 0,
      flipSpeed: 0,
      time: 0,
      x: 0,
      y: 0,
      renderX: 0,
      renderY: 0,
      renderWidth: 0,
      renderHeight: 0,
    };
    resetConfettiPiece(piece, width, height, true, true);
    confettiPieces.push(piece);
  }
  updateConfetti(0);
}

function updateConfetti(delta) {
  if (!confettiPieces.length) {
    return;
  }
  const width = canvas.width;
  const height = canvas.height;
  for (const piece of confettiPieces) {
    piece.time += delta;
    piece.y += piece.fallSpeed * delta;
    piece.x += piece.driftSpeed * delta;
    if (piece.x < -80) {
      piece.x += width + 160;
    } else if (piece.x > width + 80) {
      piece.x -= width + 160;
    }
    applyConfettiPresentation(piece);
    if (piece.y > height + 40) {
      resetConfettiPiece(piece, width, height, true);
    }
  }
}

function update(delta) {
  grid.update(delta);
  if (tutorial.active) {
    tutorial.timer += delta;
  }
  if (state === 'celebrating') {
    celebrationTimer += delta;
    updateConfetti(delta);
    if (celebrationTimer >= CONFIG.celebrationDuration) {
      state = 'complete';
      confettiPieces = [];
    }
  }
}

function render() {
  const level = LEVELS[currentLevelIndex % LEVELS.length];
  renderer.begin(canvas.width, canvas.height, CONFIG.baseBackground);
  const celebrationProgress =
    state === 'celebrating'
      ? Math.min(1, celebrationTimer / CONFIG.celebrationDuration)
      : state === 'complete'
      ? 1
      : 0;
  if (currentTexture) {
    ui.drawReference(renderer, currentTexture);
    ui.drawBoard(renderer, grid, currentTexture, { revealProgress: celebrationProgress });
    ui.drawSelection(renderer, selectedTile, grid);
    if (confettiPieces.length > 0) {
      ui.drawConfetti(renderer, confettiPieces);
    }
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
    level: level.id,
    moves,
    goalMoves: level.minMoves,
  });
  if (state === 'complete') {
    ui.drawCompletionPanel(renderer, { moves, goalMoves: level.minMoves });
  }
  if (tutorial.active) {
    ui.drawTutorialOverlay(renderer, tutorial);
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
  const loadedTextures = new Map();
  for (const path of IMAGE_PATHS) {
    // eslint-disable-next-line no-await-in-loop
    const image = await loadImage(path);
    loadedTextures.set(path, renderer.createTextureFromImage(image));
  }
  return loadedTextures;
}

async function initializeAsync() {
  updateViewportUnits();
  resizeCanvas();

  try {
    textures = await loadTextures();
    if (textures.size > 0) {
      const level = LEVELS[currentLevelIndex % LEVELS.length];
      currentTexture = textures.get(level.image) || null;
    }
  } catch (error) {
    console.error(error);
    assetLoadError = error;
  }

  inputManager = new InputManager(canvas, handleTap);

  const loop = new GameLoop({ update, render });
  loop.start();

  if (textures.size > 0) {
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
