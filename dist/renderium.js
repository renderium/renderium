(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Renderium = factory());
}(this, (function () { 'use strict';

/* This program is free software. It comes without any warranty, to
     * the extent permitted by applicable law. You can redistribute it
     * and/or modify it under the terms of the Do What The Fuck You Want
     * To Public License, Version 2, as published by Sam Hocevar. See
     * http://www.wtfpl.net/ for more details. */
var index = leftPad;

var cache = ['', ' ', '  ', '   ', '    ', '     ', '      ', '       ', '        ', '         '];

function leftPad(str, len, ch) {
  // convert `str` to `string`
  str = str + '';
  // `len` is the `pad`'s length now
  len = len - str.length;
  // doesn't need to pad
  if (len <= 0) return str;
  // `ch` defaults to `' '`
  if (!ch && ch !== 0) ch = ' ';
  // convert `ch` to `string`
  ch = ch + '';
  // cache common use cases
  if (ch === ' ' && len < 10) return cache[len] + str;
  // `pad` starts with an empty string
  var pad = '';
  // loop
  while (true) {
    // add `ch` to `pad` if `len` is odd
    if (len & 1) pad += ch;
    // divide `len` by 2, ditch the remainder
    len >>= 1;
    // "double" the `ch` so this operation count grows logarithmically on `len`
    // each time `ch` is "doubled", the `len` would need to be "doubled" too
    // similar to finding a value in binary search tree, hence O(log(n))
    if (len) ch += ch;
    // `len` is 0, exit the loop
    else break;
  }
  // pad `str`!
  return pad + str;
}

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();









var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var imageStatuses = {};
var images = {};

var ImageLoader = function () {
  function ImageLoader() {
    classCallCheck(this, ImageLoader);
  }

  ImageLoader.prototype.onload = function onload() {};

  ImageLoader.prototype.getImage = function getImage(url) {
    return images[url];
  };

  ImageLoader.prototype.getStatus = function getStatus(url) {
    return imageStatuses[url];
  };

  ImageLoader.prototype.load = function load(url) {
    var status = this.getStatus(url);
    var _this = this;
    if (status !== ImageLoader.IMAGE_STATUS_LOADING && status !== ImageLoader.IMAGE_STATUS_LOADED) {
      imageStatuses[url] = ImageLoader.IMAGE_STATUS_LOADING;
      var image = new window.Image();
      image.onload = function onload() {
        imageStatuses[url] = ImageLoader.IMAGE_STATUS_LOADED;
        images[url] = this;
        _this.onload();
      };
      image.src = url;
    }
  };

  return ImageLoader;
}();

ImageLoader.prototype.IMAGE_STATUS_LOADING = ImageLoader.IMAGE_STATUS_LOADING = 1;
ImageLoader.prototype.IMAGE_STATUS_LOADED = ImageLoader.IMAGE_STATUS_LOADED = 2;

var BaseLayer = function () {
  function BaseLayer(_ref) {
    var Vector = _ref.Vector,
        stats = _ref.stats,
        width = _ref.width,
        height = _ref.height;
    classCallCheck(this, BaseLayer);

    this.Vector = Vector || window.Vector;
    this.width = Number(width) || BaseLayer.DEFAULT_WIDTH;
    this.height = Number(height) || BaseLayer.DEFAULT_HEIGHT;
    this.logStats = Boolean(stats);

    this.canvas = document.createElement('canvas');

    this.imageLoader = new ImageLoader();

    this.components = [];
    this.stats = {};
    this._shouldRedraw = false;
  }

  BaseLayer.prototype.scale = function scale(_ref2) {
    var width = _ref2.width,
        height = _ref2.height;

    this.width = Number(width) || BaseLayer.DEFAULT_WIDTH;
    this.height = Number(height) || BaseLayer.DEFAULT_HEIGHT;

    this.canvas.removeAttribute('width');
    this.canvas.removeAttribute('height');
    this.canvas.removeAttribute('style');

    this.canvas.width = this.width;
    this.canvas.height = this.height;

    if (window.devicePixelRatio) {
      this.canvas.width = this.width * BaseLayer.PIXEL_RATIO;
      this.canvas.height = this.height * BaseLayer.PIXEL_RATIO;
    }

    this.applyStyles();

    this.forceRedraw();
  };

  BaseLayer.prototype.applyStyles = function applyStyles() {
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = 0;
    this.canvas.style.left = 0;
    this.canvas.style.right = 0;
    this.canvas.style.bottom = 0;
  };

  BaseLayer.prototype.clear = function clear() {
    this.clearStats();
  };

  BaseLayer.prototype.redraw = function redraw() {
    for (var i = 0; i < this.components.length; i++) {
      var component = this.components[i];
      component.plot(this);
      component.draw(this);
    }
    this._shouldRedraw = false;
  };

  BaseLayer.prototype.forceRedraw = function forceRedraw() {
    this._shouldRedraw = true;
  };

  BaseLayer.prototype.shouldRedraw = function shouldRedraw() {
    for (var i = 0; i < this.components.length; i++) {
      var component = this.components[i];
      if (component.shouldRedraw()) {
        return true;
      }
    }
    return this._shouldRedraw;
  };

  BaseLayer.prototype.addComponent = function addComponent(component) {
    var idx = this.components.indexOf(component);
    if (idx !== -1) {
      throw new Error('component ' + component.constructor.name + ' has already been added to layer');
    }
    if (typeof component.plot !== 'function' || typeof component.draw !== 'function' || typeof component.shouldRedraw !== 'function') {
      throw new Error('component ' + component.constructor.name + ' has not implemented Component interface');
    }
    this.components.push(component);
    this.forceRedraw();
  };

  BaseLayer.prototype.addComponents = function addComponents(components) {
    components.forEach(this.addComponent, this);
  };

  BaseLayer.prototype.removeComponent = function removeComponent(component) {
    var idx = this.components.indexOf(component);
    if (idx !== -1) {
      this.components.splice(idx, 1);
      this.forceRedraw();
    }
  };

  BaseLayer.prototype.removeComponents = function removeComponents(components) {
    components.forEach(this.removeComponent, this);
  };

  BaseLayer.prototype.clearComponents = function clearComponents() {
    this.components = [];
    this.forceRedraw();
  };

  BaseLayer.prototype.clearStats = function clearStats() {
    for (var methodName in this.stats) {
      this.stats[methodName] = 0;
    }
  };

  BaseLayer.prototype.collectStats = function collectStats(methodName) {
    this.stats[methodName]++;
  };

  BaseLayer.prototype.formatStats = function formatStats() {
    var result = [];
    var maxStringLength = 20;

    for (var methodName in this.stats) {
      result.push(methodName + index(this.stats[methodName], maxStringLength - methodName.length));
    }

    return result;
  };

  return BaseLayer;
}();

BaseLayer.PIXEL_RATIO = window.devicePixelRatio || 1;
BaseLayer.DEFAULT_WIDTH = 100;
BaseLayer.DEFAULT_HEIGHT = 100;

var Gradient = function () {
  Gradient.isGradient = function isGradient(color) {
    return color && color._isGradient;
  };

  function Gradient(_ref) {
    var start = _ref.start,
        end = _ref.end,
        from = _ref.from,
        to = _ref.to;
    classCallCheck(this, Gradient);

    this.start = start;
    this.end = end;
    this.from = from;
    this.to = to;

    this._isGradient = true;
    this._gradient = null;
  }

  Gradient.prototype.createGradient = function createGradient(layer) {
    layer.collectStats('createGradient');

    this._gradient = layer.ctx.createLinearGradient(this.start.x, this.start.y, this.end.x, this.end.y);
    this._gradient.addColorStop(0, this.from);
    this._gradient.addColorStop(1, this.to);
    return this._gradient;
  };

  Gradient.prototype.valueOf = function valueOf() {
    return this._gradient;
  };

  return Gradient;
}();

// -------------------------------------
// CanvasLayer
// -------------------------------------

var CanvasLayer = function (_BaseLayer) {
  inherits(CanvasLayer, _BaseLayer);

  function CanvasLayer(_ref) {
    var Vector = _ref.Vector,
        stats = _ref.stats,
        antialiasing = _ref.antialiasing,
        width = _ref.width,
        height = _ref.height;
    classCallCheck(this, CanvasLayer);

    var _this = possibleConstructorReturn(this, _BaseLayer.call(this, { Vector: Vector, stats: stats, width: width, height: height }));

    _this.antialiasing = Boolean(antialiasing);
    _this.ctx = _this.canvas.getContext('2d');

    _this.scale({ width: width, height: height });

    _this.imageLoader.onload = _this.forceRedraw.bind(_this);

    _this.stats = {
      createGradient: 0,
      drawArc: 0,
      drawCircle: 0,
      drawImage: 0,
      drawPolygon: 0,
      drawPolyline: 0,
      drawRect: 0,
      drawText: 0,
      measureText: 0,
      stroke: 0,
      fill: 0
    };
    return _this;
  }

  CanvasLayer.prototype.scale = function scale(_ref2) {
    var width = _ref2.width,
        height = _ref2.height;

    _BaseLayer.prototype.scale.call(this, { width: width, height: height });

    if (window.devicePixelRatio) {
      this.ctx.scale(BaseLayer.PIXEL_RATIO, BaseLayer.PIXEL_RATIO);
    }

    if (!this.antialiasing) {
      this.ctx.translate(0.5, 0.5);
    }
  };

  CanvasLayer.prototype.clear = function clear() {
    _BaseLayer.prototype.clear.call(this);
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.restore();
  };

  CanvasLayer.prototype.redraw = function redraw() {
    _BaseLayer.prototype.redraw.call(this);
    if (this.logStats) {
      this.drawStats();
    }
  };

  CanvasLayer.prototype.createGradient = function createGradient(_ref3) {
    var start = _ref3.start,
        end = _ref3.end,
        from = _ref3.from,
        to = _ref3.to;

    return new Gradient({ start: start, end: end, from: from, to: to });
  };

  CanvasLayer.prototype.getColor = function getColor(color) {
    return Gradient.isGradient(color) ? color.createGradient(this) : color;
  };

  CanvasLayer.prototype.drawArc = function drawArc(_ref4) {
    var position = _ref4.position,
        radius = _ref4.radius,
        startAngle = _ref4.startAngle,
        endAngle = _ref4.endAngle,
        color = _ref4.color,
        _ref4$width = _ref4.width,
        width = _ref4$width === undefined ? 1 : _ref4$width;

    this.collectStats('drawArc');

    this.ctx.strokeStyle = this.getColor(color);
    this.ctx.lineWidth = width;

    this.ctx.beginPath();
    this.ctx.arc(position.x, position.y, radius, startAngle, endAngle);

    if (color) {
      this.collectStats('stroke');
      this.ctx.stroke();
    }
  };

  CanvasLayer.prototype.drawCircle = function drawCircle(_ref5) {
    var position = _ref5.position,
        radius = _ref5.radius,
        color = _ref5.color,
        fillColor = _ref5.fillColor,
        _ref5$width = _ref5.width,
        width = _ref5$width === undefined ? 1 : _ref5$width;

    this.collectStats('drawCircle');

    this.drawArc({
      position: position,
      radius: radius,
      startAngle: 0,
      endAngle: 2 * Math.PI,
      color: color,
      width: width
    });

    if (fillColor) {
      this.collectStats('fill');
      this.ctx.fillStyle = this.getColor(fillColor);
      this.ctx.fill();
    }
  };

  CanvasLayer.prototype.drawImage = function drawImage(_ref6) {
    var position = _ref6.position,
        image = _ref6.image,
        _ref6$width = _ref6.width,
        width = _ref6$width === undefined ? image.width : _ref6$width,
        _ref6$height = _ref6.height,
        height = _ref6$height === undefined ? image.height : _ref6$height,
        _ref6$opacity = _ref6.opacity,
        opacity = _ref6$opacity === undefined ? 1 : _ref6$opacity;

    this.collectStats('drawImage');

    if (typeof image === 'string') {
      if (this.imageLoader.getStatus(image) === this.imageLoader.IMAGE_STATUS_LOADED) {
        image = this.imageLoader.getImage(image);
        width = width || image.width;
        height = height || image.height;
      } else if (this.imageLoader.getStatus(image) !== this.imageLoader.IMAGE_STATUS_LOADING) {
        this.imageLoader.load(image);
        return;
      } else {
        return;
      }
    }

    var defaultAlpha = this.ctx.globalAlpha;
    this.ctx.globalAlpha = opacity;
    if (this.antialiasing) {
      this.ctx.drawImage(image, position.x, position.y, width, height);
    } else {
      this.ctx.drawImage(image, position.x - 0.5, position.y - 0.5, width, height);
    }
    this.ctx.globalAlpha = defaultAlpha;
  };

  CanvasLayer.prototype.drawPolygon = function drawPolygon(_ref7) {
    var points = _ref7.points,
        color = _ref7.color,
        fillColor = _ref7.fillColor,
        _ref7$width = _ref7.width,
        width = _ref7$width === undefined ? 1 : _ref7$width;

    this.collectStats('drawPolygon');

    this.drawPolyline({
      points: points.concat(points[0]),
      color: color,
      width: width
    });

    if (fillColor) {
      this.collectStats('fill');
      this.ctx.fillStyle = this.getColor(fillColor);
      this.ctx.fill();
    }
  };

  CanvasLayer.prototype.drawPolyline = function drawPolyline(_ref8) {
    var points = _ref8.points,
        color = _ref8.color,
        _ref8$lineDash = _ref8.lineDash,
        lineDash = _ref8$lineDash === undefined ? [] : _ref8$lineDash,
        _ref8$width = _ref8.width,
        width = _ref8$width === undefined ? 1 : _ref8$width;

    this.collectStats('drawPolyline');

    this.ctx.lineWidth = width;

    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);

    for (var i = 1, point; i < points.length; i++) {
      point = points[i];
      this.ctx.lineTo(point.x, point.y);
    }

    this.ctx.setLineDash(lineDash);

    if (points[0].equals(points[points.length - 1])) {
      this.ctx.closePath();
    }

    if (color) {
      this.collectStats('stroke');
      this.ctx.strokeStyle = this.getColor(color);
      this.ctx.stroke();
    }
  };

  CanvasLayer.prototype.drawRect = function drawRect(_ref9) {
    var position = _ref9.position,
        width = _ref9.width,
        height = _ref9.height,
        color = _ref9.color,
        fillColor = _ref9.fillColor,
        _ref9$strokeWidth = _ref9.strokeWidth,
        strokeWidth = _ref9$strokeWidth === undefined ? 1 : _ref9$strokeWidth;

    this.collectStats('drawRect');

    this.ctx.lineWidth = strokeWidth;

    this.ctx.beginPath();
    if (this.antialiasing) {
      this.ctx.rect(position.x, position.y, width, height);
    } else {
      this.ctx.rect(position.x - 0.5, position.y - 0.5, width, height);
    }
    this.ctx.closePath();

    if (color) {
      this.collectStats('stroke');
      this.ctx.strokeStyle = this.getColor(color);
      this.ctx.stroke();
    }

    if (fillColor) {
      this.collectStats('fill');
      this.ctx.fillStyle = this.getColor(fillColor);
      this.ctx.fill();
    }
  };

  CanvasLayer.prototype.drawText = function drawText(_ref10) {
    var position = _ref10.position,
        text = _ref10.text,
        color = _ref10.color,
        font = _ref10.font,
        size = _ref10.size,
        _ref10$align = _ref10.align,
        align = _ref10$align === undefined ? 'center' : _ref10$align,
        _ref10$baseline = _ref10.baseline,
        baseline = _ref10$baseline === undefined ? 'middle' : _ref10$baseline;

    this.collectStats('drawText');

    this.ctx.fillStyle = this.getColor(color);
    this.ctx.font = size + 'px ' + font;
    this.ctx.textAlign = align;
    this.ctx.textBaseline = baseline;

    this.ctx.fillText(text, position.x, position.y);
  };

  CanvasLayer.prototype.measureText = function measureText(_ref11) {
    var text = _ref11.text,
        font = _ref11.font,
        size = _ref11.size;

    this.collectStats('measureText');

    var width;
    if (font && size) {
      var defaultFont = this.ctx.font;
      this.ctx.font = size + 'px ' + font;
      width = this.ctx.measureText(text).width;
      this.ctx.font = defaultFont;
    } else {
      width = this.ctx.measureText(text).width;
    }
    return width;
  };

  CanvasLayer.prototype.drawStats = function drawStats() {
    var stats = this.formatStats();

    for (var i = stats.length; i--;) {
      this.drawText({
        position: new this.Vector(this.width - 10, this.height - 14 * (stats.length - i)),
        text: stats[i],
        color: '#fff',
        font: 'Courier, monospace',
        size: 14,
        align: 'right',
        baleline: 'bottom'
      });
    }
  };

  return CanvasLayer;
}(BaseLayer);

function getContext(canvas) {
  var gl = canvas.getContext('webgl');
  if (!gl) {
    gl = canvas.getContext('experimental-webgl');
  }
  return gl;
}

function compileShader(gl, shaderSource, shaderType) {
  var shader = gl.createShader(shaderType);
  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!success) {
    throw new Error('could not compile shader: ' + gl.getShaderInfoLog(shader));
  }
  return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!success) {
    throw new Error('program failed to link: ' + gl.getProgramInfoLog(program));
  }
  return program;
}

