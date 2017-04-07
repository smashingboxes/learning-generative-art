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

const vec4 color1 = vec4( 234./255., 23./255.,  106./255., 1. );
const vec4 color2 = vec4( 200./255., 34./255.,  93./255., 1. );
const vec4 color3 = vec4(  43./255., 162./255., 245./255., 1. );
const vec4 color4 = vec4( 148./255., 212./255., 229./255., 1. );
const vec4 color5 = vec4( 137./255., 23./255., 234./255., 1. );
const vec4 white = vec4( 1., 1., 1., 1. );

vec4 colorRand = color2;

float safeSin(float num) {
    return 0.5+(sin(num)/2.);
}

vec4 makeStripe(vec4 stripeout, vec2 point, float learningX, vec4 color, float ttime, float freqMod1, float freqMod2, float angleMult, float pointMult) {

    float mX = safeSin(learningX);
    float freq = freqMod1 + (freqMod2 * mX);

    vec2 _point = vec2(point);
    float sAng = sin( (ttime * angleMult * (pointMult * point.x / freq)) / hPI );
    float cAng = cos( (ttime * angleMult * (pointMult * point.x / freq)) / hPI );
    mat3 rota = mat3(
        cAng, -sAng, 0.,
        sAng, cAng, 0.,
        -freq, freq, 1.
    );

    _point = (vec3(_point + sin(learning4), 1.) * (rota - 0.)).xy;
    stripeout = (stripeout+(color*(_point.y*mX)));

    return stripeout;
}

vec4 makeHardStripe(vec4 stripeout, vec2 _uv, float learningX, float learningY, float freqScope, float freqJitter, float stripeWidth)
{

    float mX = sin(learningX);
    float freq = freqScope + (freqJitter * mX);

    if (mod(_uv.x, freq) > (freqJitter) &&
        mod(_uv.x, freq) < (freqJitter)+(stripeWidth)) {
        stripeout -= color1;
    }

    return stripeout;
}

vec4 stripes(vec2 _uv, vec2 constUV, float ttime)
{
    vec4 stripeout = white;

    stripeout = makeStripe(stripeout, _uv, learning7, color1, ttime, 7.0, 4.0, 4.0, 0.2);
    stripeout = makeStripe(stripeout, _uv*_uv.yx*1.2, learning8, color2, ttime*0.9, 1.0, 7.1, 1.1, 0.12);
    stripeout = makeStripe(stripeout, _uv*0.91, learning9, color3, ttime*0.1, 1.0, 3.0, 0.4, 0.3);
    stripeout = makeStripe(stripeout, _uv*0.9, learning6, color4, ttime*0.92, 2.0, 2.2, 2.1, 0.9);
    stripeout = makeStripe(stripeout, _uv*_uv.yx*1.5, learning5, color5, ttime, 5.0, 5.0, 3.0, 1.5);

    stripeout = makeHardStripe(stripeout, _uv, learning9+0.1, learning1, 7.0, 4.2, 0.3);
    stripeout = makeHardStripe(stripeout, _uv*_uv.yy, learning7+0.1, learning8, 3.0, 1.2, 0.4);
    stripeout = makeHardStripe(stripeout, _uv*_uv.xx, learning5+0.1, learning6, 1.0, 3.2, 0.4);

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

    float modifyExtra = safeSin(learning4);

    float m7 = safeSin(learning7*learning7);
    float m8 = safeSin(learning8*learning8);
    float m9 = safeSin(learning9*learning9);
    float seed = rawseed*999999999.;
    float seed2 = rawseed*hPI;

    float scrollMod = (scrolly*modifyScroll);
    float scrollModSin = safeSin(scrollMod+seed2);

    vec2 ctaMod = (ctaDistance * modifyMouse * mouseEffectDampening) * learning1;

    float delayMouseXMod = delayMouse.x*(modifyMouse)*mouseEffectDampening;
    float delayMouseYMod = delayMouse.y*(modifyMouse)*mouseEffectDampening;
    float mtime = safeSin((ttime+(seed))-(modifyTimeEffect*1.))+0.1;
    float mxtime = safeSin(ttime*modifyTimeEffect);

    float mmtime = sin(ttime*m8)/5.;
    float sAng = sin( ((learning3*learning2*10.) + time) / hPI );
    float cAng = cos( ((learning3*learning2*10.) + time) / hPI );

    mat3 rota = mat3(
        cAng, -sAng, 0.,
        sAng, cAng, 0.,
        0., 0., 1.
    );
    mat3 trans = mat3(
        1., 0., 0.,
        0., 1., 0.,
        delayMouseXMod*safeSin(learning7), delayMouseYMod*safeSin(learning7), 1.
    );
    mat3 trans2 = mat3(
        1., 0., 0.,
        0., 1., 0.,
        1000000.+time+(safeSin(learning4)*0.0002*m7), -scrollModSin/2., 1.
    );
    mat3 scale = mat3(
        1.9 + safeSin(learning5)/10., 0., 0.,
        0., 1.9 + safeSin(learning5)/10., 0.,
        0., 0., 1.
    );

    vec2 uv = gl_FragCoord.xy / max(resolution.x, resolution.y);
    vec2 constUV = gl_FragCoord.xy / max(resolution.x, resolution.y);

    uv = (vec3(uv, 1.) * scale).xy;
    uv = (vec3(uv, 1.) * trans2).xy;

    uv.x = uv.x+sin(ctaMod.x*2.);
    uv.y = uv.y+scrollMod+ctaMod.y;

    vec2 uvb = vec2( pow(uv.x,2.0)+ctaMod.x, uv.y*ctaMod.y ) + vec2(learning1,learning0);

    uv.x += (sin(uv.y*(ctaMod.x)) - m8) * 0.1;
    uv.y += (sin(uv.x*(ctaMod.y)) - m7) * 0.1;

    uv.x += (sin(uvb.x + sin(m8) + cos(m7))) * 0.1;
    uv.y += (sin(uvb.x + m8)) * 0.9;

    uv = (vec3(uv, 1.) * trans).xy;
    uv = (vec3(uv, 1.) * rota).xy;

    vec4 outcolor = stripes(uv, constUV, ttime);

    gl_FragColor = normalize(outcolor);
}
