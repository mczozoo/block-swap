import { CONFIG } from './config.js';

function rectContains(rect, point) {
  return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;
}

export class UI {
  constructor() {
    this.layout = null;
  }

  computeLayout(width, height, gridSize) {
    const shorterSide = Math.min(width, height);
    const padding = shorterSide * CONFIG.paddingRatio;
    const contentWidth = width - padding * 2;
    const contentHeight = height - padding * 2;
    const hudHeight = Math.min(shorterSide * 0.15, contentHeight * 0.18);
    const gap = shorterSide * 0.05;

    const hudRect = {
      x: padding,
      y: padding,
      width: contentWidth,
      height: hudHeight,
    };

    const playAreaTop = hudRect.y + hudRect.height + gap;
    const playAreaHeight = height - playAreaTop - padding;
    const gridSizePx = Math.min(contentWidth, playAreaHeight);
    const playGrid = {
      x: width / 2 - gridSizePx / 2,
      y: playAreaTop + (playAreaHeight - gridSizePx) / 2,
      width: gridSizePx,
      height: gridSizePx,
    };

    const buttonWidth = Math.min(200, hudRect.width * 0.25);
    const buttonHeight = Math.min(64, hudRect.height * 0.65);
    const restartButton = {
      x: hudRect.x + hudRect.width - buttonWidth,
      y: hudRect.y + hudRect.height / 2 - buttonHeight / 2,
      width: buttonWidth,
      height: buttonHeight,
    };

    const panelWidth = Math.min(contentWidth * 0.8, shorterSide * 0.85);
    const panelHeight = Math.min(contentHeight * 0.6, shorterSide * 0.7);
    const completionPanel = {
      x: width / 2 - panelWidth / 2,
      y: height / 2 - panelHeight / 2,
      width: panelWidth,
      height: panelHeight,
    };

    const panelButtonWidth = panelWidth * 0.35;
    const panelButtonHeight = 64;
    const panelButtonPadding = 24;
    const panelButtonsY = completionPanel.y + completionPanel.height - panelButtonHeight - panelButtonPadding;

    const panelRestart = {
      x: completionPanel.x + panelWidth * 0.12,
      y: panelButtonsY,
      width: panelButtonWidth,
      height: panelButtonHeight,
    };

    const panelNext = {
      x: completionPanel.x + completionPanel.width - panelWidth * 0.12 - panelButtonWidth,
      y: panelButtonsY,
      width: panelButtonWidth,
      height: panelButtonHeight,
    };

    this.layout = {
      padding,
      hudRect,
      playGrid,
      restartButton,
      completionPanel,
      panelRestart,
      panelNext,
    };

    return this.layout;
  }

  drawHud(renderer, state) {
    const { hudRect, restartButton } = this.layout;
    renderer.drawRect(hudRect.x, hudRect.y, hudRect.width, hudRect.height, CONFIG.hudBackground);

    const textMargin = 28;
    const centerY = hudRect.y + hudRect.height / 2;
    renderer.drawText(`Level ${state.level}`, hudRect.x + textMargin, centerY, {
      font: CONFIG.textFont,
      color: CONFIG.hudTextColor,
      baseline: 'middle',
    });

    renderer.drawText(`Moves ${state.moves}`, hudRect.x + hudRect.width / 2, centerY, {
      font: CONFIG.textFont,
      color: CONFIG.hudTextColor,
      baseline: 'middle',
      align: 'center',
    });

    renderer.drawRect(restartButton.x, restartButton.y, restartButton.width, restartButton.height, CONFIG.buttonBackground);
    renderer.drawText('Restart', restartButton.x + restartButton.width / 2, restartButton.y + restartButton.height / 2, {
      font: CONFIG.smallTextFont,
      color: CONFIG.buttonTextColor,
      align: 'center',
      baseline: 'middle',
    });
  }

  drawBoard(renderer, grid, texture) {
    const { playGrid } = this.layout;
    renderer.drawRect(playGrid.x, playGrid.y, playGrid.width, playGrid.height, CONFIG.tileBackground);
    this._drawPlayTiles(renderer, grid, texture);
  }

