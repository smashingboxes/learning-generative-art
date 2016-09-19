float randfloat(float n){
  return fract(sin(n) * 43758.5453123);
}
float randfloat(vec2 n){
  return fract(sin(n.x * n.y) * 43758.5453123);
}
float gnoise(float p){
  float fl = floor(p);
  float fc = fract(p);
  return mix(randfloat(fl), randfloat(fl + 1.0), fc);
}

float gnoise(vec2 n) {
  const vec2 d = vec2(0.0, 1.0);
  vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
  return mix(mix(randfloat(b), randfloat(b + d.yx), f.x), mix(randfloat(b + d.xy), randfloat(b + d.yy), f.x), f.y);
}
