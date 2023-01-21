precision mediump float;

varying vec2 vTexCoord;

uniform sampler2D u_tex;

uniform vec2 u_resolution;
uniform float u_seed;
uniform float u_time;
uniform int u_count;

uniform float u_size;
uniform float u_radius;
uniform float u_noise_multiplier;

uniform vec3 u_color_1;
uniform vec3 u_color_2;

uniform vec2 u_p;

uniform bool u_paper;

#define _PerlinPrecision 8.0
#define _PerlinOctaves 8.0

float rnd(vec2 xy)
{
    return fract(sin(dot(xy, vec2(12.9898-u_seed, 78.233+u_seed)))* (43758.5453+u_seed));
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

float hash(vec2 p2, float p) {
    vec3 p3 = fract(vec3(5.3983 * p2.x, 5.4427 * p2.y, 6.9371 * p));
    p3 += dot(p3, p3.yzx + 19.19);
    return fract((p3.x + p3.y) * p3.z);
}

float paper_noise(vec2 p, float seed) {
    vec4 w = vec4(floor(p), ceil(p));
    float 
        _00 = hash(w.xy, seed),
        _01 = hash(w.xw, seed),
        _10 = hash(w.zy, seed),
        _11 = hash(w.zw, seed),
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
    return e - w;
}

float paper (vec2 st, float intensity) {
    return 0.95 + intensity * grad(st * 3000.);
}


float wc_blob_mask (vec2 st, vec2 position) {
    vec2 st2 = st - position;

    float r = length(st2) * u_radius;
    float noise_val = u_noise_multiplier * perlin(st2 + u_seed) + r;

    float tier = u_size;
    float tier_delta = 0.1;

    float color = step(tier, noise_val); // Чёрные всплески
    color -= smoothstep(tier - tier_delta, tier, noise_val) - 1.; // hole
    color = 1. - color;

    float color2 = smoothstep(tier, tier - tier_delta, noise_val); // Чёрные всплески   
    color2 -= smoothstep(tier, -0.3, noise_val); // hole

    float wc_stains = perlin(st * 2.); // + 0.4;
    color2 = color2 * wc_stains;
    color = color * wc_stains * 1.;

    float l = 0.05 * length(vec2(perlin(st2 - u_seed), perlin(st2+ u_seed)));
    float wc_texture_mask = perlin(vec2(perlin(st * l))) * 1.;
    color2 = color2 * wc_texture_mask;
    color = color * wc_texture_mask * 1.5;

    float paper_texture = paper(st - u_seed, 1.);

    return (color + color2) * paper_texture;
}

vec3 colored_blob (vec2 st, float mask, vec3 color_a, vec3 color_b) {
    vec3 coloredBlot = vec3(mask) * mix(color_a, color_b, paper_noise(st * 20., u_seed));

    return coloredBlot + vec3(1.0 - mask);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv.y = 1.0 - uv.y;

    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;

    float mask = wc_blob_mask(st, u_p);
    
    vec3 mixedColor = colored_blob(
        st, 
        mask,
        u_color_1,
        u_color_2
    );

    vec4 finalMix = vec4(mixedColor, 1.);

    if (u_count != 1) {
        finalMix = min(texture2D(u_tex, uv), finalMix);
    }

    gl_FragColor = finalMix;
}