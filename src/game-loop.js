export class GameLoop {
  constructor({ update, render }) {
    this.update = update;
    this.render = render;
    this.running = false;
    this.lastTime = 0;
    this.frameRequest = null;
    this._tick = this._tick.bind(this);
  }

  start() {
    if (this.running) {
      return;
    }
    this.running = true;
    this.lastTime = performance.now();
    this.frameRequest = requestAnimationFrame(this._tick);
  }

  stop() {
    if (!this.running) {
      return;
    }
    cancelAnimationFrame(this.frameRequest);
    this.frameRequest = null;
    this.running = false;
  }

  _tick(now) {
    if (!this.running) {
      return;
    }
    const delta = Math.min(0.1, (now - this.lastTime) / 1000);
    this.lastTime = now;
    this.update(delta);
    this.render();
    this.frameRequest = requestAnimationFrame(this._tick);
  }
}
