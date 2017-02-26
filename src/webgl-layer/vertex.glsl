uniform vec2 u_resolution;

attribute vec2 a_position;
attribute float a_color;

varying vec4 v_color;

void main() {
  // convert points
  vec2 position = (a_position / u_resolution * 2.0 - 1.0) * vec2(1, -1);
  gl_Position = vec4(position, 0, 1);

  // because bitwise operators not supported
  float color = a_color;
  v_color.b = mod(color, 256.0) / 255.0; color = floor(color / 256.0);
  v_color.g = mod(color, 256.0) / 255.0; color = floor(color / 256.0);
  v_color.r = mod(color, 256.0) / 255.0;
  v_color.a = 1.0;
}
