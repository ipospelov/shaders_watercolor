precision mediump float;

varying vec2 vTexCoord;

uniform sampler2D u_tex;

uniform vec2 u_resolution;
uniform float u_seed;
uniform float u_time;
uniform int u_count;

uniform vec3 u_color_1;
uniform vec3 u_color_2;

uniform vec2 u_p0;
uniform vec2 u_p1;

uniform float u_width;
uniform float u_amplitude;
uniform float u_frequency;
uniform float u_fbm_frequency;
uniform float u_fbm_amplitude;

float inter(float a, float b, float x) {
    //return a*(1.0-x) + b*x; // Linear interpolation

    float f = (1.0 - cos(x * 3.1415927)) * 0.5; // Cosine interpolation
    return a*(1.0-f) + b*f;
}

float rnd(vec2 xy) {
    return fract(sin(dot(xy, vec2(12.9898 - u_seed, 78.233 + u_seed))) * (43758.5453 + u_seed));
}

float hash(vec2 p2, float p) {
    vec3 p3 = fract(vec3(5.3983 * p2.x, 5.4427 * p2.y, 6.9371 * p));
    p3 += dot(p3, p3.yzx + 19.19);
    return fract((p3.x + p3.y) * p3.z);
}

float noise(vec2 p2, float p) {
    vec2 i = floor(p2);
    vec2 f = fract(p2);
	vec2 u = f * f * (3.0 - 2.0 * f);
    return 1.0 - 2.0 * mix(mix(hash(i + vec2(0.0, 0.0), p), 
                               hash(i + vec2(1.0, 0.0), p), u.x),
                           mix(hash(i + vec2(0.0, 1.0), p), 
                               hash(i + vec2(1.0, 1.0), p), u.x), u.y);
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

float paper_fbm (vec2 p) {
    float o = 0.;
    for (float i = 0.; i < 3.; i++) {
        o += paper_noise(.1 * p, 0.) / 3.;
        o += .2 * exp(-2. * abs(sin(.02 * p.x + .01 * p.y))) / 4.;
        p *= 2.;
    }
    return o;
}

float grad (vec2 p) {
    float e = paper_fbm(p + vec2(1., 0.));
    float w = paper_fbm(p - vec2(1., 0.));
    return e-w;
}

float paper (vec2 st, float intensity) {
    return 0.95 + intensity * grad(st * 3000.);
}

float perlin(vec2 uv) {
    float a,b,c,d, coef1,coef2, t, p;

    t = 8.0;					// Precision
    p = 0.0;								// Final heightmap value

    for(float i = 0.0; i< 8.0; i++) {
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

float fbm(vec2 p2, float p) {
    float value = .0;
    float amplitude = u_amplitude;
    
    for (int i = 0; i < 4; i++) {
        value += amplitude * noise(p2, p);
        p2 *= u_fbm_frequency;
        amplitude *= u_fbm_amplitude;
    }
    return value / 1.;
}

float plot(vec2 st, float pct, float tier0, float tier1){
  return  smoothstep(pct - tier0, pct, st.y) -
          smoothstep(pct, pct + tier1, st.y);
}

float line_by_points(vec2 st, vec2 p0, vec2 p1) {
    return (p0.y - p1.y) * (st.x - p1.x) / (p0.x - p1.x) + p1.y;
}

vec3 curve_mask (vec2 st, vec2 p0, vec2 p1) {
    vec2 st_f = st * u_frequency;
    vec2 p1_deviation = vec2(fbm(st_f, u_seed), fbm(st_f, u_seed * 1.5));
    p1_deviation *= distance(st, p1);
    vec2 p1_new = p1 + p1_deviation;

    vec2 p0_deviation = vec2(fbm(st_f, u_seed + 1.5), fbm(st_f, u_seed * 2.5));
    p0_deviation *= distance(st, p0);
    vec2 p0_new = p0 + p0_deviation;

    float y = line_by_points(st, p1_new, p0_new);

    vec3 mask = vec3(plot(st, y, u_width, 0.));
    
    vec2 st2 = st + vec2(u_seed);

    mask *= perlin(st * 1. + u_seed) * 1.2;

    float noise_scale = 0.001;
    float l = .3 * length(vec2(perlin(st2 * noise_scale - 1.0), perlin(st2 * noise_scale + 1.0)));
    mask *= vec3(perlin(vec2(perlin(st2 * l)))) * 1.2;

    mask += vec3(plot(st, y, 0.01, 0.)) / 2.;

    float paper_texture = paper(st2 - 1., 1.);
    mask *= paper_texture;

    return mask;
}

vec3 colorize (vec2 st, vec3 mask) {
    vec3 colorized = mask * mix(u_color_1, u_color_2, paper_noise(st * 20., u_seed));
    //vec3 coloredBlot = mask * mix(color_a, color_b, clamp(fbm1(st * 20., seed), 0., 1.));
    mask = vec3(1.0) - mask;
    return colorized + mask;
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv.y = 1.0 - uv.y;

    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;

    vec2 p0 = vec2(u_p0.x * u_resolution.x / u_resolution.y, u_p0.y);
    vec2 p1 = vec2(u_p1.x * u_resolution.x / u_resolution.y, u_p1.y);

    vec3 mask = curve_mask(st, p0, p1);
    
    vec3 mixedColor = colorize(
        st, 
        mask
    );

    vec4 finalMix = vec4(mixedColor, 1.);

    if (u_count != 0) {
        finalMix = min(texture2D(u_tex, uv), finalMix);
    }

    gl_FragColor = finalMix;
}