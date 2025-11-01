import { CONFIG } from './config.js';

function rectContains(rect, point) {
  return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;
}

export class UI {
  constructor() {
    this.layout = null;
  }

  computeLayout(width, height, _gridSize) {
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
    const availableHeight = Math.max(0, height - playAreaTop - padding);
    const availableRect = {
      x: padding,
      y: playAreaTop,
      width: contentWidth,
      height: availableHeight,
    };

    const isLandscape = width > height;
    let referenceRect = { x: 0, y: 0, width: 0, height: 0 };
    let playGrid = { x: 0, y: 0, width: 0, height: 0 };

    if (availableRect.width > 0 && availableRect.height > 0) {
      if (isLandscape) {
        const squareSize = Math.min(
          availableRect.height,
          Math.max(0, (availableRect.width - gap) / 2),
        );
        const totalWidth = squareSize * 2 + gap;
        const originX = availableRect.x + (availableRect.width - totalWidth) / 2;
        const originY = availableRect.y + (availableRect.height - squareSize) / 2;
        referenceRect = {
          x: originX,
          y: originY,
          width: squareSize,
          height: squareSize,
        };
        playGrid = {
          x: originX + squareSize + gap,
          y: originY,
          width: squareSize,
          height: squareSize,
        };
      } else {
        const squareSize = Math.min(
          availableRect.width,
          Math.max(0, (availableRect.height - gap) / 2),
        );
        const totalHeight = squareSize * 2 + gap;
        const originX = availableRect.x + (availableRect.width - squareSize) / 2;
        const originY = availableRect.y + (availableRect.height - totalHeight) / 2;
        referenceRect = {
          x: originX,
          y: originY,
          width: squareSize,
          height: squareSize,
        };
        playGrid = {
          x: originX,
          y: originY + squareSize + gap,
          width: squareSize,
          height: squareSize,
        };
      }
    }

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
      referenceRect,
      restartButton,
      completionPanel,
      panelRestart,
      panelNext,
      isLandscape,
    };

    return this.layout;
  }

  drawHud(renderer, state) {
    if (!this.layout) {
      return;
    }
    const { hudRect, restartButton } = this.layout;
    renderer.drawRect(hudRect.x, hudRect.y, hudRect.width, hudRect.height, CONFIG.hudBackground);

    const textMargin = 28;
    const centerY = hudRect.y + hudRect.height / 2;
    renderer.drawText(`Level ${state.level}`, hudRect.x + textMargin, centerY, {
      font: CONFIG.textFont,
      color: CONFIG.hudTextColor,
      baseline: 'middle',
    });

    const movesText =
      typeof state.goalMoves === 'number' ? `Moves ${state.moves} / ${state.goalMoves}` : `Moves ${state.moves}`;

    renderer.drawText(movesText, hudRect.x + hudRect.width / 2, centerY, {
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

  drawReference(renderer, texture) {
    if (!this.layout) {
      return;
    }
    const { referenceRect } = this.layout;
    if (referenceRect.width <= 0 || referenceRect.height <= 0) {
      return;
    }
    renderer.drawRect(
      referenceRect.x,
      referenceRect.y,
      referenceRect.width,
      referenceRect.height,
      CONFIG.targetBackground,
    );
    renderer.drawTexture(texture, referenceRect.x, referenceRect.y, referenceRect.width, referenceRect.height);
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
    if (!this.layout) {
      return;
    }
    const { completionPanel, panelRestart, panelNext } = this.layout;
    renderer.drawRect(completionPanel.x, completionPanel.y, completionPanel.width, completionPanel.height, CONFIG.panelBackground);
    renderer.drawText('Level Complete!', completionPanel.x + completionPanel.width / 2, completionPanel.y + completionPanel.height * 0.25, {
      font: CONFIG.panelTitleFont,
      color: CONFIG.buttonTextColor,
      align: 'center',
      baseline: 'middle',
    });
    const movesText =
      typeof state.goalMoves === 'number' ? `Moves ${state.moves} / ${state.goalMoves}` : `Moves ${state.moves}`;

    renderer.drawText(movesText, completionPanel.x + completionPanel.width / 2, completionPanel.y + completionPanel.height * 0.45, {
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

  drawTutorialOverlay(renderer, tutorial) {
    if (!tutorial?.active) {
      return;
    }

    const width = renderer.width;
    const height = renderer.height;
    renderer.drawRect(0, 0, width, height, CONFIG.tutorialOverlayColor);

    const panelWidth = Math.min(width * 0.8, 540);
    const panelHeight = Math.min(height * 0.65, 380);
    const panelX = width / 2 - panelWidth / 2;
    const panelY = height / 2 - panelHeight / 2;

    renderer.drawRect(panelX, panelY, panelWidth, panelHeight, CONFIG.tutorialPanelColor);

    renderer.drawText('Select tiles to swap.', panelX + panelWidth / 2, panelY + panelHeight * 0.28, {
      font: CONFIG.panelTitleFont,
      color: CONFIG.tutorialTextColor,
      align: 'center',
      baseline: 'middle',
    });

    renderer.drawText('Tap anywhere to start.', panelX + panelWidth / 2, panelY + panelHeight * 0.42, {
      font: CONFIG.smallTextFont,
      color: CONFIG.tutorialHintTextColor,
      align: 'center',
      baseline: 'middle',
    });

    const demoAreaCenterX = panelX + panelWidth / 2;
    const demoAreaCenterY = panelY + panelHeight * 0.7;
    const squareSize = Math.min(panelWidth * 0.22, panelHeight * 0.28);
    const gap = squareSize * 0.5;
    const leftStartX = demoAreaCenterX - gap / 2 - squareSize;
    const rightStartX = demoAreaCenterX + gap / 2;
    const tileY = demoAreaCenterY - squareSize / 2;

    const cycle = 2.6;
    const progress = (tutorial.timer % cycle) / cycle;
    const swapProgress = progress < 0.5 ? progress * 2 : (1 - progress) * 2;

    const leftX = leftStartX + (rightStartX - leftStartX) * swapProgress;
    const rightX = rightStartX + (leftStartX - rightStartX) * swapProgress;

    renderer.drawRect(leftX, tileY, squareSize, squareSize, CONFIG.tutorialTileColorA);
    renderer.drawFrame(leftX, tileY, squareSize, squareSize, Math.max(3, squareSize * 0.08), CONFIG.selectionColor);
    renderer.drawRect(rightX, tileY, squareSize, squareSize, CONFIG.tutorialTileColorB);
    renderer.drawFrame(rightX, tileY, squareSize, squareSize, Math.max(3, squareSize * 0.08), CONFIG.selectionColor);

    const pointerRadius = Math.max(6, squareSize * 0.16);
    const pointerProgress = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
    const pointerX = leftStartX + squareSize / 2 + (rightStartX + squareSize / 2 - (leftStartX + squareSize / 2)) * pointerProgress;
    const pointerY = demoAreaCenterY + squareSize * 0.65;
    const pointerX1 = pointerX - pointerRadius;
    const pointerY1 = pointerY - pointerRadius;
    renderer.drawRect(pointerX1, pointerY1, pointerRadius * 2, pointerRadius * 2, CONFIG.tutorialPointerColor);
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
