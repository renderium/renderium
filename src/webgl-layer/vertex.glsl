attribute vec2 a_position;
attribute uint a_color;
varying vec4 v_color;
void main() {
  gl_Position = vec4(a_position, 0, 1);

  v_color.r = ((a_color >> 16) & 255) / 255;
  v_color.g = ((a_color >> 8) & 255) / 255;
  v_color.b = (a_color & 255) / 255;
  v_color.a = 1.0;
}
