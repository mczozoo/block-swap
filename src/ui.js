import { CONFIG, hexToRgba } from './config.js';

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
    const contentX = padding;
    const contentY = padding;
    const contentWidth = width - padding * 2;
    const contentHeight = height - padding * 2;
    const hudHeight = Math.min(shorterSide * 0.15, contentHeight * 0.2);
    const gap = shorterSide * 0.05;

    const orientation = width >= height ? 'landscape' : 'portrait';
    const playAreaHeight = contentHeight - hudHeight - gap;

    let targetGrid;
    let playGrid;
    if (orientation === 'landscape') {
      const availableWidth = contentWidth - gap;
      const halfWidth = availableWidth / 2;
      const gridSizePx = Math.min(halfWidth, playAreaHeight);
      const extraX = halfWidth - gridSizePx;
      const offsetY = contentY + hudHeight + (playAreaHeight - gridSizePx) / 2;
      targetGrid = {
        x: contentX + extraX / 2,
        y: offsetY,
        width: gridSizePx,
        height: gridSizePx,
      };
      playGrid = {
        x: contentX + halfWidth + gap + extraX / 2,
        y: offsetY,
        width: gridSizePx,
        height: gridSizePx,
      };
    } else {
      const availableHeight = playAreaHeight - gap;
      const halfHeight = availableHeight / 2;
      const gridSizePx = Math.min(contentWidth, halfHeight);
      const extraY = halfHeight - gridSizePx;
      const offsetX = contentX + (contentWidth - gridSizePx) / 2;
      targetGrid = {
        x: offsetX,
        y: contentY + hudHeight + extraY / 2,
        width: gridSizePx,
        height: gridSizePx,
      };
      playGrid = {
        x: offsetX,
        y: contentY + hudHeight + halfHeight + gap + extraY / 2,
        width: gridSizePx,
        height: gridSizePx,
      };
    }

    const hudRect = {
      x: contentX,
      y: contentY,
      width: contentWidth,
      height: hudHeight,
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
      orientation,
      padding,
      hudRect,
      playGrid,
      targetGrid,
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

  drawGrids(renderer, grid, targetPattern, colors) {
    const { targetGrid, playGrid } = this.layout;
    renderer.drawRect(targetGrid.x, targetGrid.y, targetGrid.width, targetGrid.height, CONFIG.targetBackground);
    renderer.drawRect(playGrid.x, playGrid.y, playGrid.width, playGrid.height, CONFIG.tileBackground);

    this._drawTargetPattern(renderer, targetPattern, colors);
    this._drawPlayTiles(renderer, grid, colors);
  }

  _drawTargetPattern(renderer, pattern, colors) {
    const { targetGrid } = this.layout;
    const size = pattern.length;
    const unit = targetGrid.width / size;
    const tileSize = unit * (1 - CONFIG.tileSpacingRatio);
    const offset = (unit - tileSize) / 2;

    for (let row = 0; row < size; row += 1) {
      for (let col = 0; col < size; col += 1) {
        const color = colors[pattern[row][col] % colors.length];
        const rgba = hexToRgba(color, 1.0);
        const x = targetGrid.x + col * unit + offset;
        const y = targetGrid.y + row * unit + offset;
        renderer.drawRect(x, y, tileSize, tileSize, rgba);
      }
    }
  }

  _drawPlayTiles(renderer, grid, colors) {
    const { playGrid } = this.layout;
    const size = grid.size;
    const unit = playGrid.width / size;
    const tileSize = unit * (1 - CONFIG.tileSpacingRatio);
    const offset = (unit - tileSize) / 2;

    for (const tile of grid.tiles) {
      const { row, col } = grid.getTilePosition(tile);
      const color = colors[tile.colorId % colors.length];
      const rgba = hexToRgba(color, 1.0);
      const x = playGrid.x + col * unit + offset;
      const y = playGrid.y + row * unit + offset;
      renderer.drawRect(x, y, tileSize, tileSize, rgba);
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
