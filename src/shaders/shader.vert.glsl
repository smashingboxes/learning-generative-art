attribute vec4 a_position;
varying vec2 surfacePosition;
uniform mat4 mat;

void main() {
  gl_Position = a_position;
  surfacePosition = (a_position * mat).xy;
}
