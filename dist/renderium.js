(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Renderium = factory());
}(this, (function () { 'use strict';

var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
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
    var start = _ref.start;
    var end = _ref.end;
    var from = _ref.from;
    var to = _ref.to;
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
    var antialiasing = _ref2.antialiasing;
    var width = _ref2.width;
    var height = _ref2.height;
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
    var width = _ref3.width;
    var height = _ref3.height;

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
    this.components.push(component);
    this._shouldRedraw = true;
  };

  CanvasLayer.prototype.removeComponent = function removeComponent(component) {
    var idx = this.components.indexOf(component);
    if (idx !== -1) {
      this.components.splice(idx, 1);
      this._shouldRedraw = true;
    }
  };

  CanvasLayer.prototype.createGradient = function createGradient(_ref4) {
    var start = _ref4.start;
    var end = _ref4.end;
    var from = _ref4.from;
    var to = _ref4.to;

    return new Gradient({ start: start, end: end, from: from, to: to });
  };

  CanvasLayer.prototype.getColor = function getColor(color) {
    return Gradient.isGradient(color) ? color.createGradient(this) : color;
  };

  CanvasLayer.prototype.drawArc = function drawArc(_ref5) {
    var position = _ref5.position;
    var radius = _ref5.radius;
    var startAngle = _ref5.startAngle;
    var endAngle = _ref5.endAngle;
    var color = _ref5.color;
    var _ref5$width = _ref5.width;
    var width = _ref5$width === undefined ? 1 : _ref5$width;

    this.ctx.strokeStyle = this.getColor(color);
    this.ctx.lineWidth = width;

    this.ctx.beginPath();
    this.ctx.arc(position.x, position.y, radius, startAngle, endAngle);

    if (color) {
      this.ctx.stroke();
    }
  };

  CanvasLayer.prototype.drawCircle = function drawCircle(_ref6) {
    var position = _ref6.position;
    var radius = _ref6.radius;
    var color = _ref6.color;
    var fillColor = _ref6.fillColor;
    var _ref6$width = _ref6.width;
    var width = _ref6$width === undefined ? 1 : _ref6$width;

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
    var position = _ref7.position;
    var image = _ref7.image;
    var _ref7$width = _ref7.width;
    var width = _ref7$width === undefined ? image.width : _ref7$width;
    var _ref7$height = _ref7.height;
    var height = _ref7$height === undefined ? image.height : _ref7$height;
    var _ref7$opacity = _ref7.opacity;
    var opacity = _ref7$opacity === undefined ? 1 : _ref7$opacity;

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
    this.ctx.drawImage(image, position.x - width / 2, position.y - height / 2, width, height);
    this.ctx.globalAlpha = defaultAlpha;
  };

  CanvasLayer.prototype.drawPolygon = function drawPolygon(_ref8) {
    var points = _ref8.points;
    var color = _ref8.color;
    var fillColor = _ref8.fillColor;
    var _ref8$width = _ref8.width;
    var width = _ref8$width === undefined ? 1 : _ref8$width;

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
    var points = _ref9.points;
    var color = _ref9.color;
    var _ref9$lineDash = _ref9.lineDash;
    var lineDash = _ref9$lineDash === undefined ? [] : _ref9$lineDash;
    var _ref9$width = _ref9.width;
    var width = _ref9$width === undefined ? 1 : _ref9$width;

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
    var position = _ref10.position;
    var width = _ref10.width;
    var height = _ref10.height;
    var color = _ref10.color;
    var fillColor = _ref10.fillColor;
    var _ref10$strokeWidth = _ref10.strokeWidth;
    var strokeWidth = _ref10$strokeWidth === undefined ? 1 : _ref10$strokeWidth;

    this.ctx.lineWidth = strokeWidth;

    this.ctx.beginPath();
    this.ctx.rect(position.x, position.y, width, height);
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
    var position = _ref11.position;
    var text = _ref11.text;
    var color = _ref11.color;
    var font = _ref11.font;
    var size = _ref11.size;
    var _ref11$align = _ref11.align;
    var align = _ref11$align === undefined ? 'center' : _ref11$align;
    var _ref11$baseline = _ref11.baseline;
    var baseline = _ref11$baseline === undefined ? 'middle' : _ref11$baseline;

    this.ctx.fillStyle = this.getColor(color);
    this.ctx.font = size + 'px ' + font;
    this.ctx.textAlign = align;
    this.ctx.textBaseline = baseline;

    this.ctx.fillText(text, position.x, position.y);
  };

  CanvasLayer.prototype.measureText = function measureText(_ref12) {
    var text = _ref12.text;
    var font = _ref12.font;
    var size = _ref12.size;

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

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var vectory = createCommonjsModule(function (module, exports) {
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : global.Vector = factory();
})(commonjsGlobal, function () {
  'use strict';

  function Vector(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  }

  Vector.displayName = 'Vector';

  Vector.from = function (data) {
    return new Vector(data[0], data[1]);
  };

  Vector.fromAngle = function (angle, magnitude) {
    return new Vector(magnitude * Math.cos(angle), magnitude * Math.sin(angle));
  };

  Vector.parse = function (string) {
    return Vector.from(string.trim().replace(',', ' ').split(/\s+/).map(parseFloat));
  };

  Vector.add = function (one, another) {
    return another.add(one);
  };

  Vector.prototype.add = function (vector) {
    return new Vector(this.x + vector.x, this.y + vector.y);
  };

  Vector.iadd = function (one, another) {
    return another.iadd(one);
  };

  Vector.prototype.iadd = function (vector) {
    this.x += vector.x;
    this.y += vector.y;
    return this;
  };

  Vector.sub = function (one, another) {
    return another.sub(one);
  };

  Vector.prototype.sub = function (vector) {
    return new Vector(this.x - vector.x, this.y - vector.y);
  };

  Vector.isub = function (one, another) {
    return another.isub(one);
  };

  Vector.prototype.isub = function (vector) {
    this.x -= vector.x;
    this.y -= vector.y;
    return this;
  };

  Vector.mul = function (scalar, vector) {
    return vector.mul(scalar);
  };

  Vector.prototype.mul = function (scalar) {
    return new Vector(this.x * scalar, this.y * scalar);
  };

  Vector.imul = function (scalar, vector) {
    return vector.imul(scalar);
  };

  Vector.prototype.imul = function (scalar) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  };

  Vector.div = function (scalar, vector) {
    return vector.div(scalar);
  };

  Vector.prototype.div = function (scalar) {
    return new Vector(this.x / scalar, this.y / scalar);
  };

  Vector.idiv = function (scalar, vector) {
    return vector.idiv(scalar);
  };

  Vector.prototype.idiv = function (scalar) {
    this.x /= scalar;
    this.y /= scalar;
    return this;
  };

  Vector.lerp = function (one, another, t) {
    return one.lerp(another, t);
  };

  Vector.prototype.lerp = function (vector, t) {
    var x = (1 - t) * this.x + t * vector.x;
    var y = (1 - t) * this.y + t * vector.y;
    return new Vector(x, y);
  };

  Vector.normalized = function (vector) {
    return vector.normalized();
  };

  Vector.prototype.normalized = function () {
    var x = this.x;
    var y = this.y;
    var length = Math.sqrt(x * x + y * y);
    if (length > 0) {
      return new Vector(x / length, y / length);
    } else {
      return new Vector(0, 0);
    }
  };

  Vector.normalize = function (vector) {
    return vector.normalize();
  };

  Vector.prototype.normalize = function () {
    var x = this.x;
    var y = this.y;
    var length = Math.sqrt(x * x + y * y);
    if (length > 0) {
      this.x = x / length;
      this.y = y / length;
    }
    return this;
  };

  Vector.magnitude = function (vector) {
    return vector.magnitude();
  };

  Vector.prototype.magnitude = function () {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  };

  Vector.dot = function (one, another) {
    return another.dot(one);
  };

  Vector.prototype.dot = function (vector) {
    return this.x * vector.x + this.y * vector.y;
  };

  Vector.distance = function (one, another) {
    return another.distance(one);
  };

  Vector.prototype.distance = function (vector) {
    var x = this.x - vector.x;
    var y = this.y - vector.y;
    return Math.sqrt(x * x + y * y);
  };

  Vector.angleOf = function (vector) {
    return vector.angleOf();
  };

  Vector.prototype.angleOf = function () {
    return Math.atan2(this.y, this.x);
  };

  Vector.angleTo = function (one, another) {
    return another.angleTo(one);
  };

  Vector.prototype.angleTo = function (vector) {
    return Math.acos(this.dot(vector) / this.magnitude() * vector.magnitude());
  };

  Vector.reset = function (one, another) {
    return another.reset(one);
  };

  Vector.prototype.reset = function (vector) {
    this.x = vector.x;
    this.y = vector.y;
    return this;
  };

  Vector.zero = function (vector) {
    return vector.zero();
  };

  Vector.prototype.zero = function () {
    this.x = 0;
    this.y = 0;
    return this;
  };

  Vector.set = function (x, y, vector) {
    return vector.set(x, y);
  };

  Vector.prototype.set = function (x, y) {
    this.x = x || 0;
    this.y = y || 0;
    return this;
  };

  Vector.copy = function (vector) {
    return vector.copy();
  };

  Vector.prototype.copy = function () {
    return new Vector(this.x, this.y);
  };

  Vector.toJSON = function (vector) {
    return vector.toJSON();
  };

  Vector.prototype.toJSON = function () {
    return [this.x, this.y];
  };

  Vector.toString = function (vector) {
    return vector ? vector.toString() : Function.prototype.toString.call(this);
  };

  Vector.prototype.toString = function () {
    return this.x.toFixed(3) + ' ' + this.y.toFixed(3);
  };

  /* istanbul ignore else */
  if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
    Vector.prototype[Symbol.toStringTag] = 'Vector';
  }

  Vector.toArray = function (vector) {
    return vector.toArray();
  };

  Vector.prototype.toArray = function () {
    return [this.x, this.y];
  };

  Vector.equals = function (one, another) {
    return one.equals(another);
  };

  Vector.prototype.equals = function (vector) {
    return this.x === vector.x && this.y === vector.y;
  };

  Vector.compare = function (one, another) {
    return one.compare(another);
  };

  Vector.prototype.compare = function (vector) {
    var thisMagnitude = this.magnitude();
    var vectorMagnitude = vector.magnitude();
    return (thisMagnitude > vectorMagnitude) - (vectorMagnitude > thisMagnitude);
  };

  Object.defineProperties(Vector.prototype, {
    xx: {
      configurable: true,
      get: function () {
        return new Vector(this.x, this.x);
      },
      set: function (vector) {
        this.x = vector.x;
        this.y = vector.x;
      }
    },
    xy: {
      configurable: true,
      get: function () {
        return new Vector(this.x, this.y);
      },
      set: function (vector) {
        this.x = vector.x;
        this.y = vector.y;
      }
    },
    yx: {
      configurable: true,
      get: function () {
        return new Vector(this.y, this.x);
      },
      set: function (vector) {
        this.x = vector.y;
        this.y = vector.x;
      }
    },
    yy: {
      configurable: true,
      get: function () {
        return new Vector(this.y, this.y);
      },
      set: function (vector) {
        this.x = vector.y;
        this.y = vector.y;
      }
    }
  });

  function VectorIterator(vector) {
    this.vector = vector;
    this.__idx = 0;
  }

  VectorIterator.prototype.next = function () {
    if (this.__idx === 0) {
      this.__idx++;
      return {
        done: false,
        value: this.vector.x
      };
    } else if (this.__idx === 1) {
      this.__idx++;
      return {
        done: false,
        value: this.vector.y
      };
    } else {
      return {
        done: true,
        value: void 0
      };
    }
  };

  /* istanbul ignore else */
  if (typeof Symbol !== 'undefined' && Symbol.iterator) {
    Vector.prototype[Symbol.iterator] = function iterator() {
      return new VectorIterator(this);
    };
  }

  return Vector;
});
});

var Renderium = function () {
  Renderium.spawn = function spawn(renderer) {
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
Renderium.Vector = vectory;
Renderium.colors = colors;

return Renderium;

})));