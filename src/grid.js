import { CONFIG } from './config.js';

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export class Grid {
  constructor(level) {
    this.level = level;
    this.size = level.size;
    this.tiles = [];
    this.animating = false;
    this.pulseTimer = 0;
    this._buildTiles(level);
  }

  _buildTiles(level) {
    this.tiles.length = 0;
    const { size } = level;
    const targetLookup = new Map();
    for (let row = 0; row < size; row += 1) {
      for (let col = 0; col < size; col += 1) {
        const pieceId = level.target[row][col];
        if (!targetLookup.has(pieceId)) {
          targetLookup.set(pieceId, { row, col });
        }
      }
    }
    let idCounter = 0;
    for (let row = 0; row < size; row += 1) {
      for (let col = 0; col < size; col += 1) {
        const pieceId = level.scrambled[row][col];
        const targetPosition = targetLookup.get(pieceId);
        const targetRow = targetPosition ? targetPosition.row : this._findTargetRow(level, pieceId, idCounter);
        const targetCol = targetPosition ? targetPosition.col : this._findTargetCol(level, pieceId, idCounter);
        this.tiles.push({
          id: idCounter,
          pieceId,
          currentRow: row,
          currentCol: col,
          targetRow,
          targetCol,
          animation: null,
        });
        idCounter += 1;
      }
    }
  }

  _findTargetRow(level, pieceId, fallbackIndex) {
    const { size } = level;
    for (let row = 0; row < size; row += 1) {
      for (let col = 0; col < size; col += 1) {
        if (level.target[row][col] === pieceId) {
          return row;
        }
      }
    }
    return Math.floor(fallbackIndex / size);
  }

  _findTargetCol(level, pieceId, fallbackIndex) {
    const { size } = level;
    for (let row = 0; row < size; row += 1) {
      for (let col = 0; col < size; col += 1) {
        if (level.target[row][col] === pieceId) {
          return col;
        }
      }
    }
    return fallbackIndex % size;
  }

  reset(level) {
    this.level = level;
    this.size = level.size;
    this.animating = false;
    this.pulseTimer = 0;
    this._buildTiles(level);
  }

  getTileAt(row, col) {
    return this.tiles.find((tile) => tile.currentRow === row && tile.currentCol === col);
  }

  getTileByIndex(index) {
    return this.tiles[index];
  }

  getTileAtPoint(point, layout) {
    const { playGrid } = layout;
    if (!playGrid) {
      return null;
    }
    const { size } = this;
    const unit = playGrid.width / size;
    const tileSize = unit * (1 - CONFIG.tileSpacingRatio);
    const offset = (unit - tileSize) / 2;
    const localX = point.x - playGrid.x;
    const localY = point.y - playGrid.y;
    if (localX < 0 || localY < 0 || localX >= playGrid.width || localY >= playGrid.height) {
      return null;
    }
    const column = Math.floor(localX / unit);
    const row = Math.floor(localY / unit);
    const tile = this.getTileAt(row, column);
    if (!tile) {
      return null;
    }
    const tileX = column * unit + offset;
    const tileY = row * unit + offset;
    if (
      localX >= tileX &&
      localX <= tileX + tileSize &&
      localY >= tileY &&
      localY <= tileY + tileSize
    ) {
      return tile;
    }
    return null;
  }

  canSwap() {
    return !this.tiles.some((tile) => tile.animation);
  }

  swapTiles(tileA, tileB) {
    if (!tileA || !tileB || tileA === tileB) {
      return;
    }
    const duration = CONFIG.swapDuration;
    const fromA = { row: tileA.currentRow, col: tileA.currentCol };
    const fromB = { row: tileB.currentRow, col: tileB.currentCol };
    tileA.currentRow = fromB.row;
    tileA.currentCol = fromB.col;
    tileB.currentRow = fromA.row;
    tileB.currentCol = fromA.col;
    tileA.animation = {
      fromRow: fromA.row,
      fromCol: fromA.col,
      toRow: tileA.currentRow,
      toCol: tileA.currentCol,
      elapsed: 0,
      duration,
    };
    tileB.animation = {
      fromRow: fromB.row,
      fromCol: fromB.col,
      toRow: tileB.currentRow,
      toCol: tileB.currentCol,
      elapsed: 0,
      duration,
    };
  }

  update(deltaTime) {
    let animating = false;
    for (const tile of this.tiles) {
      if (!tile.animation) {
        continue;
      }
      tile.animation.elapsed += deltaTime;
      if (tile.animation.elapsed >= tile.animation.duration) {
        tile.animation = null;
      } else {
        animating = true;
      }
    }
    this.animating = animating;
    if (this.pulseTimer > 0) {
      this.pulseTimer = Math.max(0, this.pulseTimer - deltaTime);
    }
  }

  triggerSolvePulse() {
    this.pulseTimer = CONFIG.solvePulseDuration;
  }

  isSolved() {
    return this.tiles.every((tile) => tile.currentRow === tile.targetRow && tile.currentCol === tile.targetCol);
  }

  getTilePosition(tile) {
    if (tile.animation) {
      const t = Math.min(1, tile.animation.elapsed / tile.animation.duration);
      const eased = easeInOutCubic(t);
      const row = tile.animation.fromRow + (tile.animation.toRow - tile.animation.fromRow) * eased;
      const col = tile.animation.fromCol + (tile.animation.toCol - tile.animation.fromCol) * eased;
      return { row, col };
    }
    return { row: tile.currentRow, col: tile.currentCol };
  }
}
