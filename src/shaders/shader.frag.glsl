#ifdef GL_ES
precision mediump float;
#endif

//#extension GL_OES_standard_derivatives : enable

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

const float timeMult = 0.15;
const float radius = 100.;

#define clamps(x) clamp(x,0.,1.)

@import ./includes/noise2D;
@import ./includes/glowing-space;


//perlin's value noise
float noise(in vec2 uv) {
  return snoise(uv);          //top to bottom
}
vec2 getUV ( vec2 fragCoord, vec2 res ) {
  vec2 uv = ( gl_FragCoord.xy / resolution.xy );
  uv -= 0.5;
  return uv;
}
float getAngle (float x, float y) {
  return atan(x,y);
}
float tick () {
  return time*timeMult;
}
bool isInside(float val, float btm, float top) {
  return ( val > btm && val < top );
}
float drown (float val) {
  if ( val < 1. ) {
    return pow(val, 6.);
  }
  return val;
}
float distanceClamp ( vec2 xyPos, vec2 center ) {
  return clamps( (resolution.x - distance( center, xyPos ) + radius) / resolution.x );
}
vec3 getDotColor ( vec2 loc, vec2 center ) {
  float dist = drown( distanceClamp(loc, center) );
  return vec3( dist, dist, dist );
}


void main( void ) {
  vec2 center = mouse * resolution;
  //vec2 uv = getUV( gl_FragCoord.xy, resolution.xy );
  vec3 c = getDotColor( gl_FragCoord.xy, center );
  gl_FragColor = vec4(c, 1.0);
  //gl_FragColor = getSpace();
}


