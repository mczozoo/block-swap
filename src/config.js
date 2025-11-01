export const CONFIG = {
  paddingRatio: 0.05,
  tileSpacingRatio: 0.1,
  swapDuration: 0.18,
  solvePulseDuration: 0.28,
  baseBackground: [0.035, 0.04, 0.07, 1.0],
  hudBackground: [0.08, 0.09, 0.15, 0.88],
  panelBackground: [0.08, 0.12, 0.22, 0.94],
  tileBackground: [0.12, 0.14, 0.2, 0.75],
  targetBackground: [0.08, 0.1, 0.18, 0.75],
  selectionColor: [1.0, 0.82, 0.2, 0.85],
  solvedGlowColor: [0.24, 0.8, 0.52, 0.3],
  tutorialOverlayColor: [0.02, 0.03, 0.06, 0.75],
  tutorialPanelColor: [0.09, 0.12, 0.24, 0.96],
  tutorialTileColorDefault: [0.18, 0.2, 0.3, 1.0],
  tutorialTileColorA: [0.23, 0.62, 0.93, 1.0],
  tutorialTileColorB: [0.98, 0.55, 0.29, 1.0],
  tutorialPointerColor: [1.0, 0.98, 0.92, 0.92],
  tutorialTextColor: '#f8fbff',
  tutorialHintTextColor: '#d8e1ff',
  hudTextColor: '#f6f7ff',
  buttonBackground: [0.32, 0.36, 0.52, 0.92],
  buttonHover: [0.42, 0.46, 0.62, 0.95],
  buttonTextColor: '#ffffff',
  textFont: '600 28px "Inter", "Segoe UI", sans-serif',
  smallTextFont: '500 22px "Inter", "Segoe UI", sans-serif',
  panelTitleFont: '700 40px "Inter", "Segoe UI", sans-serif',
  colors: [
    '#ff6b6b',
    '#ffd166',
    '#4ecdc4',
    '#1a8fe3',
    '#c77dff',
    '#ff9f1c',
    '#9be564',
    '#ff99c8',
    '#48cae4',
    '#f94144',
    '#90be6d',
    '#577590',
    '#ffafcc',
    '#b5179e',
    '#f3722c',
    '#43aa8b',
  ],
};

export function hexToRgba(hex, alpha = 1.0) {
  const normalized = hex.replace('#', '');
  const value = parseInt(normalized, 16);
  const r = ((value >> 16) & 0xff) / 255;
  const g = ((value >> 8) & 0xff) / 255;
  const b = (value & 0xff) / 255;
  return [r, g, b, alpha];
}
