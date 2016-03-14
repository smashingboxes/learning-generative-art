#ifdef GL_ES
precision mediump float;
#endif

//#extension GL_OES_standard_derivatives : enable

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
const float timeMult = 0.1;

#define clamps(x) clamp(x,0.,1.)

//perlin's value noise
float noise(in vec2 uv)
{
  const float k   = 257.;
  vec4 l      = vec4(floor(uv),fract(uv));      //create a low resolution grid (xy) and repeating blend (zw)
  l.zw        = l.zw*l.zw*(3.-2.*l.zw);     //smooth the values for the repeating blend

  float u     = l.x + l.y * k;          //create an index for each 2d grid position
  vec4 v      = vec4(u, u+1.,u+k, u+k+1.);      //get the 4 indices corrosponding to the 4 neighbor grid points as v.xyzw
  v           = fract(fract(1.23456789*v)*v/.987654321);  //generate a random number for each of the 4 neighbor indices

              //for the result, mix the random numbers from the grid using the blend
  l.x         = mix(v.x, v.y, l.z);       //bottom left right
  l.y         = mix(v.z, v.w, l.z);       //top left right
  return mix(l.x, l.y, l.w);          //top to bottom
}

//fractal brownian motion, aka perlin noise - when using values of .5 and 2. it's also known as "pink noise"
float fractal_brownian_motion(vec2 uv)
{
  float amplitude = .5;           //amplitude is how much to add per step
  float frequency = 2.;           //frequency is how much to change scale at each step

  float result  = 0.;           //iteratively stack layers of value noise to create perlin noise
  for(int i = 0; i < 8; i++) {
    result += noise(uv*frequency)*amplitude; //add value noise, using the frequency and amplitude to control it
    amplitude   *= .5;          //at each step, half the amount you add
    frequency   *= 2.;          //and double the spatial frequency
  }

  return result;
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
  return vec3(fractal_brownian_motion( vec2(sin(x),sin(tick())) ),fractal_brownian_motion(vec2(tan(x),tan(tick()))),fractal_brownian_motion(vec2(cos(tick()),cos(y))));
}

void main( void ) {
  vec2 uv = getUV( gl_FragCoord.xy, resolution.xy );
  vec3 c = getDotColor( sin(uv.x-( tick() )), uv.y);
  gl_FragColor = vec4(c, 1.0);
}

