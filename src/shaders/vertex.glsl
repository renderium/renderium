uniform vec2 u_resolution;

attribute vec2 a_position;
attribute vec3 a_color;
attribute float a_alpha;

varying vec4 v_color;

const vec2 unit = vec2(1, -1);

vec4 convertPoints (vec2 position, vec2 resolution) {
  return vec4((position / resolution * 2.0 - 1.0) * unit, 0, 1);
}

void main () {
  gl_Position = convertPoints(a_position, u_resolution);
  v_color = vec4(a_color, a_alpha);
}
