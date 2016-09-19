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
  float t=2.0*learning8;
  vec3 col=vec3(0);
  float c=0.;
  float timeclamp = clamp( (learning8-0.5), 0., 1.);
  float muscle0 = 2.0 * learning0;
  float muscle1 = 2.0 * learning1;
  float muscle2 = 2.0 * learning2;
  float muscle3 = 2.0 * learning3;
  float muscle4 = 2.0 * learning4;
  float muscle5 = 2.0 * learning5;
  float muscle6 = 2.0 * learning6;

  float baseline = 8.0 * learning4 * learning5 * 4.;

  float limitBase = (20.*learning5);

  for( int i=0; i < 20; i++ )
  {
    if ( i < int(limitBase)+5 ) {
      t+= exp(c*-(learning1*muscle4*learning2)) * (learning5/1000.);
      c= map(t *rd +ro);
      col= vec3(baseline*c*c, c, muscle5*c*c*c) *learning4 + (col * ((sin(time*timeclamp*muscle0)+muscle4)/muscle3) ); //green
      col= vec3(baseline*c*c*c, muscle6*c*c, c) *learning5 + (col * ((cos(learning3)+muscle1*learning7)/muscle6) ); //blue
      col= vec3(baseline*c, c*c*c, c*c) *learning7 + (col * ((sin(learning3)+muscle2)) ) / (limitBase); //red
    }
  }
  return col;
}

vec4 getSpace() {
  float muscle0 = 5.0 * learning0;
  float muscle1 = 5.0 * learning1;
  float muscle2 = 5.0 * learning2;
  float muscle3 = 5.0 * learning3;
  float muscle4 = 5.0 * learning4;
  float muscle5 = 5.0 * learning5;
  float muscle6 = 5.0 * learning0;

  float cr = learning0;
  float cg = learning1;
  float cb = learning2;

  vec2 p= (gl_FragCoord.xy - resolution*0.5) / resolution.y;
  vec3 ro= roty(vec3(learning0*muscle1), time*learning1 + learning2);
  vec3 uu= normalize(cross(ro, vec3(1.0, .0, 0.0)));
  vec3 vv= normalize(cross(uu, ro));
  vec3 rd= normalize(p.x*uu + p.y*vv - ro*0.5 );
  vec3 rm = log(raymarch(ro,rd))*learning5;
  vec3 preout = vec3( cr*rm.r, cg*rm.g, cg*rm.b ) / (muscle6/2.);
  return vec4( preout, 1.0 );
}

void main() {
  gl_FragColor =  getSpace();
}


