(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Renderium = factory());
}(this, (function () { 'use strict';

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {}

function interopDefault(ex) {
	return ex && typeof ex === 'object' && 'default' in ex ? ex['default'] : ex;
}

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

var Vector = interopDefault(vectory);

function getDevicePixelRatio() {
  return window.devicePixelRatio ? Math.floor(window.devicePixelRatio) : 1;
}

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

// -------------------------------------
// CanvasLayer
// -------------------------------------

var CanvasLayer = function () {
  function CanvasLayer(_ref) {
    var antialiasing = _ref.antialiasing;
    classCallCheck(this, CanvasLayer);

    this.antialiasing = Boolean(antialiasing);
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.scale({
      width: CanvasLayer.DEFAULT_WIDTH,
      height: CanvasLayer.DEFAULT_HEIGHT
    });
    this.borders = [new Vector(0, 0), new Vector(0, 0)];
  }

  CanvasLayer.prototype.scale = function scale(_ref2) {
    var width = _ref2.width;
    var height = _ref2.height;

    this.width = width || CanvasLayer.DEFAULT_WIDTH;
    this.height = height || CanvasLayer.DEFAULT_HEIGHT;

    this.canvas.removeAttribute('width');
    this.canvas.removeAttribute('height');
    this.canvas.removeAttribute('style');

    this.ctx.canvas.width = this.width;
    this.ctx.canvas.height = this.height;
    this.ctx.canvas.style.width = this.width + 'px';
    this.ctx.canvas.style.height = this.height + 'px';

    if (window.devicePixelRatio) {
      this.ctx.canvas.width = this.width *= window.devicePixelRatio;
      this.ctx.canvas.height = this.height *= window.devicePixelRatio;
    }

    if (!this.antialiasing) {
      this.ctx.translate(0.5, 0.5);
    }
  };

  CanvasLayer.prototype.clear = function clear() {
    this.computeBorders();
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(this.borders[0].x - CanvasLayer.EXTRA_PIXELS, this.borders[0].y - CanvasLayer.EXTRA_PIXELS, Math.abs(this.borders[1].x - this.borders[0].x) + CanvasLayer.EXTRA_PIXELS * 2, Math.abs(this.borders[1].y - this.borders[0].y) + CanvasLayer.EXTRA_PIXELS * 2);
    this.ctx.restore();
  };

  CanvasLayer.prototype.computeBorders = function computeBorders() {
    var minX = this.width;
    var minY = this.height;
    var maxX = 0;
    var maxY = 0;

    this.borders[0].set(minX, minY);
    this.borders[1].set(maxX, maxY);
  };

  CanvasLayer.prototype.drawArc = function drawArc(_ref3) {
    var position = _ref3.position;
    var radius = _ref3.radius;
    var startAngle = _ref3.startAngle;
    var endAngle = _ref3.endAngle;
    var color = _ref3.color;
    var _ref3$width = _ref3.width;
    var width = _ref3$width === undefined ? 1 : _ref3$width;

    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;

    this.ctx.beginPath();
    this.ctx.arc(position.x, position.y, radius, startAngle, endAngle);
    this.ctx.stroke();
  };

  CanvasLayer.prototype.drawArea = function drawArea(_ref4) {
    var points = _ref4.points;
    var threshold = _ref4.threshold;
    var color = _ref4.color;
    var fillColor = _ref4.fillColor;
    var _ref4$width = _ref4.width;
    var width = _ref4$width === undefined ? 1 : _ref4$width;

    this.drawPolyline({
      points: points,
      color: color,
      width: width
    });

    this.ctx.fillStyle = fillColor;

    this.ctx.lineTo(points[points.length - 1].x, threshold);
    this.ctx.lineTo(points[0].x, threshold);
    this.ctx.closePath();
    this.ctx.fill();
  };

  CanvasLayer.prototype.drawCircle = function drawCircle(_ref5) {
    var position = _ref5.position;
    var radius = _ref5.radius;
    var color = _ref5.color;
    var fillColor = _ref5.fillColor;
    var _ref5$width = _ref5.width;
    var width = _ref5$width === undefined ? 1 : _ref5$width;

    this.drawArc({
      position: position,
      radius: radius,
      startAngle: 0,
      endAngle: 2 * Math.PI,
      color: color,
      width: width
    });

    if (fillColor) {
      this.ctx.fillStyle = fillColor;
      this.ctx.fill();
    }
  };

  CanvasLayer.prototype.drawImage = function drawImage(_ref6) {
    var position = _ref6.position;
    var image = _ref6.image;
    var _ref6$width = _ref6.width;
    var width = _ref6$width === undefined ? image.width : _ref6$width;
    var _ref6$height = _ref6.height;
    var height = _ref6$height === undefined ? image.height : _ref6$height;
    var _ref6$opacity = _ref6.opacity;
    var opacity = _ref6$opacity === undefined ? 1 : _ref6$opacity;

    var defaultAlpha = this.ctx.globalAlpha;
    this.ctx.globalAlpha = opacity;
    this.ctx.drawImage(image, position.x - width / 2, position.y - height / 2, width, height);
    this.ctx.globalAlpha = defaultAlpha;
  };

  CanvasLayer.prototype.drawPolygon = function drawPolygon(_ref7) {
    var points = _ref7.points;
    var color = _ref7.color;
    var fillColor = _ref7.fillColor;
    var _ref7$width = _ref7.width;
    var width = _ref7$width === undefined ? 1 : _ref7$width;

    this.drawPolyline({
      points: points.concat(points[0]),
      color: color,
      width: width
    });

    if (fillColor) {
      this.ctx.fillStyle = fillColor;
      this.ctx.fill();
    }
  };

  CanvasLayer.prototype.drawPolyline = function drawPolyline(_ref8) {
    var points = _ref8.points;
    var color = _ref8.color;
    var _ref8$lineDash = _ref8.lineDash;
    var lineDash = _ref8$lineDash === undefined ? [] : _ref8$lineDash;
    var _ref8$width = _ref8.width;
    var width = _ref8$width === undefined ? 1 : _ref8$width;

    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;

    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);

    for (var i = 1, point; i < points.length; i++) {
      point = points[i];
      this.ctx.lineTo(point.x, point.y);
    }

    this.ctx.setLineDash(lineDash);

    this.ctx.stroke();
  };

  CanvasLayer.prototype.drawRect = function drawRect(_ref9) {
    var position = _ref9.position;
    var width = _ref9.width;
    var height = _ref9.height;
    var color = _ref9.color;
    var fillColor = _ref9.fillColor;
    var _ref9$strokeWidth = _ref9.strokeWidth;
    var strokeWidth = _ref9$strokeWidth === undefined ? 1 : _ref9$strokeWidth;

    this.drawPolygon({
      points: [new Vector(position.x - width / 2, position.y + height / 2), new Vector(position.x + width / 2, position.y + height / 2), new Vector(position.x + width / 2, position.y - height / 2), new Vector(position.x - width / 2, position.y - height / 2)],
      color: color,
      fillColor: fillColor,
      width: strokeWidth
    });
  };

  CanvasLayer.prototype.drawText = function drawText(_ref10) {
    var position = _ref10.position;
    var text = _ref10.text;
    var color = _ref10.color;
    var font = _ref10.font;
    var size = _ref10.size;
    var _ref10$align = _ref10.align;
    var align = _ref10$align === undefined ? 'center' : _ref10$align;
    var _ref10$baseline = _ref10.baseline;
    var baseline = _ref10$baseline === undefined ? 'middle' : _ref10$baseline;

    this.ctx.fillStyle = color;
    this.ctx.font = size * getDevicePixelRatio() + 'px ' + font;
    this.ctx.textAlign = align;
    this.ctx.textBaseline = baseline;

    this.ctx.fillText(text, position.x, position.y);
  };

  CanvasLayer.prototype.measureText = function measureText(_ref11) {
    var text = _ref11.text;

    return this.ctx.measureText(text).width;
  };

  return CanvasLayer;
}();

CanvasLayer.DEFAULT_WIDTH = 100;
CanvasLayer.DEFAULT_HEIGHT = 100;
CanvasLayer.GRADIENT_DIRECTION_TOP_TO_BOT = 'top-to-bot';
CanvasLayer.EXTRA_PIXELS = 10;

var renderium = {
  CanvasLayer: CanvasLayer
};

return renderium;

})));