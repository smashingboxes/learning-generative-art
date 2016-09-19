#ifdef GL_ES
precision mediump float;
#endif

//#extension GL_OES_standard_derivatives : enable

uniform float time;
uniform vec2 mouse;
uniform vec2 delayMouse;
uniform vec2 resolution;

const float timeMult = 1.5;
const float radius = 40.;
const int sections = 8*4;
const float travelDist = 950.;
const float hPI = 3.141592653589793 / 2.;
const float seed = 1.;
const float colorVariance = 1.;
const float colorVarianceLow = 0.4;

#define clamps(x) clamp(x,0.,1.)
#define clampy(x) clamp(x,-0.2,0.8)

@import ./includes/noise/noise2D;
@import ./includes/glowing-space;


//perlin's value noise
float noise (in vec2 uv) {
  return snoise(uv);          //top to bottom
}
float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453)*seed;
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
bool isInside (float val, float btm, float top) {
  return ( val > btm && val < top );
}
float drown (float val) {
  return pow(val, 64.);
}
float distanceColorClamp (vec2 xyPos, vec2 center, float radius) {
  return clamps( (resolution.x - distance( center, xyPos ) + radius) / resolution.x );
}
vec2 getRotatedDistance (float angle, vec2 mouseDiff, float dist, int i, vec2 center) {
  return vec2(
    cos(tick()+angle)*(dist*(cos((float(i+1)*time/5.)+(mouseDiff.x*0.2)))),
    sin(tick()+angle)*(dist*(cos((float(i+1)*time/5.)+(mouseDiff.y*0.2))))
  ) + center;
}
vec3 getColorTweak ( float i ) {
  if ( mod(i, 4.) <= 0.9 ) {
    return vec3(colorVarianceLow,colorVarianceLow,colorVariance);
  } else if ( mod(i, 3.) <= 0.9 ) {
    return vec3(colorVarianceLow,colorVariance,colorVarianceLow);
  } else if ( mod(i, 2.) <= 0.9 ) {
    return vec3(colorVariance,colorVarianceLow,colorVarianceLow);
  }
  return vec3(0,0,0);
}
vec3 getDotColor (vec2 loc, vec3 color, float radius, float index, vec2 mouseDiff, vec2 center) {
  float dist = drown( distanceColorClamp(loc, center, radius) );
  return vec3( clamps(color.r+dist), clamps(color.g+dist), clamps(color.b+dist) ) * getColorTweak( float(index) );
}
void main() {
  vec2 mouseDiff = mouse - delayMouse;
  vec2 center = ( delayMouse ) * resolution;
  vec3 baseColor = vec3(0,0,0); //vec3( clampy(sin(time/1.)*0.13), clampy(sin(time/3.)*0.13), clampy(sin(time/8.)*0.13) );
  float dist = (sin(time)*travelDist);
  float _radius = radius*((sin(time)*1.5)+1.5);
  vec3 finalColor = vec3(0,0,0);

  finalColor = finalColor + getDotColor(gl_FragCoord.xy, baseColor, _radius, float(0), mouseDiff, center);

  for ( int i = 0; i < sections; i++ ) {
    float angle = (float(i)*hPI*4.)/float(sections);
    finalColor = finalColor + (getDotColor(
      gl_FragCoord.xy,
      baseColor,
      _radius,
      float(i),
      mouseDiff,
      getRotatedDistance(angle, mouseDiff, dist, i, center)
    ));
  }

  gl_FragColor = vec4( finalColor, 1);
}


