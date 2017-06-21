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
    var _this = this;

    var status = this.getStatus(url);
    if (status !== ImageLoader.IMAGE_STATUS_LOADING && status !== ImageLoader.IMAGE_STATUS_LOADED) {
      imageStatuses[url] = ImageLoader.IMAGE_STATUS_LOADING;
      var image = new window.Image();
      image.onload = function () {
        imageStatuses[url] = ImageLoader.IMAGE_STATUS_LOADED;
        images[url] = image;
        _this.onload();
      };
      image.src = url;
    }
  };

  return ImageLoader;
}();

ImageLoader.prototype.IMAGE_STATUS_LOADING = ImageLoader.IMAGE_STATUS_LOADING = 1;
ImageLoader.prototype.IMAGE_STATUS_LOADED = ImageLoader.IMAGE_STATUS_LOADED = 2;

var Component = function () {
  function Component() {
    classCallCheck(this, Component);
  }

  Component.isComponent = function isComponent(component) {
    return typeof component.plot === 'function' && typeof component.draw === 'function' && typeof component.shouldRedraw === 'function' && typeof component.onadd === 'function' && typeof component.onremove === 'function';
  };

  Component.prototype.onadd = function onadd(layer) {};

  Component.prototype.onremove = function onremove(layer) {};

  Component.prototype.plot = function plot(layer) {};

  Component.prototype.draw = function draw(layer) {};

  Component.prototype.shouldRedraw = function shouldRedraw() {
    return true;
  };

  return Component;
}();