function parseHexColor(color) {
  return parseInt(color.replace('#', ''), 16);
}

function parseRgbColor(color) {
  color = color.match(/\d+\.?\d*/g);

  var r = Number(color[0]);
  var g = Number(color[1]);
  var b = Number(color[2]);

  return (r << 16) + (g << 8) + b;
}

var colorCache = {};
var cacheLength = 0;
var MAX_CACHE_LENGTH = 64;

function parseColor(color) {
  var result;

  if (colorCache[color]) {
    return colorCache[color];
  }

  if (color[0] === '#') {
    result = parseHexColor(color);
  } else if (color[0] === 'r') {
    result = parseRgbColor(color);
  } else {
    throw new Error('Wrong color format: ' + color);
  }

  if (cacheLength < MAX_CACHE_LENGTH) {
    colorCache[color] = result;
    cacheLength++;
  }

  return result;
}

var Gradient$2 = function () {
  Gradient.isGradient = function isGradient(color) {
    return color && color._isGradient;
  };

  function Gradient(_ref) {
    var start = _ref.start,
        end = _ref.end,
        from = _ref.from,
        to = _ref.to;
    classCallCheck(this, Gradient);

    this.start = start;
    this.end = end;
    this.from = parseColor(from);
    this.to = parseColor(to);

    this._isGradient = true;
    this._gradient = null;
  }

  Gradient.prototype.createGradient = function createGradient(layer) {
    layer.collectStats('createGradient');

    return this.from;
  };

  Gradient.prototype.valueOf = function valueOf() {
    return this.from;
  };

  return Gradient;
}();

