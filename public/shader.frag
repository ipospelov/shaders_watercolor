precision mediump float;

#define PI 3.14159265359

uniform vec2 u_resolution;
uniform float u_rand;

uniform vec3 u_color_1;
uniform vec3 u_color_2;

uniform vec3 u_color_3;
uniform vec3 u_color_4;

uniform vec3 u_color_5;
uniform vec3 u_color_6;

uniform vec3 u_color_7;
uniform vec3 u_color_8;

uniform vec3 u_color_9;
uniform vec3 u_color_10;


float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

float random (vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

vec2 random2(vec2 st){
    st = vec2(dot(st,vec2(127.1, 311.7)), dot(st, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(st) * 43758.5453123);
}

float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix( mix( dot( random2(i + vec2(0.0, 0.0) ), f - vec2(0.0, 0.0) ),
                     dot( random2(i + vec2(1.0, 0.0) ), f - vec2(1.0, 0.0) ), u.x),
                mix( dot( random2(i + vec2(0.0, 1.0) ), f - vec2(0.0, 1.0) ),
                     dot( random2(i + vec2(1.0, 1.0) ), f - vec2(1.0, 1.0) ), u.x), u.y);
}

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {

    // Precompute values for skewed triangular grid
    const vec4 C = vec4(0.211324865405187,
                        // (3.0-sqrt(3.0))/6.0
                        0.366025403784439,
                        // 0.5*(sqrt(3.0)-1.0)
                        -0.577350269189626,
                        // -1.0 + 2.0 * C.x
                        0.024390243902439);
                        // 1.0 / 41.0

    // First corner (x0)
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);

    // Other two corners (x1, x2)
    vec2 i1 = vec2(0.0);
    i1 = (x0.x > x0.y)? vec2(1.0, 0.0):vec2(0.0, 1.0);
    vec2 x1 = x0.xy + C.xx - i1;
    vec2 x2 = x0.xy + C.zz;

    // Do some permutations to avoid
    // truncation effects in permutation
    i = mod289(i);
    vec3 p = permute(
            permute( i.y + vec3(0.0, i1.y, 1.0))
                + i.x + vec3(0.0, i1.x, 1.0 ));

    vec3 m = max(0.5 - vec3(
                        dot(x0,x0),
                        dot(x1,x1),
                        dot(x2,x2)
                        ), 0.0);

    m = m*m ;
    m = m*m ;

    // Gradients:
    //  41 pts uniformly over a line, mapped onto a diamond
    //  The ring size 17*17 = 289 is close to a multiple
    //      of 41 (41*7 = 287)

    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;

    // Normalise gradients implicitly by scaling m
    // Approximation of: m *= inversesqrt(a0*a0 + h*h);
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0+h*h);

    // Compute final noise value at P
    vec3 g = vec3(0.0);
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * vec2(x1.x,x2.x) + h.yz * vec2(x1.y,x2.y);
    return 130.0 * dot(m, g);
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

        // if((ceil(t*uv.x)/t) == 1.0)
        // {
        //     b = rnd(vec2(0.0, floor(t*uv.y)/t));
        //     d = rnd(vec2(0.0, ceil(t*uv.y)/t));
        // }

        coef1 = fract(t*uv.x);
        coef2 = fract(t*uv.y);
        p += inter(inter(a,b,coef1), inter(c,d,coef1), coef2) * (1.0/pow(2.0,(i+0.6)));
        t *= 2.0;
    }
    return p;
}

