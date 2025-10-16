import { hexToRgba } from './config.js';

const RECT_VERTEX_COUNT = 6;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile error: ${message}`);
  }
  return shader;
}

function createProgram(gl, vertexSource, fragmentSource) {
  const program = gl.createProgram();
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Program link error: ${message}`);
  }
  return program;
}

export class Renderer {
  constructor(gl) {
    this.gl = gl;
    this.width = 0;
    this.height = 0;
    this.colorProgram = null;
    this.textProgram = null;
    this.positionBuffer = gl.createBuffer();
    this.colorBuffer = gl.createBuffer();
    this.texPositionBuffer = gl.createBuffer();
    this.texCoordBuffer = gl.createBuffer();
    this.textCache = new Map();
    this.textCanvas = document.createElement('canvas');
    this.textContext = this.textCanvas.getContext('2d');
    this.activeProgram = null;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    this._initPrograms();
  }

  _initPrograms() {
    const colorVertex = `#version 300 es\nprecision highp float;\nin vec2 a_position;\nin vec4 a_color;\nuniform vec2 u_resolution;\nout vec4 v_color;\nvoid main() {\n  vec2 zeroToOne = a_position / u_resolution;\n  vec2 clip = zeroToOne * 2.0 - 1.0;\n  gl_Position = vec4(clip * vec2(1.0, -1.0), 0.0, 1.0);\n  v_color = a_color;\n}`;
    const colorFragment = `#version 300 es\nprecision highp float;\nin vec4 v_color;\nout vec4 outColor;\nvoid main() {\n  outColor = v_color;\n}`;
    const textVertex = `#version 300 es\nprecision highp float;\nin vec2 a_position;\nin vec2 a_texCoord;\nuniform vec2 u_resolution;\nout vec2 v_texCoord;\nvoid main() {\n  vec2 zeroToOne = a_position / u_resolution;\n  vec2 clip = zeroToOne * 2.0 - 1.0;\n  gl_Position = vec4(clip * vec2(1.0, -1.0), 0.0, 1.0);\n  v_texCoord = a_texCoord;\n}`;
    const textFragment = `#version 300 es\nprecision highp float;\nin vec2 v_texCoord;\nuniform sampler2D u_texture;\nout vec4 outColor;\nvoid main() {\n  outColor = texture(u_texture, v_texCoord);\n}`;

    this.colorProgram = createProgram(this.gl, colorVertex, colorFragment);
    this.textProgram = createProgram(this.gl, textVertex, textFragment);

    this.colorLocations = {
      position: this.gl.getAttribLocation(this.colorProgram, 'a_position'),
      color: this.gl.getAttribLocation(this.colorProgram, 'a_color'),
      resolution: this.gl.getUniformLocation(this.colorProgram, 'u_resolution'),
    };

    this.textLocations = {
      position: this.gl.getAttribLocation(this.textProgram, 'a_position'),
      texCoord: this.gl.getAttribLocation(this.textProgram, 'a_texCoord'),
      resolution: this.gl.getUniformLocation(this.textProgram, 'u_resolution'),
      texture: this.gl.getUniformLocation(this.textProgram, 'u_texture'),
    };
  }

