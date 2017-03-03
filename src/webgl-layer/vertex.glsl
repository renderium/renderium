uniform vec2 u_resolution;

attribute vec2 a_position;
attribute float a_color;

varying vec4 v_color;

const vec2 unit = vec2(1, -1);

vec4 convertPoints (vec2 position, vec2 resolution) {
  return vec4((position / resolution * 2.0 - 1.0) * unit, 0, 1);
}

vec4 convertColor (float color, float alpha) {
  // because bitwise operators not supported
  float b = mod(color, 256.0) / 255.0; color = floor(color / 256.0);
  float g = mod(color, 256.0) / 255.0; color = floor(color / 256.0);
  float r = mod(color, 256.0) / 255.0;

  return vec4 (r, g, b, alpha);
}

void main () {
  gl_Position = convertPoints(a_position, u_resolution);
  v_color = convertColor(a_color, 1.0);
}