float hash_ (vec2 p) {
	vec3 p3  = fract(vec3(p.xyx) * .1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

float paper_noise(vec2 p) {
    vec4 w = vec4(floor(p), ceil(p));
    float 
        _00 = hash_(w.xy),
        _01 = hash_(w.xw),
        _10 = hash_(w.zy),
        _11 = hash_(w.zw),
    _0 = mix(_00,_01,fract(p.y)),
    _1 = mix(_10,_11,fract(p.y));
    return mix(_0,_1,fract(p.x));
}

float fbm (vec2 p) {
    float o = 0.;
    for (float i = 0.; i < 3.; i++) {
        o += paper_noise(.1 * p) / 3.;
        o += .2 * exp(-2. * abs(sin(.02 * p.x + .01 * p.y))) / 4.;
        p *= 2.;
    }
    return o;
}
vec2 grad (vec2 p) {
    float n = fbm(p + vec2(0., 1.));
    float e = fbm(p + vec2(1., 0.));
    float s = fbm(p - vec2(0., 1.));
    float w = fbm(p - vec2(1., 0.));
    return vec2(e-w, n-s);
}

vec3 paper (vec2 st, float intensity) {
    return vec3(.95) + intensity * grad(st * 3000.).x;
}

vec3 bgColor = vec3(0.96, 0.94, 0.9);
vec3 bg_color_light = vec3(249./255., 251./255., 255./255.);

vec3 colorA = vec3(240./255., 219./255., 219./255.);
vec3 colorB = vec3(219./255., 163./255., 154./255.);

vec3 colorC = vec3(255./255., 178./255., 0./255.); // yellow
vec3 colorD = vec3(255./255., 246./255., 191./255.);

vec3 colorE = vec3(245./255., 232./255., 199./255.); // light yellow-pink
vec3 colorF = vec3(172./255., 112./255., 136./255.);

vec3 color_1 = vec3(217./255., 173./255., 188./255.); // light red
vec3 color_2 = vec3(255./255., 173./255., 188./255.);

vec3 color_3 = vec3(211./255., 222./255., 220./255.); // light green
vec3 color_4 = vec3(146./255., 169./255., 189./255.);

vec3 color_5 = vec3(135./255., 76./255., 98./255.); // purple
vec3 color_6 = vec3(195./255., 123./255., 127./255.);

vec3 color_7 = vec3(73./255., 85./255., 121./255.); // dark blue 
vec3 color_8 = vec3(195./255., 123./255., 127./255.);

vec3 color_9 = vec3(6./255., 40./255., 61./255.); // izumrud 
vec3 color_10 = vec3(37./255., 109./255., 133./255.);

vec3 color_11 = vec3(85./255., 113./255., 83./255.); // salad
vec3 color_12 = vec3(125./255., 143./255., 105./255.);

vec3 color_13 = vec3(79./255., 160./255., 149./255.); // green-blue
vec3 color_14 = vec3(21./255., 52./255., 98./255.);

vec3 color_15 = vec3(63./255., 59./255., 108./255.); // purple
vec3 color_16 = vec3(98./255., 79./255., 130./255.);

vec3 color_17 = vec3(163./255., 199./255., 214./255.); // light blue
vec3 color_18 = vec3(66./255., 3./255., 44./255.); // granate

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

    color = color * wc_stains * 1.4;

    float l = 0.05 * length(vec2(perlin(st2 - 1.0 + seed * seed), perlin(st2 + 1.0 + seed * seed)));
    vec3 wc_texture_mask = vec3(perlin(vec2(perlin(st * l)))) * 1.2;
    color2 = color2 * wc_texture_mask;

    color = color * wc_texture_mask * 1.5;

    //return clamp(color + color2, 0.0, 1.0);
    return color + color2;
}

vec3 colored_blob (vec2 st, vec3 mask, vec3 color_a, vec3 color_b) {
    // both * 10000. and * 10. are good
    vec3 coloredBlot = mask * mix(color_a, color_b, paper_noise(st * 10000.));

    //vec3 wc_texture_mask = vec3(1.0 - snoise(st * 400.) * snoise(st * 4000.) * 0.32);
    //mask *= wc_texture_mask;

    mask = vec3(1.0) - mask;

    return coloredBlot + mask;
}

vec3 generate_random_blobs(vec2 st, float size, float rm_min, float rm_max, float seed, vec3 color1, vec3 color2) {
    vec3 blobs = vec3(1.);
    for (float i = 1.; i < 10.; i += 1.) {
        float x = rnd(vec2(i + u_rand + seed)) * 0.8 - 0.4;
        float y = rnd(vec2(i * i + u_rand + seed)) * 0.8 - 0.4;

        float r_multiplier = map(rnd(vec2(i / u_rand + seed)), 0., 1., rm_min, rm_max);

        vec3 blob_mask = wc_blob_mask(st, vec2(x, y), size, r_multiplier, i);
        vec3 mixedColor = colored_blob(st, blob_mask, color1, color2);
        blobs = min(mixedColor, blobs);
    }
    return blobs;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy - 0.5;
    st.x *= u_resolution.x / u_resolution.y;

    vec3 blobs = vec3(1.);

    vec3 blob_mask = wc_blob_mask(st, vec2(-0.1, 0.3), 0.99, 1.07, 1.);
    vec3 mixedColor = colored_blob(st, blob_mask, u_color_1, u_color_4);
    blobs = min(mixedColor, blobs);

    vec3 blob_mask2 = wc_blob_mask(st, vec2(0.3, -0.3), 0.99, 1.07, 2.);
    vec3 mixedColor2 = colored_blob(st, blob_mask2, u_color_5, u_color_6);
    blobs = min(mixedColor2, blobs);

    blobs = min(blobs, generate_random_blobs(st, 0.15, 0.4, 0.8, 1., u_color_1, u_color_4)); 
    blobs = min(blobs, generate_random_blobs(st, 0.15, 0.4, 0.8, 2., u_color_5, u_color_4)); 
    blobs = min(blobs, generate_random_blobs(st, 0.15, 0.6, 0.9, 3., u_color_7, u_color_6)); 

    for (float i = 1.; i < 20.; i += 1.) {
        float x = abs(snoise(vec2(i * 0.05 + u_rand))) * 0.8 - 0.4;
        float y = abs(snoise(vec2(i * 0.05 - u_rand))) * 0.8 - 0.4;

        float r_multiplier = map(rnd(vec2(i / u_rand)), 0., 1., 0.4, 0.8);

        vec3 blob_mask = wc_blob_mask(st, vec2(x, y), 0.15, r_multiplier, i);
        vec3 mixedColor = colored_blob(st, blob_mask, u_color_3, u_color_4);
        blobs = min(mixedColor, blobs);
    }

    for (float i = 20.; i < 30.; i += 1.) {
        float x = abs(snoise(vec2(i * 0.05 + u_rand))) * 0.8 - 0.4;
        float y = abs(snoise(vec2(i * 0.05 - u_rand))) * 0.8 - 0.4;

        float r_multiplier = map(rnd(vec2(i / u_rand)), 0., 1., 0.4, 0.8);

        vec3 blob_mask = wc_blob_mask(st, vec2(x, y), 0.55, r_multiplier, i);
        vec3 mixedColor = colored_blob(st, blob_mask, u_color_10, u_color_9);
        blobs = min(mixedColor, blobs);
    }


    vec3 paper_texture = paper(st, 0.8);
    vec3 paper_colored = mix(bg_color_light, paper_texture, vec3(0.5));

    vec4 finalMix = vec4(blobs, 1.) * vec4(paper_colored, 1.);

    gl_FragColor = finalMix;
}