  begin(width, height, clearColor) {
    const gl = this.gl;
    this.width = width;
    this.height = height;
    gl.viewport(0, 0, width, height);
    gl.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  _useColorProgram() {
    if (this.activeProgram === 'color') {
      return;
    }
    const gl = this.gl;
    gl.useProgram(this.colorProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.enableVertexAttribArray(this.colorLocations.position);
    gl.vertexAttribPointer(this.colorLocations.position, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
    gl.enableVertexAttribArray(this.colorLocations.color);
    gl.vertexAttribPointer(this.colorLocations.color, 4, gl.FLOAT, false, 0, 0);
    gl.uniform2f(this.colorLocations.resolution, this.width, this.height);
    this.activeProgram = 'color';
  }

  _useTextProgram(texture) {
    if (this.activeProgram !== 'text') {
      const gl = this.gl;
      gl.useProgram(this.textProgram);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.texPositionBuffer);
      gl.enableVertexAttribArray(this.textLocations.position);
      gl.vertexAttribPointer(this.textLocations.position, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
      gl.enableVertexAttribArray(this.textLocations.texCoord);
      gl.vertexAttribPointer(this.textLocations.texCoord, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(this.textLocations.resolution, this.width, this.height);
      this.activeProgram = 'text';
    }
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(this.textLocations.texture, 0);
  }

  drawRect(x, y, width, height, color) {
    const gl = this.gl;
    this._useColorProgram();

    const x1 = x;
    const y1 = y;
    const x2 = x + width;
    const y2 = y + height;

    const positions = new Float32Array([
      x1, y1,
      x2, y1,
      x1, y2,
      x1, y2,
      x2, y1,
      x2, y2,
    ]);

    const colors = new Float32Array([
      ...color,
      ...color,
      ...color,
      ...color,
      ...color,
      ...color,
    ]);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.DYNAMIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, RECT_VERTEX_COUNT);
  }

  drawFrame(x, y, width, height, thickness, color) {
    this.drawRect(x, y, width, thickness, color);
    this.drawRect(x, y + height - thickness, width, thickness, color);
    this.drawRect(x, y, thickness, height, color);
    this.drawRect(x + width - thickness, y, thickness, height, color);
  }

  drawText(text, x, y, options = {}) {
    const {
      font = '600 28px "Inter", "Segoe UI", sans-serif',
      color = '#ffffff',
      align = 'left',
      baseline = 'top',
      maxWidth = null,
    } = options;

    const key = `${font}|${color}|${text}`;
    let entry = this.textCache.get(key);
    if (!entry) {
      entry = this._createTextTexture(text, font, color, maxWidth);
      this.textCache.set(key, entry);
    }

    let drawX = x;
    let drawY = y;
    if (align === 'center') {
      drawX -= entry.width / 2;
    } else if (align === 'right') {
      drawX -= entry.width;
    }

    if (baseline === 'middle') {
      drawY -= entry.height / 2;
    } else if (baseline === 'bottom') {
      drawY -= entry.height;
    }

    const gl = this.gl;
    this._useTextProgram(entry.texture);

    const x1 = drawX;
    const y1 = drawY;
    const x2 = drawX + entry.width;
    const y2 = drawY + entry.height;

    const positions = new Float32Array([
      x1, y1,
      x2, y1,
      x1, y2,
      x1, y2,
      x2, y1,
      x2, y2,
    ]);

    const texCoords = new Float32Array([
      0, 0,
      1, 0,
      0, 1,
      0, 1,
      1, 0,
      1, 1,
    ]);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.texPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, RECT_VERTEX_COUNT);

    return { width: entry.width, height: entry.height };
  }

  _createTextTexture(text, font, color, maxWidth) {
    const ctx = this.textContext;
    ctx.font = font;
    ctx.textBaseline = 'top';
    const metrics = ctx.measureText(text);
    const padding = 8;
    let width = Math.ceil(metrics.width + padding * 2);
    const lineHeight = Math.ceil(metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent || parseInt(font, 10));
    let height = Math.ceil(lineHeight + padding * 2);

    if (maxWidth && width > maxWidth) {
      width = maxWidth;
    }

    this.textCanvas.width = width;
    this.textCanvas.height = height;

    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.fillStyle = color;
    ctx.clearRect(0, 0, width, height);
    ctx.fillText(text, padding, padding);

    const gl = this.gl;
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.textCanvas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    return {
      texture,
      width,
      height,
    };
  }

  clearTextCache() {
    for (const entry of this.textCache.values()) {
      this.gl.deleteTexture(entry.texture);
    }
    this.textCache.clear();
  }
}

export function colorFromHex(hex, alpha = 1.0) {
  return hexToRgba(hex, alpha);
}
