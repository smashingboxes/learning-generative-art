#ifdef GL_ES
precision mediump float;
#endif

//#extension GL_OES_standard_derivatives : enable

uniform float time;
uniform vec2 mouse;
uniform vec2 delayMouse;
uniform vec2 resolution;
uniform float learning0;
uniform float learning1;
uniform float learning2;
uniform float learning3;
uniform float learning4;
uniform float learning5;
uniform float learning6;
uniform float learning7;
uniform float learning8;
uniform float learning9;

vec3 roty(vec3 p,float a) {
  return mat3(cos(a),0,-sin(a), 0,1,0, sin(a),0,cos(a)) * p * (learning2 + learning3);
}

float map(in vec3 p)
{
  float muscle0 = -(32. * learning9);
  float muscle1 = -(3. * learning8);
  vec3 c=p; float res=0.;
  for (int i=0; i < 7; i++)
  {
    p= abs(p)/dot(p,p) -learning8;
    p.yz= vec2(p.y*p.y-p.z*p.z,muscle1*p.y*p.z);
    res += exp(muscle0 / learning8 * abs(dot(p,c)));
  }
  return res * ((sin(1.)+1.)/(muscle1*learning7))*(learning3+1.)*(learning2+1.);
}

vec3 raymarch(vec3 ro, vec3 rd)
{
  float t=4.0;
  vec3 col=vec3(0);
  float c=0.;
  float timeclamp = clamp( (learning8-0.5), 0., 1.);
  float muscle0 = 2.2 * learning0 * 2.;
  float muscle1 = 1.9 * learning1 * 2.;
  float muscle2 = 1.0 * learning2 * 2.;
  float muscle3 = 8.0 * learning3 * 2.;
  float muscle4 = 5.5 * learning4 * 2.;
  float muscle5 = 6.0 * learning5 * 2.;
  float muscle6 = 2.0 * learning0 * 2.;

  float baseline = 8.0 * learning4 * learning5 * 4.;

  for( int i=0; i < 20; i++ )
  {
    if ( i < int(20.*learning0)+3 ) {
      t+= exp(c*-(learning1*3.*learning2)) * 0.012;
      c= map(t *rd +ro);
      col= vec3(baseline*c*c, c, muscle5*c*c*c) *learning4 + col * ((sin(time*timeclamp*muscle0)+muscle4)/muscle3); //green
      col= vec3(baseline*c*c*c, muscle6*c*c, c) *learning5 + col * ((cos(time*.1)+muscle1*learning7)/muscle6); //blue
      col= vec3(baseline*c, c*c*c, c*c) *learning6 + col * ((sin(learning3*1.)+muscle2)+.1/learning5); //red
    }
  }
  return col;
}

vec4 getSpace() {
  vec2 p= (gl_FragCoord.xy - resolution*0.5) / resolution.y;
  vec3 ro= roty(vec3(3.), time*0.2 + learning2);
  vec3 uu= normalize(cross(ro, vec3(1.0, .0, 0.0)));
  vec3 vv= normalize(cross(uu, ro));
  vec3 rd= normalize(p.x*uu + p.y*vv - ro*0.5 );
  return vec4( log(raymarch(ro,rd) +1.0)*0.35, 1.0 );
}

void main() {
  gl_FragColor =  getSpace();
}


