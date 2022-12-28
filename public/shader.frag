precision mediump float;

#define PI 3.14159265359

varying vec2 vTexCoord;

uniform sampler2D u_tex;

uniform vec2 u_resolution;
uniform float u_seed;

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

float noise1(vec2 p2, float p) {
    vec2 i = floor(p2);
    vec2 f = fract(p2);
	vec2 u = f * f * (3.0 - 2.0 * f);
    return 1.0 - 2.0 * mix(mix(hash1(i + vec2(0.0, 0.0), p), 
                               hash1(i + vec2(1.0, 0.0), p), u.x),
                           mix(hash1(i + vec2(0.0, 1.0), p), 
                               hash1(i + vec2(1.0, 1.0), p), u.x), u.y);
}

float fbm1(vec2 p2, float p) {
    float value = 0.;
    float amplitude = .5;
    
    for (int i = 0; i < 3; i++) {
        value += amplitude * noise1(p2, p);
        p2 *= 4.;
        amplitude *= .15;
    }
    return value / 1.;
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

    vec3 paper_texture = paper(st - 1., 1.);

    return (color + color2) * paper_texture;
}

vec3 colored_blob (vec2 st, vec3 mask, vec3 color_a, vec3 color_b) {
    // both * 10000. and * 10. are good
    vec3 coloredBlot = mask * mix(color_a, color_b, paper_noise(st * 10000., 0.));

    mask = vec3(1.0) - mask;

    return coloredBlot + mask;
}

vec3 generate_random_blobs(vec2 st, float size, float rm_min, float rm_max, float seed, vec3 color1, vec3 color2) {
    vec3 blobs = vec3(1.);
    for (float i = 1.; i < 12.; i += 1.) {
        float x = rnd(vec2(i + u_seed + seed)) * 0.8 - 0.4;
        float y = rnd(vec2(i * i + u_seed + seed)) * 0.8 - 0.4;

        float r_multiplier = map(rnd(vec2(i / u_seed + seed)), 0., 1., rm_min, rm_max);

        vec3 blob_mask = wc_blob_mask(st, vec2(x, y), size, r_multiplier, i);
        vec3 mixedColor = colored_blob(st, blob_mask, color1, color2);
        blobs = min(mixedColor, blobs);
    }
    return blobs;
}

vec3 wc_splash_mask (vec2 st, float seed, float scale) {
    float noise_val = abs(fbm1(st * scale, seed));
    float tier_delta = 0.02;
    float tier = 0.2 * abs(fbm1(st * 10., seed + 2.)) + tier_delta;
    st += seed;
    
    vec3 splash = vec3(smoothstep(tier_delta, tier, noise_val));
    //vec3 splash = vec3(step(tier, noise_val)); // Чёрные всплески

    //float lt = abs(perlin(st * .1) * 0.02 - 0.01);
    //splash -= vec3(smoothstep(tier, tier_delta, noise_val)) - vec3(1.0); // hole
    
    splash = vec3(1.0) - splash;

    //vec3 splash2 = vec3(smoothstep(tier, tier_delta, noise_val)); // Чёрные всплески   
    //splash2 -= vec3(smoothstep(tier, -0.3, noise_val)); // hole
    float wc_stains = perlin(st * 1. + 1.) * 1.2; // + 0.4;

    //splash2 *= wc_stains;
    splash *= wc_stains;

    float l = 0.07 * length(vec2(perlin(st - 1.0), perlin(st + 1.0)));
    vec3 wc_texture_mask = vec3(perlin(vec2(perlin(st * l)))) * 1.2;

    //splash2 *= wc_texture_mask;
    splash *= wc_texture_mask;

    vec3 paper_texture = paper(st - 1., 1.);
    splash *= paper_texture;

    //splash += splash2;

    return splash;
}

float plot(vec2 st, float pct, float tier0, float tier1){
  return  smoothstep( pct - tier0, pct, st.y) -
          smoothstep( pct, pct + tier1, st.y);
}

