attribute vec2 a_position;
attribute float a_color;
varying vec4 v_color;
void main() {
  gl_Position = vec4(a_position, 0, 1);

  float color = a_color;
  v_color.b = mod(color, 256.0); color = floor(color / 256.0);
  v_color.g = mod(color, 256.0); color = floor(color / 256.0);
  v_color.r = mod(color, 256.0); color = floor(color / 256.0); v_color /= 255.0;
  v_color.a = 1.0;
}