var vertextShaderSource = "uniform vec2 u_resolution;\r\n\r\nattribute vec2 a_position;\r\nattribute float a_color;\r\n\r\nvarying vec4 v_color;\r\n\r\nconst vec2 unit = vec2(1, -1);\r\n\r\nvec4 convertPoints (vec2 position, vec2 resolution) {\r\n  return vec4((position / resolution * 2.0 - 1.0) * unit, 0, 1);\r\n}\r\n\r\nvec4 convertColor (float color, float alpha) {\r\n  // because bitwise operators not supported\r\n  float b = mod(color, 256.0) / 255.0; color = floor(color / 256.0);\r\n  float g = mod(color, 256.0) / 255.0; color = floor(color / 256.0);\r\n  float r = mod(color, 256.0) / 255.0;\r\n\r\n  return vec4 (r, g, b, alpha);\r\n}\r\n\r\nvoid main () {\r\n  gl_Position = convertPoints(a_position, u_resolution);\r\n  v_color = convertColor(a_color, 1.0);\r\n}\r\n";

var fragmentShaderSource = "precision mediump float;\r\n\r\nvarying vec4 v_color;\r\n\r\nvoid main() {\r\n  gl_FragColor = v_color;\r\n}\r\n";

// -------------------------------------
// WebglLayer
// -------------------------------------