vec3 wc_curve_mask (vec2 st, float seed, vec2 p0, vec2 p1) {
    p1 += fbm1(st * 7.1, seed) * distance(st, p1);
    p0 += fbm1(st * 1.1, seed + .2) * distance(st, p0);

    float y = (p0.y - p1.y) * ((st.x - p1.x) / (p0.x - p1.x) + p1.y / (p0.y - p1.y));

    vec3 mask = vec3(plot(st, y, 0.2, 0.));
    mask += vec3(plot(st, y, 0.01, 0.));

    float wc_stains = perlin(st * 1. + seed) * 1.2;
    mask *= wc_stains;

    float l = 0.1 * length(vec2(perlin(st - 1.0), perlin(st + 1.0)));
    vec3 wc_texture_mask = vec3(perlin(vec2(perlin(st * l + seed)))) * 1.2;
    mask *= wc_texture_mask;

    vec3 paper_texture = paper(st - 1., 1.);
    mask *= paper_texture;

    return mask;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy - 0.5;
    st.x *= u_resolution.x / u_resolution.y;

    vec3 blobs = vec3(1.);

    vec3 mixedColor = colored_blob(
        st,
        wc_blob_mask(st, vec2(0.3, -0.5), 0.99, 1.07, 0.0001),
        u_color_1, u_color_2
        );
    blobs = min(mixedColor, blobs);

    vec3 mixedColor2 = colored_blob(
        st,
        wc_blob_mask(st, vec2(-0.3, -0.55), 0.7, 1.06, -0.001),
        u_color_3,
        u_color_4
    );
    blobs = min(mixedColor2, blobs);

    vec3 mixedColor3 = colored_blob(
        st,
        wc_blob_mask(st, vec2(0.3, 0.7), 0.99, 1.07, 0.0001),
        u_color_1,
        u_color_3
    );
    blobs = min(mixedColor3, blobs);

    vec3 mixedColor4 = colored_blob(
        st,
        wc_blob_mask(st, vec2(-0.3, 0.7), 0.7, 1.06, -0.001),
        u_color_1,
        u_color_3
    );
    blobs = min(mixedColor4, blobs);

    for (float i = 0.; i < 30.; i += 1.) {
        float color_seed = rnd(vec2(i));
        vec3 color1, color2;
        if (color_seed < 0.5) {
            color1 = u_color_5;
            color2 = u_color_6;
        } else {
            color1 = u_color_7;
            color2 = u_color_8;
        }

        vec3 mixedColor5 = colored_blob(
            st, 
            wc_curve_mask(st, i, vec2(-0.1, 0.1), vec2(0.1, -0.1)),
            color1,
            color2
        );
        blobs = min(mixedColor5, blobs);
    }

    for (float i = 1.; i < 15.; i += 1.) {
        float xpos = rnd(vec2(i, i * 10.)) * -0.5;
        float ypos = rnd(vec2(i * 10., i + 1.)) * -0.5;

        float size = 0.1 + map(rnd(vec2(i - 1., i + 1.)), 0., 1., -0.1, 0.1);
        float r_multiplier = 0.2 + rnd(vec2(i * i)) * 0.8;

        vec3 blob_mask_ = wc_blob_mask(st, vec2(xpos, ypos), size, r_multiplier, i);
        vec3 mixed_color = colored_blob(st, blob_mask_, u_color_9, u_color_10);
        blobs = min(mixed_color, blobs);
    }

    for (float i = 15.; i < 30.; i += 1.) {
        float xpos = rnd(vec2(i, i * 10.)) * -0.5;
        float ypos = rnd(vec2(i * 10., i + 1.)) * -0.5;

        float size = 0.1 + map(rnd(vec2(i - 1., i + 1.)), 0., 1., -0.1, 0.1);
        float r_multiplier = 0.2 + rnd(vec2(i * i)) * 0.6;

        vec3 blob_mask_ = wc_blob_mask(st, vec2(xpos, ypos), size, r_multiplier, i);
        vec3 mixed_color = colored_blob(st, blob_mask_, u_color_8, u_color_7);
        blobs = min(mixed_color, blobs);
    }

    for (float i = 15.; i < 30.; i += 1.) {
        float xpos = rnd(vec2(i, i * 10.)) * 0.5;
        float ypos = rnd(vec2(i * 10., i + 1.)) * 0.5;

        float size = 0.2 + map(rnd(vec2(i - 1., i + 1.)), 0., 1., -0.1, 0.1);
        float r_multiplier = 0.2 + rnd(vec2(i * i)) * 0.6;

        vec3 blob_mask_ = wc_blob_mask(st, vec2(xpos, ypos), size, r_multiplier, i);
        vec3 mixed_color = colored_blob(st, blob_mask_, u_color_9, u_color_7);
        blobs = min(mixed_color, blobs);
    }

    for (float i = 30.; i < 45.; i += 1.) {
        float xpos = rnd(vec2(i, i * 10.)) * 0.5;
        float ypos = rnd(vec2(i * 10., i + 1.)) * 0.5;

        float size = 0.2 + map(rnd(vec2(i - 1., i + 1.)), 0., 1., -0.1, 0.1);
        float r_multiplier = 0.2 + rnd(vec2(i * i)) * 0.6;

        vec3 blob_mask_ = wc_blob_mask(st, vec2(xpos, ypos), size, r_multiplier, i);
        vec3 mixed_color = colored_blob(st, blob_mask_, u_color_8, u_color_7);
        blobs = min(mixed_color, blobs);
    }


    vec3 paper_texture = paper(st, .8);
    vec3 paper_colored = mix(bg_color_light, paper_texture, vec3(0.5));
    vec4 finalMix = vec4(blobs, 1.) * vec4(paper_colored, 1.);
    //gl_FragColor = vec4(mixedColor3, 1.);
    gl_FragColor = finalMix;
}