  _drawPlayTiles(renderer, grid, texture) {
    const { playGrid } = this.layout;
    const size = grid.size;
    const unit = playGrid.width / size;
    const tileSize = unit * (1 - CONFIG.tileSpacingRatio);
    const offset = (unit - tileSize) / 2;

    for (const tile of grid.tiles) {
      const { row, col } = grid.getTilePosition(tile);
      const x = playGrid.x + col * unit + offset;
      const y = playGrid.y + row * unit + offset;
      const pieceRow = Math.floor(tile.pieceId / size);
      const pieceCol = tile.pieceId % size;
      const texCoords = {
        u0: pieceCol / size,
        v0: pieceRow / size,
        u1: (pieceCol + 1) / size,
        v1: (pieceRow + 1) / size,
      };
      renderer.drawTexture(texture, x, y, tileSize, tileSize, texCoords);
    }

    if (grid.pulseTimer > 0) {
      const alpha = (grid.pulseTimer / CONFIG.solvePulseDuration) ** 2;
      renderer.drawRect(playGrid.x, playGrid.y, playGrid.width, playGrid.height, [
        CONFIG.solvedGlowColor[0],
        CONFIG.solvedGlowColor[1],
        CONFIG.solvedGlowColor[2],
        CONFIG.solvedGlowColor[3] * alpha,
      ]);
    }
  }

  drawSelection(renderer, tile, grid) {
    if (!tile) {
      return;
    }
    const { playGrid } = this.layout;
    const size = grid.size;
    const unit = playGrid.width / size;
    const tileSize = unit * (1 - CONFIG.tileSpacingRatio);
    const offset = (unit - tileSize) / 2;
    const { row, col } = grid.getTilePosition(tile);
    const x = playGrid.x + col * unit + offset - 6;
    const y = playGrid.y + row * unit + offset - 6;
    const frameSize = tileSize + 12;
    renderer.drawFrame(x, y, frameSize, frameSize, 6, CONFIG.selectionColor);
  }

  drawCompletionPanel(renderer, state) {
    const { completionPanel, panelRestart, panelNext } = this.layout;
    renderer.drawRect(completionPanel.x, completionPanel.y, completionPanel.width, completionPanel.height, CONFIG.panelBackground);
    renderer.drawText('Level Complete!', completionPanel.x + completionPanel.width / 2, completionPanel.y + completionPanel.height * 0.25, {
      font: CONFIG.panelTitleFont,
      color: CONFIG.buttonTextColor,
      align: 'center',
      baseline: 'middle',
    });
    renderer.drawText(`Moves ${state.moves}`, completionPanel.x + completionPanel.width / 2, completionPanel.y + completionPanel.height * 0.45, {
      font: CONFIG.textFont,
      color: CONFIG.buttonTextColor,
      align: 'center',
      baseline: 'middle',
    });

    renderer.drawRect(panelRestart.x, panelRestart.y, panelRestart.width, panelRestart.height, CONFIG.buttonBackground);
    renderer.drawRect(panelNext.x, panelNext.y, panelNext.width, panelNext.height, CONFIG.buttonBackground);

    renderer.drawText('Restart', panelRestart.x + panelRestart.width / 2, panelRestart.y + panelRestart.height / 2, {
      font: CONFIG.smallTextFont,
      color: CONFIG.buttonTextColor,
      align: 'center',
      baseline: 'middle',
    });
    renderer.drawText('Next Level', panelNext.x + panelNext.width / 2, panelNext.y + panelNext.height / 2, {
      font: CONFIG.smallTextFont,
      color: CONFIG.buttonTextColor,
      align: 'center',
      baseline: 'middle',
    });
  }

  hitTest(point) {
    if (!this.layout) {
      return null;
    }
    const { restartButton } = this.layout;
    if (rectContains(restartButton, point)) {
      return 'restart';
    }
    return null;
  }

  hitTestCompletion(point) {
    if (!this.layout) {
      return null;
    }
    const { panelRestart, panelNext } = this.layout;
    if (rectContains(panelRestart, point)) {
      return 'panelRestart';
    }
    if (rectContains(panelNext, point)) {
      return 'panelNext';
    }
    return null;
  }
}
