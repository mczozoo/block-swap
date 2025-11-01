import { CONFIG } from './config.js';

function rectContains(rect, point) {
  return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;
}

export class UI {
  constructor() {
    this.layout = null;
    this.tileSpacingRatio = CONFIG.tileSpacingRatio;
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

  drawBoard(renderer, grid, texture, options = {}) {
    const { playGrid } = this.layout;
    const revealProgress = Math.max(0, Math.min(1, options.revealProgress ?? 0));
    const tileSpacingRatio = CONFIG.tileSpacingRatio * (1 - revealProgress);
    this.tileSpacingRatio = tileSpacingRatio;

    renderer.drawRect(playGrid.x, playGrid.y, playGrid.width, playGrid.height, CONFIG.tileBackground);
    this._drawPlayTiles(renderer, grid, texture, tileSpacingRatio);
  }

  getTileSpacingRatio() {
    return this.tileSpacingRatio;
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

  _drawPlayTiles(renderer, grid, texture, tileSpacingRatio) {
    const { playGrid } = this.layout;
    const size = grid.size;
    const unit = playGrid.width / size;
    const tileSize = unit * (1 - tileSpacingRatio);
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
    const tileSpacingRatio = this.tileSpacingRatio ?? CONFIG.tileSpacingRatio;
    const tileSize = unit * (1 - tileSpacingRatio);
    const offset = (unit - tileSize) / 2;
    const { row, col } = grid.getTilePosition(tile);
    const x = playGrid.x + col * unit + offset - 6;
    const y = playGrid.y + row * unit + offset - 6;
    const frameSize = tileSize + 12;
    renderer.drawFrame(x, y, frameSize, frameSize, 6, CONFIG.selectionColor);
  }

  drawConfetti(renderer, pieces) {
    if (!pieces?.length) {
      return;
    }
    for (const piece of pieces) {
      if (piece.baseAlpha == null) {
        piece.baseAlpha = piece.color?.[3] ?? 1;
      }
      const targetAlpha = (piece.baseAlpha ?? 1) * (piece.opacity ?? 1);
      piece.color[3] = targetAlpha;
      renderer.drawRect(piece.renderX, piece.renderY, piece.renderWidth, piece.renderHeight, piece.color);
    }
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

    const hintY = panelY + panelHeight * 0.42;

    const gridSize = 3;
    const gridMarginTop = Math.max(panelHeight * 0.05, 36);
    const gridMarginBottom = Math.max(panelHeight * 0.08, 32);
    const gridTop = hintY + gridMarginTop;
    const gridBottomLimit = panelY + panelHeight - gridMarginBottom;
    const availableGridHeight = Math.max(0, gridBottomLimit - gridTop);
    const maxGridSize = Math.max(0, Math.min(panelWidth * 0.6, availableGridHeight));

    if (maxGridSize <= 0) {
      return;
    }

    const spacingRatio = 0.18;
    const tileSize = maxGridSize / (gridSize + (gridSize - 1) * spacingRatio);
    const tileSpacing = tileSize * spacingRatio;
    const actualGridSize = tileSize * gridSize + tileSpacing * (gridSize - 1);
    const gridOriginX = panelX + panelWidth / 2 - actualGridSize / 2;
    const gridOriginY = gridTop + (availableGridHeight - actualGridSize) / 2;

    const tileCenter = (row, col) => ({
      x: gridOriginX + col * (tileSize + tileSpacing) + tileSize / 2,
      y: gridOriginY + row * (tileSize + tileSpacing) + tileSize / 2,
    });

    const tilePosition = (row, col) => ({
      x: gridOriginX + col * (tileSize + tileSpacing),
      y: gridOriginY + row * (tileSize + tileSpacing),
    });

    for (let row = 0; row < gridSize; row += 1) {
      for (let col = 0; col < gridSize; col += 1) {
        const { x, y } = tilePosition(row, col);
        renderer.drawRect(x, y, tileSize, tileSize, CONFIG.tutorialTileColorDefault);
      }
    }

    const firstTile = { row: 0, col: 0 };
    const secondTile = { row: 1, col: 2 };
    const firstTileStart = tilePosition(firstTile.row, firstTile.col);
    const secondTileStart = tilePosition(secondTile.row, secondTile.col);
    const firstTileCenter = tileCenter(firstTile.row, firstTile.col);
    const secondTileCenter = tileCenter(secondTile.row, secondTile.col);

    const firstSelectDuration = 0.7;
    const pointerTravelDuration = 0.8;
    const secondSelectDuration = 0.7;
    const swapDuration = 0.8;
    const pauseDuration = 0.6;
    const cycle = firstSelectDuration + pointerTravelDuration + secondSelectDuration + swapDuration + pauseDuration;
    const cycleTime = tutorial.timer % cycle;

    const firstSelectEnd = firstSelectDuration;
    const pointerTravelEnd = firstSelectEnd + pointerTravelDuration;
    const secondSelectEnd = pointerTravelEnd + secondSelectDuration;
    const swapEnd = secondSelectEnd + swapDuration;

    const lerp = (a, b, t) => a + (b - a) * t;
    const lerpPoint = (from, to, t) => ({
      x: lerp(from.x, to.x, t),
      y: lerp(from.y, to.y, t),
    });

    let firstTileDraw = { ...firstTileStart };
    let secondTileDraw = { ...secondTileStart };
    let showFirstSelection = cycleTime < swapEnd;
    let showSecondSelection = cycleTime >= pointerTravelEnd && cycleTime < swapEnd;

    if (cycleTime >= secondSelectEnd && cycleTime < swapEnd) {
      const swapProgress = (cycleTime - secondSelectEnd) / swapDuration;
      firstTileDraw = lerpPoint(firstTileStart, secondTileStart, swapProgress);
      secondTileDraw = lerpPoint(secondTileStart, firstTileStart, swapProgress);
    } else if (cycleTime >= swapEnd) {
      firstTileDraw = { ...secondTileStart };
      secondTileDraw = { ...firstTileStart };
      showFirstSelection = false;
      showSecondSelection = false;
    }

    renderer.drawRect(firstTileDraw.x, firstTileDraw.y, tileSize, tileSize, CONFIG.tutorialTileColorA);
    renderer.drawRect(secondTileDraw.x, secondTileDraw.y, tileSize, tileSize, CONFIG.tutorialTileColorB);

    const selectionPadding = Math.max(6, tileSize * 0.12);
    const selectionThickness = Math.max(3, tileSize * 0.08);

    if (showFirstSelection) {
      renderer.drawFrame(
        firstTileDraw.x - selectionPadding,
        firstTileDraw.y - selectionPadding,
        tileSize + selectionPadding * 2,
        tileSize + selectionPadding * 2,
        selectionThickness,
        CONFIG.selectionColor,
      );
    }

    if (showSecondSelection) {
      renderer.drawFrame(
        secondTileDraw.x - selectionPadding,
        secondTileDraw.y - selectionPadding,
        tileSize + selectionPadding * 2,
        tileSize + selectionPadding * 2,
        selectionThickness,
        CONFIG.selectionColor,
      );
    }

    let pointerPositionPoint = firstTileCenter;
    if (cycleTime < firstSelectEnd) {
      pointerPositionPoint = firstTileCenter;
    } else if (cycleTime < pointerTravelEnd) {
      const pointerProgress = (cycleTime - firstSelectEnd) / pointerTravelDuration;
      pointerPositionPoint = lerpPoint(firstTileCenter, secondTileCenter, pointerProgress);
    } else {
      pointerPositionPoint = secondTileCenter;
    }

    if (cycleTime < swapEnd) {
      const pointerSize = Math.max(8, tileSize * 0.3);
      const pointerTopLeftX = pointerPositionPoint.x - pointerSize / 2;
      const pointerTopLeftY = pointerPositionPoint.y + tileSize * 0.6;
      renderer.drawRect(pointerTopLeftX, pointerTopLeftY, pointerSize, pointerSize, CONFIG.tutorialPointerColor);
    }
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
