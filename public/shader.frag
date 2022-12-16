precision mediump float;

#define PI 3.14159265359

uniform vec2 u_resolution;


float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

float plot(vec2 st, float pct){
  return  smoothstep(pct - 0.02, pct, st.y) - smoothstep(pct, pct + 0.001, st.y);
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
#define _PerlinSeed 0.0

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

vec3 bgColor = vec3(0.96, 0.94, 0.9);

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


vec3 wc_blob_mask (vec2 st, vec2 position, float size, float r_multiplier, float seed) {
    vec2 st2 = st - position;

    float r = length(st2) * map(r_multiplier, 0., 1., 40., 1.);

    float noise_val = size * perlin(st2 + fract(seed / 2.124)) + r;

    float tier = 0.5;
    float tier_delta = 0.03;
    vec3 color = vec3(step(tier, noise_val)); // Чёрные всплески
    
    color -= vec3(smoothstep(tier - tier_delta, tier, noise_val)) - vec3(1.0); // Отверстия во всплесках
    color = vec3(1.0) - color;

    vec3 color2 = vec3(smoothstep(tier, tier - tier_delta, noise_val)); // Чёрные всплески   
    color2 -= vec3(smoothstep(tier, -0.3, noise_val)); // Отверстия во всплесках
    float wc_stains = perlin(st * 2.) * 1.5;
    color2 = color2 * wc_stains;

    float l = 0.1 * length(vec2(perlin(st2 - 1.0 + seed * seed), perlin(st2 + 1.0 + seed * seed)));
    vec3 wc_texture_mask = vec3(perlin(vec2(perlin(st * l)))) * 1.5;
    color2 = color2 * wc_texture_mask;

    //return smoothstep(0.0, 1.0, color + color2);
    return color + color2;
}

float perpendicular(vec2 st, vec2 p1, vec2 p2, vec2 pp) {
    return - (st.x - pp.x) / (p1.y - p2.y) -  (st.y - pp.y) / (p1.x - p2.x);
}

float plot(vec2 st, vec2 p1, vec2 p2) {
    float p2_diff, p1_diff;
    if (sign(p1.x - p2.x) * sign(p1.y - p2.y) >= 0.) {
        p2_diff = perpendicular(st, p1, p2, p1);
        p1_diff = perpendicular(st, p1, p2, p2);
    } else {
        p2_diff = perpendicular(st, p1, p2, p2);
        p1_diff = perpendicular(st, p1, p2, p1);
    }

    p1 += perlin(p2 * 10.1) * distance(st, p1);
    p2 += perlin(p1 * 15.1);

    float diff = abs((st.x - p2.x) / (p1.x - p2.x) - (st.y - p2.y) / (p1.y - p2.y));
    diff *= 6.;

    float tier_disp = 0.03;
    diff += map(perlin(st * 7.), 0., 1., -tier_disp, tier_disp);

    return diff;

    return clamp(max(step(-p1_diff, 0.), step(p2_diff, 0.)) + diff, 0., 1.);
    //return clamp(step(-p1_diff, 0.) + step(p2_diff, 0.) + diff, 0., 1.);
}


vec3 double_blob (vec2 st, vec2 p2, vec2 p3, float size, float r_multiplier, float seed) {
    vec2 st2 = st - p2;
    vec2 st3 = st - p3;
    
    float r2 = length(st2) * map(r_multiplier, 0., 1., 40., 1.);
    float r3 = length(st3) * map(r_multiplier, 0., 1., 40., 1.);

    float noise_val2 = size * perlin(st2 + fract(seed / 2.124)) + r2;
    float noise_val3 = size * perlin(st3 + fract(seed / 2.124)) + r3;

    float noise_val = plot(st, p2, p3);

    noise_val = min(noise_val, noise_val2);
    noise_val = min(noise_val, noise_val3);

    //return vec3(noise_val);

    float tier = 0.5;
    float tier_delta = 0.03;
    vec3 color = vec3(step(tier, noise_val)); // Чёрные всплески

    //return color;
    
    color -= vec3(smoothstep(tier - tier_delta, tier, noise_val)) - vec3(1.0); // Отверстия во всплесках
    color = vec3(1.0) - color;

    vec3 color2 = vec3(smoothstep(tier, tier - tier_delta, noise_val)); // Чёрные всплески   
    //color2 -= vec3(smoothstep(tier, -0.3, noise_val)); // Отверстия во всплесках
    float wc_stains = perlin(st * 2.) * 1.5;
    color2 = color2 * wc_stains;

    float l = 0.1 * length(vec2(perlin(st2 - 1.0 + seed * seed), perlin(st2 + 1.0 + seed * seed)));
    vec3 wc_texture_mask = vec3(perlin(vec2(perlin(st * l)))) * 1.5;
    color2 = color2 * wc_texture_mask;

    return color + color2;
}

vec3 colored_blob (vec2 st, vec3 mask, vec3 color_a, vec3 color_b) {
    vec3 coloredBlot = mask * mix(color_a, color_b, noise(st * 10.));

    vec3 wc_texture_mask = vec3(1.0 - snoise(st * 400.) * snoise(st * 4000.) * 0.72);

    mask *= wc_texture_mask;
    mask = vec3(1.0) - mask;

    return coloredBlot + mask;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy - 0.5;
    st.x *= u_resolution.x / u_resolution.y;

    vec3 blobs = vec3(1.);

    float r_multiplier = 0.7;

    vec3 blob_mask2 = wc_blob_mask(st, vec2(0.0, -0.1), .25, r_multiplier, 3.);
    vec3 mixedColor2 = colored_blob(st, blob_mask2, color_7, color_8);

    vec3 blob_mask3 = wc_blob_mask(st, vec2(-0.1, 0.1), .15, r_multiplier, 1.1);
    vec3 mixedColor3 = colored_blob(st, blob_mask3, color_7, color_8);


    vec2 p2 = vec2(0.0, 0.1);
    vec2 p3 = vec2(-0.1, -0.3);

    vec3 d_blob_mask = double_blob(st, p2, p3, .25, r_multiplier, 3.);
    vec3 d_mixed_color = colored_blob(st, d_blob_mask, color_7, color_8);

    // blobs = min(mixedColor2, blobs);
    // blobs = min(mixedColor3, blobs);
    blobs = min(d_mixed_color, blobs);

    // for (float i = 1.; i < 2.; i += 1.) {
    //      float xpos = rnd(vec2(i, i * 100.)) * 0.4 - 0.2;
    //      float ypos = rnd(vec2(i * 120., i + 1.)) * 0.6 - 0.3;

    //     float xpos2 = xpos + map(rnd(vec2(i / 21.)), 0., 1., -0.4, 0.4);
    //     float ypos2 = ypos + map(rnd(vec2(i * 21.)), 0., 1., -0.4, 0.4);

    //      float size = 0.25;
    //      float r_multiplier = 0.8;

    //      vec3 blob_mask_ = double_blob(st, vec2(xpos, ypos), vec2(xpos2, ypos2), size, r_multiplier, i);
    //      vec3 mixed_color = colored_blob(st, blob_mask_, color_7, color_8);
    //      blobs = min(mixed_color, blobs);
    //  }

    vec3 bg_texture_mask = vec3(1.0 - perlin(st * 1000.));
    bg_texture_mask *= noise(st * 2012.);
    bg_texture_mask = vec3(1.0) - bg_texture_mask;
    vec3 bg = bgColor * bg_texture_mask;

    vec4 finalMix = vec4(blobs, 1.) * vec4(bg, 1.);

    gl_FragColor = finalMix;
    //gl_FragColor = vec4(d_blob_mask, 1.);
}