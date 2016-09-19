#ifdef GL_ES
precision mediump float;
#endif

//#extension GL_OES_standard_derivatives : enable

uniform float time;
uniform float scrolly;
uniform vec2 ctaDistance;
uniform vec2 delayMouse;
uniform vec2 resolution;

const float timeMult = 1.5;
const float radius = 4.;
const int sections = 36;
const float travelDist = 650.;
const float hPI = 3.141592653589793 / 2.;
const float timeEffectDampening = 100.;

uniform float rawseed;

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

const vec4 color1 = vec4( 235./255., 23./255., 103./255., 1. );
const vec4 color2 = vec4( 182./255., 62./255., 134./255., 1. );
const vec4 white = vec4( 1., 1., 1., 1. );
vec4 colorRand = color2;


float snoise(vec2 co){
    return (fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453))*0.00000001;
}

float flatten (vec4 outcolor) {
    return (outcolor.r + outcolor.g + outcolor.b)/4.;
}

float safeSin(float num) {
    return 0.5+(sin(num)/2.);
}

vec4 stripes(vec2 _uv, float modifyXColor, float modifyYColor)
{
    vec4 stripeout = white;

    if (mod(_uv.x, 4.0) > safeSin(learning8) &&
        mod(_uv.x, 4.0) < safeSin(learning8)+0.23) {
        stripeout = stripeout+color2;
    }
    if (mod(_uv.x, 2.3) > safeSin(learning9) &&
        mod(_uv.x, 2.3) < safeSin(learning9)+0.11) {
        stripeout = white+color1;
    }
    if (mod(_uv.x*rawseed, 3.1) > safeSin(learning7) &&
        mod(_uv.x*rawseed, 3.1) < safeSin(learning7)+0.51) {
        stripeout = stripeout+(color2+colorRand+(colorRand.rrgg*_uv.xxyx));
    }

    stripeout = normalize(stripeout+(vec4( safeSin(learning8)/4., safeSin(_uv.y)/4., safeSin(_uv.x)/4., 0.2 )));

    stripeout = stripeout-(_uv.y * modifyYColor)/4.;
    stripeout = stripeout+(_uv.x * modifyXColor)/5.;

    stripeout = stripeout+((color2/4.)*_uv.y);

    return normalize(stripeout);
}
float outClampFloat(float outVec, float mmax)
{
    return safeSin(outVec);
}
vec4 outClamp(vec4 outcolor)
{
    float mmax = max(max(max(outcolor.r, outcolor.b), outcolor.g), outcolor.a);
    return outcolor / mmax;
}

void main()
{
    colorRand = vec4( safeSin(learning6), 62./255., 134./255., 0.9 );

    float modifyScroll = safeSin(learning0);
    float modifyTimeEffect = sin(learning1)/2.;

    float modifyMouse = safeSin(learning2)/2.;
    float modifyCta = safeSin(learning3);

    float modifyExtra = safeSin(learning4);

    float modifyXColor = safeSin(learning5);
    float modifyYColor = safeSin(learning6);

    float m7 = safeSin(learning7);
    float m8 = safeSin(learning8);
    float m9 = safeSin(learning9);
    float seed = rawseed*999999999.;
    float seed2 = rawseed*hPI;

    float scrollMod = (scrolly*modifyScroll);
    float scrollModSin = safeSin(scrollMod+seed2);

    vec2 ctaMod = ctaDistance*modifyMouse;

    float delayMouseXMod = delayMouse.x*(modifyMouse);
    float delayMouseYMod = delayMouse.y*(modifyMouse);
    float mtime = safeSin((time+(seed))-(modifyTimeEffect*1.))+0.1;
    float mxtime = safeSin((time*modifyTimeEffect)+seed);

    float sAng = sin( (time/5.)/hPI );
    float cAng = cos( (time/5.)/hPI );

    mat3 rota = mat3(
        cAng, -sAng, 0.,
        sAng, cAng, 0.,
        0., 0., 1.
    );
    mat3 trans = mat3(
        1., 0., 0.,
        0., 1., 0.,
        delayMouseXMod, delayMouseYMod, 1.
    );
    mat3 trans2 = mat3(
        1., 0., 0.,
        0., 1., 0.,
        rawseed, scrollModSin/2., 1.
    );
    float mmtime = safeSin(time)/10.;
    mat3 scale = mat3(
        1.+mmtime, 0., 0.,
        0., 1.+mmtime, 0.,
        0., 0., 1.
    );

    vec2 uv = (gl_FragCoord.xy / resolution.yy);
    uv = (vec3(uv, 1.) * scale).xy;
    uv = (vec3(uv, 1.) * trans2).xy;

    uv.x = uv.x+ctaMod.x;
    uv.y = uv.y+scrollMod+ctaMod.y;

    uv = (vec3(uv, 1.) * scale).xy;

    vec2 uvb = vec2( sin(uv.x-0.5+ctaMod.x), sin(uv.y-0.5+ctaMod.y) );

    uv.x += (uvb.x * uvb.x * modifyExtra) * sin(seed2);
    uv.y += (uvb.y * uvb.y * modifyExtra);

    uv = (vec3(uv, 1.) * scale).xy;

    uv.x += sin(uv.y*(ctaMod.x)) - m8;
    uv.y += sin(uv.x*(ctaMod.y)) - m7;

    uv.x *= sin(uvb.y + sin(m9) + cos(m8 * mtime));
    uv.x += sin(uvb.x + sin(m8) + cos(m7 * mxtime));
    //uv.y += sin(uvb.x + m8);

    uv = (vec3(uv, 1.) * trans).xy;
    uv = (vec3(uv, 1.) * rota).xy;

    modifyXColor = modifyXColor * 3.;
    modifyYColor = modifyYColor * 4.;


    vec4 outcolor = stripes(uv, modifyXColor, modifyYColor);

    outcolor = outcolor + (white);
    gl_FragColor = outClamp(outcolor);
}