var WebglLayer = function (_BaseLayer) {
  inherits(WebglLayer, _BaseLayer);

  function WebglLayer(_ref) {
    var Vector = _ref.Vector,
        stats = _ref.stats,
        width = _ref.width,
        height = _ref.height;
    classCallCheck(this, WebglLayer);

    var _this = possibleConstructorReturn(this, _BaseLayer.call(this, { Vector: Vector, stats: stats, width: width, height: height }));

    _this.gl = getContext(_this.canvas);

    _this.scale({ width: width, height: height });

    _this.imageLoader.onload = _this.forceRedraw.bind(_this);

    _this.vertices = [];
    _this.indices = [];

    _this._vertexShader = compileShader(_this.gl, vertextShaderSource, _this.gl.VERTEX_SHADER);
    _this._fragmentShader = compileShader(_this.gl, fragmentShaderSource, _this.gl.FRAGMENT_SHADER);

    _this._program = createProgram(_this.gl, _this._vertexShader, _this._fragmentShader);
    _this.gl.useProgram(_this._program);

    _this._resolutionLocation = _this.gl.getUniformLocation(_this._program, 'u_resolution');
    _this._positionLocation = _this.gl.getAttribLocation(_this._program, 'a_position');
    _this._colorLocation = _this.gl.getAttribLocation(_this._program, 'a_color');

    _this._verticesBuffer = _this.gl.createBuffer();
    _this.gl.bindBuffer(_this.gl.ARRAY_BUFFER, _this._verticesBuffer);

    _this._indicesBuffer = _this.gl.createBuffer();
    _this.gl.bindBuffer(_this.gl.ELEMENT_ARRAY_BUFFER, _this._indicesBuffer);

    _this.gl.enableVertexAttribArray(_this._positionLocation);
    _this.gl.enableVertexAttribArray(_this._colorLocation);

    _this.gl.vertexAttribPointer(_this._positionLocation, _this.POSITION_SIZE, _this.gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * _this.ATTRIBUTES_SIZE, 0);
    _this.gl.vertexAttribPointer(_this._colorLocation, _this.COLOR_SIZE, _this.gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * _this.ATTRIBUTES_SIZE, Float32Array.BYTES_PER_ELEMENT * _this.POSITION_SIZE);
    return _this;
  }

  WebglLayer.prototype.scale = function scale(_ref2) {
    var width = _ref2.width,
        height = _ref2.height;

    _BaseLayer.prototype.scale.call(this, { width: width, height: height });

    this.gl.viewport(0, 0, this.width * BaseLayer.PIXEL_RATIO, this.height * BaseLayer.PIXEL_RATIO);
  };

  WebglLayer.prototype.clear = function clear() {
    _BaseLayer.prototype.clear.call(this);
    this.vertices = [];
    this.indices = [];
    this.gl.clearColor(0, 0, 0, 0);
    this.gl.clearDepth(1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  };

  WebglLayer.prototype.redraw = function redraw() {
    _BaseLayer.prototype.redraw.call(this);

    this.gl.uniform2f(this._resolutionLocation, this.width, this.height);

    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.vertices), this.gl.DYNAMIC_DRAW);

    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), this.gl.DYNAMIC_DRAW);

    this.gl.drawElements(this.gl.TRIANGLES, this.indices.length, this.gl.UNSIGNED_SHORT, 0);
  };

  WebglLayer.prototype.createGradient = function createGradient(_ref3) {
    var start = _ref3.start,
        end = _ref3.end,
        from = _ref3.from,
        to = _ref3.to;

    return new Gradient$2({ start: start, end: end, from: from, to: to });
  };

  WebglLayer.prototype.getColor = function getColor(color) {
    return Gradient$2.isGradient(color) ? color.createGradient(this) : parseColor(color);
  };

  WebglLayer.prototype.drawArc = function drawArc(_ref4) {
    var position = _ref4.position,
        radius = _ref4.radius,
        startAngle = _ref4.startAngle,
        endAngle = _ref4.endAngle,
        color = _ref4.color,
        _ref4$width = _ref4.width,
        width = _ref4$width === undefined ? 1 : _ref4$width;
  };

  WebglLayer.prototype.drawCircle = function drawCircle(_ref5) {
    var position = _ref5.position,
        radius = _ref5.radius,
        color = _ref5.color,
        fillColor = _ref5.fillColor,
        _ref5$width = _ref5.width,
        width = _ref5$width === undefined ? 1 : _ref5$width;
  };

  WebglLayer.prototype.drawImage = function drawImage(_ref6) {
    var position = _ref6.position,
        image = _ref6.image,
        _ref6$width = _ref6.width,
        width = _ref6$width === undefined ? image.width : _ref6$width,
        _ref6$height = _ref6.height,
        height = _ref6$height === undefined ? image.height : _ref6$height,
        _ref6$opacity = _ref6.opacity,
        opacity = _ref6$opacity === undefined ? 1 : _ref6$opacity;

    if (typeof image === 'string') {
      if (this.imageLoader.getStatus(image) === this.imageLoader.IMAGE_STATUS_LOADED) {
        image = this.imageLoader.getImage(image);
        width = width || image.width;
        height = height || image.height;
      } else if (this.imageLoader.getStatus(image) !== this.imageLoader.IMAGE_STATUS_LOADING) {
        this.imageLoader.load(image);
        return;
      } else {
        return;
      }
    }
  };

  WebglLayer.prototype.drawPolygon = function drawPolygon(_ref7) {
    var points = _ref7.points,
        color = _ref7.color,
        fillColor = _ref7.fillColor,
        _ref7$width = _ref7.width,
        width = _ref7$width === undefined ? 1 : _ref7$width;

    this.collectStats('drawPolygon');

    this.drawPolyline({
      points: points.concat(points[0]),
      color: color,
      width: width
    });
  };

  WebglLayer.prototype.drawPolyline = function drawPolyline(_ref8) {
    var points = _ref8.points,
        color = _ref8.color,
        _ref8$lineDash = _ref8.lineDash,
        lineDash = _ref8$lineDash === undefined ? [] : _ref8$lineDash,
        _ref8$width = _ref8.width,
        width = _ref8$width === undefined ? 1 : _ref8$width;

    this.collectStats('drawPolyline');
  };

  WebglLayer.prototype.drawRect = function drawRect(_ref9) {
    var position = _ref9.position,
        width = _ref9.width,
        height = _ref9.height,
        color = _ref9.color,
        fillColor = _ref9.fillColor,
        _ref9$strokeWidth = _ref9.strokeWidth,
        strokeWidth = _ref9$strokeWidth === undefined ? 1 : _ref9$strokeWidth;

    this.collectStats('drawRect');

    var offset = this.vertices.length / this.ATTRIBUTES_SIZE;

    fillColor = this.getColor(fillColor);

    this.vertices.push(position.x, position.y, fillColor, position.x + width, position.y, fillColor, position.x + width, position.y + height, fillColor, position.x, position.y + height, fillColor);

    this.indices.push(offset, offset + 1, offset + 2, offset, offset + 2, offset + 3);
  };

  WebglLayer.prototype.drawText = function drawText(_ref10) {
    var position = _ref10.position,
        text = _ref10.text,
        color = _ref10.color,
        font = _ref10.font,
        size = _ref10.size,
        _ref10$align = _ref10.align,
        align = _ref10$align === undefined ? 'center' : _ref10$align,
        _ref10$baseline = _ref10.baseline,
        baseline = _ref10$baseline === undefined ? 'middle' : _ref10$baseline;
  };

  WebglLayer.prototype.measureText = function measureText(_ref11) {
    var text = _ref11.text;

    return 0;
  };

  WebglLayer.prototype.drawStats = function drawStats() {
    var stats = this.formatStats();

    for (var i = stats.length; i--;) {
      this.drawText({
        position: new this.Vector(this.width - 10, this.height - 14 * (stats.length - i)),
        text: stats[i],
        color: '#fff',
        font: 'Courier, monospace',
        size: 14,
        align: 'right',
        baleline: 'bottom'
      });
    }
  };

  createClass(WebglLayer, [{
    key: 'POSITION_SIZE',
    get: function () {
      return 2;
    }
  }, {
    key: 'COLOR_SIZE',
    get: function () {
      return 1;
    }
  }, {
    key: 'ATTRIBUTES_SIZE',
    get: function () {
      return this.POSITION_SIZE + this.COLOR_SIZE;
    }
  }]);
  return WebglLayer;
}(BaseLayer);

