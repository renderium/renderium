(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Renderium = factory());
}(this, (function () { 'use strict';

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};









var get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

















var set = function set(object, property, value, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent !== null) {
      set(parent, property, value, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    desc.value = value;
  } else {
    var setter = desc.set;

    if (setter !== undefined) {
      setter.call(receiver, value);
    }
  }

  return value;
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

ImageLoader.IMAGE_STATUS_LOADING = 1;
ImageLoader.IMAGE_STATUS_LOADED = 2;

// -------------------------------------
// CanvasLayer
// -------------------------------------

var PIXEL_RATIO = window.devicePixelRatio || 1;

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

var CanvasLayer = function () {
  function CanvasLayer(_ref2) {
    var antialiasing = _ref2.antialiasing,
        width = _ref2.width,
        height = _ref2.height;
    classCallCheck(this, CanvasLayer);

    this.antialiasing = Boolean(antialiasing);
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.scale({
      width: width || CanvasLayer.DEFAULT_WIDTH,
      height: height || CanvasLayer.DEFAULT_HEIGHT
    });
    this.imageLoader = new ImageLoader();
    this.imageLoader.onload = this.forceRedraw.bind(this);

    this.components = [];

    this._shouldRedraw = false;
  }

  CanvasLayer.prototype.applyStyles = function applyStyles() {
    this.ctx.canvas.style.width = this.width + 'px';
    this.ctx.canvas.style.height = this.height + 'px';
    this.ctx.canvas.style.position = 'absolute';
    this.ctx.canvas.style.top = 0;
    this.ctx.canvas.style.left = 0;
    this.ctx.canvas.style.right = 0;
    this.ctx.canvas.style.bottom = 0;
  };

  CanvasLayer.prototype.scale = function scale(_ref3) {
    var width = _ref3.width,
        height = _ref3.height;

    this.width = width || CanvasLayer.DEFAULT_WIDTH;
    this.height = height || CanvasLayer.DEFAULT_HEIGHT;

    this.canvas.removeAttribute('width');
    this.canvas.removeAttribute('height');
    this.canvas.removeAttribute('style');

    this.ctx.canvas.width = this.width;
    this.ctx.canvas.height = this.height;

    this.applyStyles();

    if (window.devicePixelRatio) {
      this.ctx.canvas.width = this.width * PIXEL_RATIO;
      this.ctx.canvas.height = this.height * PIXEL_RATIO;
      this.ctx.scale(PIXEL_RATIO, PIXEL_RATIO);
    }

    if (!this.antialiasing) {
      this.ctx.translate(0.5, 0.5);
    }

    this.forceRedraw();
  };

  CanvasLayer.prototype.clear = function clear() {
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.restore();
  };

  CanvasLayer.prototype.redraw = function redraw() {
    for (var i = 0; i < this.components.length; i++) {
      var component = this.components[i];
      component.plot(this);
      component.draw(this);
    }
    this._shouldRedraw = false;
  };

  CanvasLayer.prototype.forceRedraw = function forceRedraw() {
    this._shouldRedraw = true;
  };

  CanvasLayer.prototype.shouldRedraw = function shouldRedraw() {
    for (var i = 0; i < this.components.length; i++) {
      var component = this.components[i];
      if (component.shouldRedraw()) {
        return true;
      }
    }
    return this._shouldRedraw;
  };

  CanvasLayer.prototype.addComponent = function addComponent(component) {
    var idx = this.components.indexOf(component);
    if (idx !== -1) {
      throw new Error('component has already been added to layer');
    }
    if (typeof component.plot !== 'function' || typeof component.draw !== 'function' || typeof component.shouldRedraw !== 'function') {
      throw new Error('component has not implemented Component interface');
    }
    this.components.push(component);
    this.forceRedraw();
  };

  CanvasLayer.prototype.removeComponent = function removeComponent(component) {
    var idx = this.components.indexOf(component);
    if (idx !== -1) {
      this.components.splice(idx, 1);
      this.forceRedraw();
    }
  };

  CanvasLayer.prototype.createGradient = function createGradient(_ref4) {
    var start = _ref4.start,
        end = _ref4.end,
        from = _ref4.from,
        to = _ref4.to;

    return new Gradient({ start: start, end: end, from: from, to: to });
  };

  CanvasLayer.prototype.getColor = function getColor(color) {
    return Gradient.isGradient(color) ? color.createGradient(this) : color;
  };

  CanvasLayer.prototype.drawArc = function drawArc(_ref5) {
    var position = _ref5.position,
        radius = _ref5.radius,
        startAngle = _ref5.startAngle,
        endAngle = _ref5.endAngle,
        color = _ref5.color,
        _ref5$width = _ref5.width,
        width = _ref5$width === undefined ? 1 : _ref5$width;

    this.ctx.strokeStyle = this.getColor(color);
    this.ctx.lineWidth = width;

    this.ctx.beginPath();
    this.ctx.arc(position.x, position.y, radius, startAngle, endAngle);

    if (color) {
      this.ctx.stroke();
    }
  };

  CanvasLayer.prototype.drawCircle = function drawCircle(_ref6) {
    var position = _ref6.position,
        radius = _ref6.radius,
        color = _ref6.color,
        fillColor = _ref6.fillColor,
        _ref6$width = _ref6.width,
        width = _ref6$width === undefined ? 1 : _ref6$width;

    this.drawArc({
      position: position,
      radius: radius,
      startAngle: 0,
      endAngle: 2 * Math.PI,
      color: color,
      width: width
    });

    if (fillColor) {
      this.ctx.fillStyle = this.getColor(fillColor);
      this.ctx.fill();
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

    if (typeof image === 'string') {
      if (this.imageLoader.getStatus(image) === ImageLoader.IMAGE_STATUS_LOADED) {
        image = this.imageLoader.getImage(image);
        width = width || image.width;
        height = height || image.height;
      } else if (this.imageLoader.getStatus(image) !== ImageLoader.IMAGE_STATUS_LOADING) {
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

  CanvasLayer.prototype.drawPolygon = function drawPolygon(_ref8) {
    var points = _ref8.points,
        color = _ref8.color,
        fillColor = _ref8.fillColor,
        _ref8$width = _ref8.width,
        width = _ref8$width === undefined ? 1 : _ref8$width;

    this.drawPolyline({
      points: points.concat(points[0]),
      color: color,
      width: width
    });

    if (fillColor) {
      this.ctx.fillStyle = this.getColor(fillColor);
      this.ctx.fill();
    }
  };

  CanvasLayer.prototype.drawPolyline = function drawPolyline(_ref9) {
    var points = _ref9.points,
        color = _ref9.color,
        _ref9$lineDash = _ref9.lineDash,
        lineDash = _ref9$lineDash === undefined ? [] : _ref9$lineDash,
        _ref9$width = _ref9.width,
        width = _ref9$width === undefined ? 1 : _ref9$width;

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
      this.ctx.strokeStyle = this.getColor(color);
      this.ctx.stroke();
    }
  };

  CanvasLayer.prototype.drawRect = function drawRect(_ref10) {
    var position = _ref10.position,
        width = _ref10.width,
        height = _ref10.height,
        color = _ref10.color,
        fillColor = _ref10.fillColor,
        _ref10$strokeWidth = _ref10.strokeWidth,
        strokeWidth = _ref10$strokeWidth === undefined ? 1 : _ref10$strokeWidth;

    this.ctx.lineWidth = strokeWidth;

    this.ctx.beginPath();
    if (this.antialiasing) {
      this.ctx.rect(position.x, position.y, width, height);
    } else {
      this.ctx.rect(position.x - 0.5, position.y - 0.5, width, height);
    }
    this.ctx.closePath();

    if (color) {
      this.ctx.strokeStyle = this.getColor(color);
      this.ctx.stroke();
    }

    if (fillColor) {
      this.ctx.fillStyle = this.getColor(fillColor);
      this.ctx.fill();
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
        baseline = _ref11$baseline === undefined ? 'middle' : _ref11$baseline;

    this.ctx.fillStyle = this.getColor(color);
    this.ctx.font = size + 'px ' + font;
    this.ctx.textAlign = align;
    this.ctx.textBaseline = baseline;

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

  return CanvasLayer;
}();

CanvasLayer.DEFAULT_WIDTH = 100;
CanvasLayer.DEFAULT_HEIGHT = 100;

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
      renderer.clear();
      renderer.scale();
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

Renderium.CanvasLayer = CanvasLayer;
Renderium.Component = Component;
Renderium.colors = colors;

return Renderium;

})));