function throwError(message) {
  throw new Error("\r\nRenderium: " + message);
}

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
    this._renderCycleStarted = false;
  }

  BaseLayer.prototype.scale = function scale(_ref2) {
    var width = _ref2.width,
        height = _ref2.height;

    if (this.renderCycleStarted()) {
      throwError('Layer#scale() during render cycle is forbidden');
    }

    this.width = Number(width) || BaseLayer.DEFAULT_WIDTH;
    this.height = Number(height) || BaseLayer.DEFAULT_HEIGHT;

    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.applyStyles();

    this.forceRedraw();
  };

  BaseLayer.prototype.applyStyles = function applyStyles() {
    if (this.renderCycleStarted()) {
      throwError('Layer#applyStyles() during render cycle is forbidden');
    }

    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = 0;
    this.canvas.style.left = 0;
    this.canvas.style.right = 0;
    this.canvas.style.bottom = 0;
  };

  BaseLayer.prototype.clear = function clear() {
    if (this.renderCycleStarted()) {
      throwError('Layer#clear() during render cycle is forbidden');
    }

    this.clearStats();
  };

  BaseLayer.prototype.redraw = function redraw(time) {
    if (this.renderCycleStarted()) {
      throwError('Layer#redraw() during render cycle is forbidden');
    }

    this.startRenderCycle();
    for (var i = 0; i < this.components.length; i++) {
      var component = this.components[i];
      if (component.shouldRedraw() || this._shouldRedraw) {
        component.plot(this, time);
      }
      component.draw(this, time);
    }
    this.completeRenderCycle();
    this.completeRedraw();
  };

  BaseLayer.prototype.forceRedraw = function forceRedraw() {
    this._shouldRedraw = true;
  };

  BaseLayer.prototype.completeRedraw = function completeRedraw() {
    this._shouldRedraw = false;
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

  BaseLayer.prototype.startRenderCycle = function startRenderCycle() {
    this._renderCycleStarted = true;
  };

  BaseLayer.prototype.completeRenderCycle = function completeRenderCycle() {
    this._renderCycleStarted = false;
  };

  BaseLayer.prototype.renderCycleStarted = function renderCycleStarted() {
    return this._renderCycleStarted;
  };

  BaseLayer.prototype.addComponent = function addComponent(component) {
    if (this.renderCycleStarted()) {
      throwError('Layer#addComponent() during render cycle is forbidden');
    }

    var idx = this.components.indexOf(component);
    if (idx !== -1) {
      throwError('Component ' + component.constructor.name + ' has already been added to layer');
    }
    if (!Component.isComponent(component)) {
      throwError('Component ' + component.constructor.name + ' has not implemented Component interface');
    }
    this.components.push(component);
    this.forceRedraw();
    component.onadd(this);
  };

  BaseLayer.prototype.addComponents = function addComponents(components) {
    components.forEach(this.addComponent, this);
  };

  BaseLayer.prototype.removeComponent = function removeComponent(component) {
    if (this.renderCycleStarted()) {
      throwError('Layer#removeComponent() during render cycle is forbidden');
    }

    var idx = this.components.indexOf(component);
    if (idx !== -1) {
      this.components.splice(idx, 1);
      this.forceRedraw();
    }
    component.onremove(this);
  };

  BaseLayer.prototype.removeComponents = function removeComponents(components) {
    components.forEach(this.removeComponent, this);
  };

  BaseLayer.prototype.clearComponents = function clearComponents() {
    if (this.renderCycleStarted()) {
      throwError('Layer#clearComponents() during render cycle is forbidden');
    }

    this.components = [];
    this.forceRedraw();
  };

  BaseLayer.prototype.clearStats = function clearStats() {
    if (this.renderCycleStarted()) {
      throwError('Layer#clearStats() during render cycle is forbidden');
    }

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

BaseLayer.DEFAULT_WIDTH = 100;
BaseLayer.DEFAULT_HEIGHT = 100;

var index$1 = function equal(arr1, arr2) {
  var length = arr1.length;
  if (length !== arr2.length) return false;
  for (var i = 0; i < length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }return true;
};

// -------------------------------------
// CanvasLayer
// -------------------------------------

var PIXEL_RATIO = window.devicePixelRatio || 1;

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
      stroke: 0,
      fill: 0
    };

    _this._shouldStroke = false;
    _this._shouldFill = false;
    return _this;
  }

  CanvasLayer.prototype.scale = function scale(_ref2) {
    var width = _ref2.width,
        height = _ref2.height;

    _BaseLayer.prototype.scale.call(this, { width: width, height: height });

    if (window.devicePixelRatio) {
      this.canvas.width = this.width * PIXEL_RATIO;
      this.canvas.height = this.height * PIXEL_RATIO;
      this.ctx.scale(PIXEL_RATIO, PIXEL_RATIO);
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

  CanvasLayer.prototype.redraw = function redraw(time) {
    _BaseLayer.prototype.redraw.call(this, time);
    this.performDraw();
    if (this.logStats) {
      this.drawStats();
    }
  };

  CanvasLayer.prototype.stateChanged = function stateChanged(_ref3) {
    var color = _ref3.color,
        fillColor = _ref3.fillColor,
        width = _ref3.width,
        lineDash = _ref3.lineDash,
        opacity = _ref3.opacity;

    return color && color !== this.ctx.strokeStyle || fillColor && fillColor !== this.ctx.fillStyle || width && width !== this.ctx.lineWidth || opacity && opacity !== this.ctx.globalAlpha || lineDash && !index$1(lineDash, this.ctx.getLineDash());
  };

  CanvasLayer.prototype.performDraw = function performDraw() {
    if (this.shouldStroke()) {
      this.ctx.stroke();
      this.completeStroke();
      this.collectStats('stroke');
    }
    if (this.shouldFill()) {
      this.ctx.fill();
      this.completeFill();
      this.collectStats('fill');
    }
    this.ctx.beginPath();
  };

  CanvasLayer.prototype.forceStroke = function forceStroke() {
    this._shouldStroke = true;
  };

  CanvasLayer.prototype.completeStroke = function completeStroke() {
    this._shouldStroke = false;
  };

  CanvasLayer.prototype.shouldStroke = function shouldStroke() {
    return this._shouldStroke;
  };

  CanvasLayer.prototype.forceFill = function forceFill() {
    this._shouldFill = true;
  };

  CanvasLayer.prototype.completeFill = function completeFill() {
    this._shouldFill = false;
  };

  CanvasLayer.prototype.shouldFill = function shouldFill() {
    return this._shouldFill;
  };

  CanvasLayer.prototype.createGradient = function createGradient(_ref4) {
    var start = _ref4.start,
        end = _ref4.end,
        from = _ref4.from,
        to = _ref4.to;

    var gradient = this.ctx.createLinearGradient(start.x, start.y, end.x, end.y);
    gradient.addColorStop(0, from);
    gradient.addColorStop(1, to);
    return gradient;
  };

  CanvasLayer.prototype.drawArc = function drawArc(_ref5) {
    var position = _ref5.position,
        radius = _ref5.radius,
        startAngle = _ref5.startAngle,
        endAngle = _ref5.endAngle,
        color = _ref5.color,
        _ref5$width = _ref5.width,
        width = _ref5$width === undefined ? 1 : _ref5$width,
        _ref5$opacity = _ref5.opacity,
        opacity = _ref5$opacity === undefined ? 1 : _ref5$opacity,
        _ref5$lineDash = _ref5.lineDash,
        lineDash = _ref5$lineDash === undefined ? [] : _ref5$lineDash;

    if (this.stateChanged({ color: color, width: width, opacity: opacity, lineDash: lineDash })) {
      this.performDraw();
    }

    this.ctx.arc(position.x, position.y, radius, startAngle, endAngle);

    if (color) {
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = width;
      this.ctx.globalAlpha = opacity;
      this.ctx.setLineDash(lineDash);
      this.forceStroke();
    }
  };

  CanvasLayer.prototype.drawCircle = function drawCircle(_ref6) {
    var position = _ref6.position,
        radius = _ref6.radius,
        color = _ref6.color,
        fillColor = _ref6.fillColor,
        _ref6$width = _ref6.width,
        width = _ref6$width === undefined ? 1 : _ref6$width,
        _ref6$opacity = _ref6.opacity,
        opacity = _ref6$opacity === undefined ? 1 : _ref6$opacity,
        _ref6$lineDash = _ref6.lineDash,
        lineDash = _ref6$lineDash === undefined ? [] : _ref6$lineDash;

    if (this.stateChanged({ color: color, fillColor: fillColor, width: width, opacity: opacity, lineDash: lineDash })) {
      this.performDraw();
    }

    this.drawArc({
      position: position,
      radius: radius,
      startAngle: 0,
      endAngle: 2 * Math.PI,
      color: color,
      width: width,
      opacity: opacity,
      lineDash: lineDash
    });

    if (fillColor) {
      this.ctx.fillStyle = fillColor;
      this.ctx.globalAlpha = opacity;
      this.forceFill();
    }
  };

  CanvasLayer.prototype.drawImage = function drawImage(_ref7) {
    var position = _ref7.position,
        image = _ref7.image,
        _ref7$width = _ref7.width,
        width = _ref7$width === undefined ? image.width : _ref7$width,
        _ref7$height = _ref7.height,
        height = _ref7$height === undefined ? image.height : _ref7$height,
        _ref7$opacity = _ref7.opacity,
        opacity = _ref7$opacity === undefined ? 1 : _ref7$opacity;

    this.performDraw();

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

    this.ctx.globalAlpha = opacity;
    if (this.antialiasing) {
      this.ctx.drawImage(image, position.x, position.y, width, height);
    } else {
      this.ctx.drawImage(image, position.x - 0.5, position.y - 0.5, width, height);
    }
  };

  CanvasLayer.prototype.drawPolygon = function drawPolygon(_ref8) {
    var points = _ref8.points,
        color = _ref8.color,
        fillColor = _ref8.fillColor,
        _ref8$width = _ref8.width,
        width = _ref8$width === undefined ? 1 : _ref8$width,
        _ref8$opacity = _ref8.opacity,
        opacity = _ref8$opacity === undefined ? 1 : _ref8$opacity,
        _ref8$lineDash = _ref8.lineDash,
        lineDash = _ref8$lineDash === undefined ? [] : _ref8$lineDash;

    if (this.stateChanged({ color: color, fillColor: fillColor, width: width, opacity: opacity, lineDash: lineDash })) {
      this.performDraw();
    }

    this.drawPolyline({
      points: points.concat(points[0]),
      color: color,
      width: width,
      opacity: opacity,
      lineDash: lineDash
    });

    if (fillColor) {
      this.ctx.fillStyle = fillColor;
      this.ctx.globalAlpha = opacity;
      this.forceFill();
    }
  };

  CanvasLayer.prototype.drawPolyline = function drawPolyline(_ref9) {
    var points = _ref9.points,
        color = _ref9.color,
        _ref9$width = _ref9.width,
        width = _ref9$width === undefined ? 1 : _ref9$width,
        _ref9$opacity = _ref9.opacity,
        opacity = _ref9$opacity === undefined ? 1 : _ref9$opacity,
        _ref9$lineDash = _ref9.lineDash,
        lineDash = _ref9$lineDash === undefined ? [] : _ref9$lineDash;

    if (this.stateChanged({ color: color, width: width, opacity: opacity, lineDash: lineDash })) {
      this.performDraw();
    }

    this.ctx.moveTo(points[0].x, points[0].y);

    for (var i = 1, point; i < points.length; i++) {
      point = points[i];
      this.ctx.lineTo(point.x, point.y);
    }

    if (points[0].equals(points[points.length - 1])) {
      this.ctx.closePath();
    }

    if (color) {
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = width;
      this.ctx.globalAlpha = opacity;
      this.ctx.setLineDash(lineDash);
      this.forceStroke();
    }
  };

  CanvasLayer.prototype.drawRect = function drawRect(_ref10) {
    var position = _ref10.position,
        width = _ref10.width,
        height = _ref10.height,
        color = _ref10.color,
        fillColor = _ref10.fillColor,
        _ref10$strokeWidth = _ref10.strokeWidth,
        strokeWidth = _ref10$strokeWidth === undefined ? 1 : _ref10$strokeWidth,
        _ref10$opacity = _ref10.opacity,
        opacity = _ref10$opacity === undefined ? 1 : _ref10$opacity,
        _ref10$lineDash = _ref10.lineDash,
        lineDash = _ref10$lineDash === undefined ? [] : _ref10$lineDash;

    if (this.stateChanged({ color: color, fillColor: fillColor, width: strokeWidth, opacity: opacity, lineDash: lineDash })) {
      this.performDraw();
    }

    if (this.antialiasing) {
      this.ctx.rect(position.x, position.y, width, height);
    } else {
      this.ctx.rect(position.x - 0.5, position.y - 0.5, width, height);
    }

    if (color) {
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = strokeWidth;
      this.ctx.globalAlpha = opacity;
      this.ctx.setLineDash(lineDash);
      this.forceStroke();
    }

    if (fillColor) {
      this.ctx.globalAlpha = opacity;
      this.ctx.fillStyle = fillColor;
      this.forceFill();
    }
  };

  CanvasLayer.prototype.drawText = function drawText(_ref11) {
    var position = _ref11.position,
        text = _ref11.text,
        color = _ref11.color,
        font = _ref11.font,
        size = _ref11.size,
        _ref11$align = _ref11.align,
        align = _ref11$align === undefined ? 'center' : _ref11$align,
        _ref11$baseline = _ref11.baseline,
        baseline = _ref11$baseline === undefined ? 'middle' : _ref11$baseline,
        _ref11$opacity = _ref11.opacity,
        opacity = _ref11$opacity === undefined ? 1 : _ref11$opacity;

    this.performDraw();

    this.ctx.fillStyle = color;
    this.ctx.font = size + 'px ' + font;
    this.ctx.textAlign = align;
    this.ctx.textBaseline = baseline;
    this.ctx.globalAlpha = opacity;

    this.ctx.fillText(text, position.x, position.y);
  };

  CanvasLayer.prototype.measureText = function measureText(_ref12) {
    var text = _ref12.text,
        font = _ref12.font,
        size = _ref12.size;

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

var LinearGradient = function () {
  LinearGradient.isGradient = function isGradient(color) {
    return color && color._isGradient;
  };

  function LinearGradient(_ref) {
    var start = _ref.start,
        end = _ref.end,
        from = _ref.from,
        to = _ref.to;
    classCallCheck(this, LinearGradient);

    this.start = start;
    this.end = end;
    this.from = from;
    this.to = to;

    this._isGradient = true;
  }

  return LinearGradient;
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
      throwError('Renderer has already been spawned');
    }
    Renderium.instances.push(renderer);
  };

  Renderium.kill = function kill(renderer) {
    var idx = Renderium.instances.indexOf(renderer);
    if (idx !== -1) {
      Renderium.instances.splice(idx, 1);
    }
  };

  Renderium.digest = function digest(time) {
    for (var i = 0; i < Renderium.instances.length; i++) {
      var renderer = Renderium.instances[i];
      renderer.scale();
      renderer.clear();
      renderer.redraw(time);
    }
  };

  function Renderium(_ref) {
    var el = _ref.el;
    classCallCheck(this, Renderium);

    this.el = el;
    this.applyStyles();
    this.width = this.el.clientWidth;
    this.height = this.el.clientHeight;
    this.layers = [];
  }

  Renderium.prototype.applyStyles = function applyStyles() {
    this.el.style.position = 'relative';
    this.el.style.width = '100%';
    this.el.style.height = '100%';
  };

  Renderium.prototype.addLayer = function addLayer(layer) {
    var idx = this.layers.indexOf(layer);
    if (idx !== -1) {
      throwError('Layer has already been added to renderer');
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

  Renderium.prototype.redraw = function redraw(time) {
    for (var i = 0; i < this.layers.length; i++) {
      var layer = this.layers[i];
      if (layer.shouldRedraw()) {
        layer.redraw(time);
      }
    }
  };

  return Renderium;
}();

Renderium.instances = [];

Renderium.BaseLayer = BaseLayer;
Renderium.CanvasLayer = CanvasLayer;
Renderium.LinearGradient = LinearGradient;
Renderium.Component = Component;
Renderium.colors = colors;

return Renderium;

})));