var Component = function () {
  function Component() {
    classCallCheck(this, Component);
  }

  Component.prototype.plot = function plot(layer) {};

  Component.prototype.draw = function draw(layer) {};

  Component.prototype.shouldRedraw = function shouldRedraw() {
    return false;
  };

  return Component;
}();

var colors = {
  RED: '#f44336',
  PINK: '#e91e63',
  PURPLE: '#9c27b0',
  DEEP_PURPLE: '#673ab7',
  INDIGO: '#3f51b5',
  BLUE: '#2196f3',
  LIGHT_BLUE: '#03a9f4',
  CYAN: '#00bcd4',
  TEAL: '#009688',
  GREEN: '#4caf50',
  LIGHT_GREEN: '#8bc34a',
  LIME: '#cddc39',
  YELLOW: '#ffeb3b',
  AMBER: '#ffc107',
  ORANGE: '#ff9800',
  DEEP_ORANGE: '#ff5722',
  BROWN: '#795548',
  GREY: '#9e9e9e',
  BLUE_GREY: '#607d8b'
};

var Renderium = function () {
  Renderium.spawn = function spawn(renderer) {
    var idx = Renderium.instances.indexOf(renderer);
    if (idx !== -1) {
      throw new Error('renderer has already been spawned');
    }
    Renderium.instances.push(renderer);
  };

  Renderium.kill = function kill(renderer) {
    var idx = Renderium.instances.indexOf(renderer);
    if (idx !== -1) {
      Renderium.instances.splice(idx, 1);
    }
  };

  Renderium.digest = function digest() {
    for (var i = 0; i < Renderium.instances.length; i++) {
      var renderer = Renderium.instances[i];
      renderer.scale();
      renderer.clear();
      renderer.redraw();
    }
  };

  function Renderium(_ref) {
    var el = _ref.el;
    classCallCheck(this, Renderium);

    this.el = el;
    this.el.style.position = 'relative';
    this.el.style.width = '100%';
    this.el.style.height = '100%';
    this.width = this.el.clientWidth;
    this.height = this.el.clientHeight;
    this.layers = [];
  }

  Renderium.prototype.addLayer = function addLayer(layer) {
    var idx = this.layers.indexOf(layer);
    if (idx !== -1) {
      throw new Error('layer has already been added to renderer');
    }
    this.layers.push(layer);
    this.el.appendChild(layer.canvas);
    layer.scale({ width: this.width, height: this.height });
  };

  Renderium.prototype.removeLayer = function removeLayer(layer) {
    var idx = this.layers.indexOf(layer);
    if (idx !== -1) {
      this.layers.splice(idx, 1);
      this.el.removeChild(layer.canvas);
    }
  };

  Renderium.prototype.scale = function scale() {
    var width = this.el.clientWidth;
    var height = this.el.clientHeight;

    if (width !== this.width || height !== this.height) {
      for (var i = 0; i < this.layers.length; i++) {
        var layer = this.layers[i];
        layer.scale({ width: width, height: height });
      }
      this.width = width;
      this.height = height;
    }
  };

  Renderium.prototype.clear = function clear() {
    for (var i = 0; i < this.layers.length; i++) {
      var layer = this.layers[i];
      if (layer.shouldRedraw()) {
        layer.clear();
      }
    }
  };

  Renderium.prototype.redraw = function redraw() {
    for (var i = 0; i < this.layers.length; i++) {
      var layer = this.layers[i];
      if (layer.shouldRedraw()) {
        layer.redraw();
      }
    }
  };

  return Renderium;
}();

Renderium.instances = [];

Renderium.BaseLayer = BaseLayer;
Renderium.CanvasLayer = CanvasLayer;
Renderium.WebglLayer = WebglLayer;
Renderium.Component = Component;
Renderium.colors = colors;

return Renderium;

})));
