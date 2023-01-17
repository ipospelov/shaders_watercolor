precision mediump float;

#define PI 3.14159265359

varying vec2 vTexCoord;

uniform sampler2D u_tex;

uniform vec2 u_resolution;
uniform float u_seed;
uniform float u_time;
uniform int u_count;

uniform vec3 u_color_1;
uniform vec3 u_color_2;

uniform vec2 u_p;

uniform bool u_paper;


float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

#define _PerlinPrecision 8.0
#define _PerlinOctaves 8.0
#define _PerlinSeed 1.

float rnd(vec2 xy)
{
    return fract(sin(dot(xy, vec2(12.9898-_PerlinSeed, 78.233+_PerlinSeed)))* (43758.5453+_PerlinSeed));
}

float inter(float a, float b, float x)
{
    //return a*(1.0-x) + b*x; // Linear interpolation

    float f = (1.0 - cos(x * 3.1415927)) * 0.5; // Cosine interpolation
    return a*(1.0-f) + b*f;
}

float perlin(vec2 uv) {
    float a,b,c,d, coef1,coef2, t, p;

    t = _PerlinPrecision;					// Precision
    p = 0.0;								// Final heightmap value

    for(float i=0.0; i<_PerlinOctaves; i++)
    {
        a = rnd(vec2(floor(t*uv.x)/t, floor(t*uv.y)/t));	//	a----b
        b = rnd(vec2(ceil(t*uv.x)/t, floor(t*uv.y)/t));		//	|    |
        c = rnd(vec2(floor(t*uv.x)/t, ceil(t*uv.y)/t));		//	c----d
        d = rnd(vec2(ceil(t*uv.x)/t, ceil(t*uv.y)/t));

        coef1 = fract(t*uv.x);
        coef2 = fract(t*uv.y);
        p += inter(inter(a,b,coef1), inter(c,d,coef1), coef2) * (1.0/pow(2.0,(i+0.6)));
        t *= 2.0;
    }
    return p;
}

float hash1(vec2 p2, float p) {
    vec3 p3 = fract(vec3(5.3983 * p2.x, 5.4427 * p2.y, 6.9371 * p));
    p3 += dot(p3, p3.yzx + 19.19);
    return fract((p3.x + p3.y) * p3.z);
}

float paper_noise(vec2 p, float seed) {
    vec4 w = vec4(floor(p), ceil(p));
    float 
        _00 = hash1(w.xy, seed),
        _01 = hash1(w.xw, seed),
        _10 = hash1(w.zy, seed),
        _11 = hash1(w.zw, seed),
    _0 = mix(_00,_01,fract(p.y)),
    _1 = mix(_10,_11,fract(p.y));
    return mix(_0,_1,fract(p.x));
}

float fbm (vec2 p) {
    float o = 0.;
    for (float i = 0.; i < 3.; i++) {
        o += paper_noise(.1 * p, 0.) / 3.;
        o += .2 * exp(-2. * abs(sin(.02 * p.x + .01 * p.y))) / 4.;
        p *= 2.;
    }
    return o;
}

float grad (vec2 p) {
    float e = fbm(p + vec2(1., 0.));
    float w = fbm(p - vec2(1., 0.));
    return e-w;
}

float paper (vec2 st, float intensity) {
    return 0.95 + intensity * grad(st * 3000.);
}

vec3 bg_color_light = vec3(249./255., 251./255., 255./255.);

vec3 wc_blob_mask (vec2 st, vec2 position, float size, float r_multiplier, float seed) {
    vec2 st2 = st - position;

    float r = length(st2) * map(r_multiplier, 0., 1., 40., 1.);
    float noise_val = size * perlin(st2 + fract(seed / 2.124)) + r;

    float tier = 0.5;
    float tier_delta = 0.1;

    vec3 color = vec3(step(tier, noise_val)); // Чёрные всплески
    color -= vec3(smoothstep(tier - tier_delta, tier, noise_val)) - vec3(1.0); // hole
    color = vec3(1.0) - color;

    vec3 color2 = vec3(smoothstep(tier, tier - tier_delta, noise_val)); // Чёрные всплески   
    color2 -= vec3(smoothstep(tier, -0.3, noise_val)); // hole

    float wc_stains = perlin(st * 2.); // + 0.4;
    color2 = color2 * wc_stains;
    color = color * wc_stains * 1.;

    float l = 0.05 * length(vec2(perlin(st2 - 1.0 + seed * seed), perlin(st2 + 1.0 + seed * seed)));
    vec3 wc_texture_mask = vec3(perlin(vec2(perlin(st * l)))) * 1.;
    color2 = color2 * wc_texture_mask;
    color = color * wc_texture_mask * 1.5;

    vec3 paper_texture = vec3(paper(st - 1., 1.5));

    return (color + color2) * paper_texture;
}

vec3 colored_blob (vec2 st, vec3 mask, vec3 color_a, vec3 color_b, float seed) {
    vec3 coloredBlot = mask * mix(color_a, color_b, paper_noise(st * 20., seed));
    //vec3 coloredBlot = mask * mix(color_a, color_b, clamp(fbm1(st * 20., seed), 0., 1.));
    
    mask = vec3(1.0) - mask;
    

    return coloredBlot + mask;
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv.y = 1.0 - uv.y;

    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;

    float seed = 0.00001 * float(u_count / 2) + u_seed;

    vec3 blobs = vec3(1.);

    vec3 mask = vec3(wc_blob_mask(st, u_p, .2, 0.4, seed));
    
    vec3 mixedColor = colored_blob(
        st, 
        mask,
        u_color_1,
        u_color_2,
        seed
    );

    vec4 finalMix = vec4(mixedColor, 1.);

    if (u_count != 0) {
        finalMix = min(texture2D(u_tex, uv), finalMix);
    }

    gl_FragColor = finalMix;
}