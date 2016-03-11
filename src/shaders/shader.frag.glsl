#ifdef GL_ES
precision mediump float;
#endif

//#extension GL_OES_standard_derivatives : enable

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
const float timeMult = 20.0;
#define clamps(x) clamp(x,0.,1.)

vec2 getUV ( vec2 fragCoord, vec2 res ) {
  vec2 uv = ( gl_FragCoord.xy / resolution.xy );
  uv -= 0.5;
  return uv;
}
float getAngle (float x, float y) {
  return atan(x,y);
}
float getTime () {
  return time*timeMult;
}
vec3 getDotColor (float x, float y) {
  if ( x > -0.1 && x < 0.1 ) {
    return vec3(1,1,1);
  }
  return vec3(0,0,0);
}

void main( void ) {
  vec2 uv = getUV( gl_FragCoord.xy, resolution.xy );
  vec3 c = getDotColor(uv.x, uv.y);
  gl_FragColor = vec4(c, 1.0);
}

