vec3 roty(vec3 p,float a)
{ return mat3(cos(a),0,-sin(a), 0,1,0, sin(a),0,cos(a)) * p; }

float map(in vec3 p)
{
  vec3 c=p; float res=0.;
  for (int i=0; i < 4; i++)
  {
    p= abs(p)/dot(p,p) -.7;
    p.yz= vec2(p.y*p.y-p.z*p.z,2.*p.y*p.z);
    res += exp(-20. * abs(dot(p,c)));
  }
  return res*0.5;
}

vec3 raymarch(vec3 ro, vec3 rd)
{
  float t=5.0;
  vec3 col=vec3(0); float c=0.;
  for( int i=0; i < 6; i++ )
  {
    t+= exp(c*-2.0) *0.012;
    c= map(t *rd +ro);
    col= vec3(8.0*c*c, c, 6.0*c*c*c) *0.16 + col *0.96; //green
    col= vec3(8.0*c*c*c, 2.0*c*c, c) *0.16 + col *0.96; //blue
    col= vec3(8.0*c, c*c*c, c*c) *0.16 + col *0.96; //red

  }
  return col;
}

vec4 getSpace() {
  vec2 p= (gl_FragCoord.xy - resolution*0.5) / resolution.y;
  vec3 ro= roty(vec3(3.), time*0.2 + mouse.x);
  vec3 uu= normalize(cross(ro, vec3(1.0, .0, 0.0)));
  vec3 vv= normalize(cross(uu, ro));
  vec3 rd= normalize(p.x*uu + p.y*vv - ro*0.5 );
  return vec4( log(raymarch(ro,rd) +1.0)*0.5, 1.0 );
}

