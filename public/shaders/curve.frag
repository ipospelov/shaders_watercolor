precision mediump float;

varying vec2 vTexCoord;

uniform sampler2D u_tex;

uniform vec2 u_resolution;
uniform float u_seed;
uniform float u_color_seed;
uniform int u_count;

uniform vec3 u_color_1;
uniform vec3 u_color_2;

uniform vec2 u_p0;
uniform vec2 u_p1;

uniform float u_width;
uniform float u_blur;
uniform float u_amplitude;
uniform float u_frequency;

uniform float u_fbm_n;
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

float noise(vec2 p2, float p) {
    vec2 i = floor(p2);
    vec2 f = fract(p2);
	vec2 u = f * f * (3.0 - 2.0 * f);
    return 1.0 - 2.0 * mix(mix(hash(i + vec2(0.0, 0.0), p), 
                               hash(i + vec2(1.0, 0.0), p), u.x),
                           mix(hash(i + vec2(0.0, 1.0), p), 
                               hash(i + vec2(1.0, 1.0), p), u.x), u.y);
}

float fbm(vec2 p2, float p) {
    float value = .0;
    float amplitude = u_amplitude;
    
    for (float i = 0.; i < 7.; i++) {
        if (i >= u_fbm_n) {
            break;
        }

        value += amplitude * noise(p2, p);
        p2 *= u_fbm_frequency;
        amplitude *= u_fbm_amplitude;
    }
    return value;
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

float paper (vec2 st, float intensity, float brightness) {
    return brightness + intensity * grad(st * 3000.);
}

float distance_to_line(vec2 line_p0, vec2 line_p1, vec2 p) {
    vec2 direction = line_p0 - line_p1;
    float line_len = pow(length(direction), 2.);
    float leg_len = dot(line_p0 - p, direction) / line_len;

    float t = max(0., min(1., leg_len));
    vec2 projection = line_p0 + t * (line_p1 - line_p0);

    return distance(p, projection);
}

float curve_mask(vec2 st, vec2 start_p, vec2 end_p) {
    vec2 start_deviation = vec2(fbm(st * u_frequency, u_seed), fbm(st * u_frequency, u_seed * 1.5));
    start_deviation *= distance(st, start_p);
    start_p += start_deviation;

    vec2 end_deviation = vec2(fbm(st * u_frequency, u_seed + 1.5), fbm(st * u_frequency, u_seed * 2.5));
    end_deviation *= distance(st, end_p);
    end_p += end_deviation;

    float mask = distance_to_line(start_p, end_p, st);
    
    return mask;
}

float wc_curve_mask(vec2 st, vec2 start_p, vec2 end_p) {
    float curve_mask = curve_mask(st, start_p, end_p);
    curve_mask *= clamp(perlin(st * 5. + u_seed), 0.5, 1.);

    float hole_delta = 0.002;
    float low_tier = u_width;
    float high_tier = u_width + 0.0002;

    float higt_tier_deviation = u_blur;
    high_tier = abs(noise(st * 10., u_seed)) * higt_tier_deviation + high_tier;

    float curve = 1. - smoothstep(low_tier, high_tier, curve_mask);
    float hole = 1. - smoothstep(high_tier - hole_delta, high_tier, curve_mask);

    curve = (curve - hole) + curve;

    vec2 st2 = st + noise(vec2(u_color_seed), u_color_seed);

    float multiplier = 1.2;
    float clamp_bound = 0.7;

    curve *= clamp(perlin(st2), clamp_bound, 1.) * multiplier;

    float noise_scale = 5.5;
    float l = .01 * length(vec2(perlin(st2 * noise_scale - 1.0), perlin(st2 * noise_scale + 1.0)));
    curve *= clamp(perlin(vec2(perlin(st2 * l))), clamp_bound, 1.) * multiplier;

    float paper_texture = paper(st2, .8, .95);
    curve *= paper_texture;

    return curve;
}

vec3 colorize (vec2 st, float mask, vec3 color_a, vec3 color_b) {
    vec3 colorized = mask * mix(color_a, color_b, paper_noise(st * 20., u_color_seed));
    return colorized + vec3(1. - mask);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv.y = 1. - uv.y;

    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;

    vec2 p0 = vec2(u_p0.x * u_resolution.x / u_resolution.y, u_p0.y);
    vec2 p1 = vec2(u_p1.x * u_resolution.x / u_resolution.y, u_p1.y);

    vec3 colorized = colorize(
        st, 
        wc_curve_mask(st, p0, p1),
        u_color_1,
        u_color_2
    );

    vec4 finalMix = vec4(colorized, 1.);

    if (u_count != 1) {
        finalMix = min(texture2D(u_tex, uv), finalMix);
    }

    gl_FragColor = finalMix;
}