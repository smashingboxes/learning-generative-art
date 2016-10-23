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
const float mouseEffectDampening = 0.0001;

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

const vec4 color1 = vec4( 234./255., 37./255.,  106./255., 1. );
const vec4 color2 = vec4( 200./255., 34./255.,  93./255., 1. );
const vec4 color3 = vec4(  43./255., 162./255., 245./255., 1. );
const vec4 color4 = vec4( 148./255., 212./255., 229./255., 1. );
const vec4 white = vec4( 1., 1., 1., 1. );

vec4 colorRand = color2;

float safeSin(float num) {
    return 0.5+(sin(num)/2.);
}

vec4 stripes(vec2 _uv, vec2 constUV, float ttime, float modifyXColor, float modifyYColor)
{
    vec4 stripeout = white;

    float m7 = safeSin(learning7);
    float m8 = safeSin(learning8);
    float m9 = safeSin(learning9);
    float freq = 7.0 + (4.0*m9);

    float sAng = sin( (ttime * 20. * (0.2 * _uv.x / freq)) / hPI );
    float cAng = cos( (ttime * 20. * (0.2 * _uv.x / freq)) / hPI );
    mat3 rota = mat3(
        cAng, -sAng, 0.,
        sAng, cAng, 0.,
        0., 0., 1.
    );
    _uv = (vec3(_uv, 1.) * rota).xy;

    if (mod(_uv.x, freq) > (learning8) &&
        mod(_uv.x, freq) < (learning8)+(0.3+(m7*constUV.y)*0.7)) {

        stripeout = stripeout*(color1);
        stripeout = stripeout+(color2*(_uv.y*m7));
        stripeout = stripeout/(color3*(_uv.y*m8));
        stripeout = stripeout*(color4*(_uv.y*m9));
        stripeout = stripeout+(color1);
    }

    stripeout = stripeout+((((color1*_uv.y)-(color4*_uv.x))*m7)*0.3);

    return (stripeout);
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
    float ttime = (sin(time) + 1.) * 10.;

    float modifyScroll = safeSin(learning0);
    float modifyTimeEffect = sin(learning1)/2.;
    float modifyTimeEffectFlat = safeSin(learning1)+0.5;

    float modifyMouse = safeSin(learning2)/2.;
    float modifyCta = safeSin(learning3);

    float modifyExtra = safeSin(learning4);

    float modifyXColor = safeSin(learning5);
    float modifyYColor = safeSin(learning6);

    float m7 = safeSin(learning7*learning7);
    float m8 = safeSin(learning8*learning8);
    float m9 = safeSin(learning9*learning9);
    float seed = rawseed*999999999.;
    float seed2 = rawseed*hPI;

    float scrollMod = (scrolly*modifyScroll);
    float scrollModSin = safeSin(scrollMod+seed2);

    vec2 ctaMod = ctaDistance*modifyMouse*mouseEffectDampening;

    float delayMouseXMod = delayMouse.x*(modifyMouse)*mouseEffectDampening;
    float delayMouseYMod = delayMouse.y*(modifyMouse)*mouseEffectDampening;
    float mtime = safeSin((ttime+(seed))-(modifyTimeEffect*1.))+0.1;
    float mxtime = safeSin(ttime*modifyTimeEffect);

    float mmtime = sin(ttime*m8)/5.;
    float sAng = sin( (learning3) / hPI );
    float cAng = cos( (learning3) / hPI );

    mat3 rota = mat3(
        cAng, -sAng, 0.,
        sAng, cAng, 0.,
        0., 0., 1.
    );
    mat3 trans = mat3(
        1., 0., 0.,
        0., 1., 0.,
        delayMouseXMod*mmtime, delayMouseYMod*mmtime, 1.
    );
    mat3 trans2 = mat3(
        1., 0., 0.,
        0., 1., 0.,
        rawseed+(mxtime*0.0002*m7), -scrollModSin/2., 1.
    );
    mat3 scale = mat3(
        2.2+mxtime, 0., 0.,
        0., 2.2+mxtime, 0.,
        0., 0., 1.
    );

    vec2 uv = gl_FragCoord.xy / max(resolution.x, resolution.y);
    vec2 constUV = gl_FragCoord.xy / max(resolution.x, resolution.y);

    uv = (vec3(uv, 1.) * scale).xy;
    uv = (vec3(uv, 1.) * trans2).xy;

    uv.x = uv.x+sin(ctaMod.x*2.);
    uv.y = uv.y+scrollMod+ctaMod.y;

    vec2 uvb = vec2( pow(uv.x,2.0)+ctaMod.x, uv.y*ctaMod.y );

    //uv.x += (uvb.x * uvb.x * modifyExtra) * sin(seed2);
    //uv.y *= (uvb.y * uvb.y * modifyExtra);

    //uv = (vec3(uv, 1.) * scale).xy;

    uv.x += (sin(uv.y*(ctaMod.x)) - m8) * 0.1;
    uv.y += (sin(uv.x*(ctaMod.y)) - m7) * 0.1;

    //uv.x *= sin(uvb.y + sin(m9) + cos(m8));
    uv.x += (sin(uvb.x + sin(m8) + cos(m7))) * 0.1;
    uv.y += (sin(uvb.x + m8)) * 0.9;

    uv = (vec3(uv, 1.) * trans).xy;
    uv = (vec3(uv, 1.) * rota).xy;

    modifyXColor = modifyXColor * 3.;
    modifyYColor = modifyYColor * 4.;


    vec4 outcolor = stripes(uv, constUV, ttime, modifyXColor, modifyYColor);

    outcolor = outcolor + (white);
    gl_FragColor = outClamp(outcolor);
}
