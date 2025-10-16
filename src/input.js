export class InputManager {
  constructor(canvas, onTap) {
    this.canvas = canvas;
    this.onTap = onTap;
    this.handlePointerDown = this.handlePointerDown.bind(this);

    canvas.addEventListener('pointerdown', this.handlePointerDown, { passive: false });
  }

  dispose() {
    this.canvas.removeEventListener('pointerdown', this.handlePointerDown);
  }

  handlePointerDown(event) {
    event.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const x = (event.clientX - rect.left) * dpr;
    const y = (event.clientY - rect.top) * dpr;
    if (typeof this.onTap === 'function') {
      this.onTap({ x, y });
    }
  }
}
