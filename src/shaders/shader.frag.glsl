#ifdef GL_ES
precision mediump float;
#endif

//#extension GL_OES_standard_derivatives : enable


uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

const float timeMult = 0.5;

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
vec3 getDotColor (float x, float y) {
  if ( isInside( x, -0.1, 0.1 ) && isInside( y, -0.1, 0.1 ) ) {
    return vec3(1,1,1);
  }
  return vec3(
    noise( vec2(sin(x), sin(tick())) ),
    noise( vec2(tan(y), tan(tick())) ),
    noise( vec2(cos(tick()), cos(y)) )
  );
}


void main( void ) {
  //vec2 uv = getUV( gl_FragCoord.xy, resolution.xy );
  //vec3 c = getDotColor( sin(uv.x-( tick() )), uv.y);
  gl_FragColor = getSpace();
}


