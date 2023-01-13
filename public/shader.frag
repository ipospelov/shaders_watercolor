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

uniform vec3 u_color_3;
uniform vec3 u_color_4;

uniform vec3 u_color_5;
uniform vec3 u_color_6;

uniform vec3 u_color_7;
uniform vec3 u_color_8;

uniform vec3 u_color_9;
uniform vec3 u_color_10;

uniform float u_x0, u_y0;
uniform float u_x1, u_y1;

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

float noise1(vec2 p2, float p) {
    vec2 i = floor(p2);
    vec2 f = fract(p2);
	vec2 u = f * f * (3.0 - 2.0 * f);
    return 1.0 - 2.0 * mix(mix(hash1(i + vec2(0.0, 0.0), p), 
                               hash1(i + vec2(1.0, 0.0), p), u.x),
                           mix(hash1(i + vec2(0.0, 1.0), p), 
                               hash1(i + vec2(1.0, 1.0), p), u.x), u.y);
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

float fbm2(vec2 p2, float p, float amplitude) {
    float value = .0;
    
    for (int i = 0; i < 3; i++) {
        value += amplitude * noise1(p2, p);
        p2 *= 2.;
        amplitude *= .15;
    }
    return value / 1.;
}

vec2 grad (vec2 p) {
    float n = fbm(p + vec2(0., 1.));
    float e = fbm(p + vec2(1., 0.));
    float s = fbm(p - vec2(0., 1.));
    float w = fbm(p - vec2(1., 0.));
    return vec2(e-w, n-s);
}

float paper (vec2 st, float intensity) {
    return .95 + intensity * grad(st * 3000.).x;
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

    vec3 paper_texture = vec3(paper(st - 1., 1.));

    return (color + color2) * paper_texture;
}

vec3 colored_blob (vec2 st, vec3 mask, vec3 color_a, vec3 color_b, float seed) {
    // both * 10000. and * 10. are good
    vec3 coloredBlot = mask * mix(color_a, color_b, paper_noise(st * 20., seed));
    //vec3 coloredBlot = mask * mix(color_a, color_b, clamp(fbm1(st * 20., seed), 0., 1.));
    
    mask = vec3(1.0) - mask;
    

    return coloredBlot + mask;
}

vec3 generate_random_blobs(vec2 st, float size, float rm_min, float rm_max, float seed, vec3 color1, vec3 color2) {
    vec3 blobs = vec3(1.);
    for (float i = 1.; i < 15.; i += 1.) {
        float x = rnd(vec2(i + u_seed + seed)) * 0.8 - 0.4;
        float y = rnd(vec2(i * i + u_seed + seed)) * 0.8 - 0.4;

        float r_multiplier = map(rnd(vec2(i / u_seed + seed)), 0., 1., rm_min, rm_max);

        vec3 blob_mask = wc_blob_mask(st, vec2(x, y), size, r_multiplier, i);
        vec3 mixedColor = colored_blob(st, blob_mask, color1, color2, 0.);
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

    float paper_texture = paper(st - 1., 1.);
    splash *= paper_texture;

    //splash += splash2;

    return splash;
}

float plot(vec2 st, float pct, float tier0, float tier1){
  return  smoothstep(pct - tier0, pct, st.y) -
          smoothstep(pct, pct + tier1, st.y);
}

float line_by_points(vec2 st, vec2 p0, vec2 p1) {
    return (p0.y - p1.y) * (st.x - p1.x) / (p0.x - p1.x) + p1.y;
}

vec3 wc_curve_mask (vec2 st, float seed, vec2 p0, vec2 p1, float enthropy, float amplitude, float width) {
    vec2 p1_deviation = vec2(fbm2(st * enthropy, seed, amplitude), fbm2(st * enthropy, seed * 1.5, amplitude));
    p1_deviation *= distance(st, p1);
    vec2 p1_new = p1 + p1_deviation;

    vec2 p0_deviation = vec2(fbm2(st * enthropy, seed + 1.5, amplitude), fbm2(st * enthropy, seed * 2.5, amplitude));
    p0_deviation *= distance(st, p0);
    vec2 p0_new = p0 + p0_deviation;

    float y = line_by_points(st, p1_new, p0_new);

    vec3 mask = vec3(plot(st, y, width, 0.));
    
    vec2 st2 = st + vec2(seed);

    mask *= perlin(st * 1. + seed) * 1.2;

    float noise_scale = 0.001;
    float l = .3 * length(vec2(perlin(st2 * noise_scale - 1.0), perlin(st2 * noise_scale + 1.0)));
    mask *= vec3(perlin(vec2(perlin(st2 * l)))) * 1.2;

    mask += vec3(plot(st, y, 0.01, 0.)) / 2.;

    float paper_texture = paper(st2 - 1., 1.);
    mask *= paper_texture;

    return mask;
}

vec3 generate_lines (vec2 st, float seed, vec2 p0, vec2 p1,
                    vec3 color1, vec3 color2,
                    float enthropy, float amplitude, float width) {
    vec3 blobs = vec3(1.);
    for (float i = 0.; i < 10.; i += 1.) {
        vec3 mixedColor = colored_blob(
            st, 
            wc_curve_mask(st, i + u_seed + seed, p0, p1, enthropy, amplitude, width),
            color1,
            color2,
            u_seed
        );
        blobs = min(mixedColor, blobs);
    }
    return blobs;
}

float distance_to_line(vec2 line_p0, vec2 line_p1, vec2 p) {
    vec2 direction = line_p0 - line_p1;
    float line_len = pow(length(direction), 2.);
    float leg_len = dot(line_p0 - p, direction) / line_len;

    float t = max(0., min(1., leg_len));
    vec2 projection = line_p0 + t * (line_p1 - line_p0);

    return distance(p, projection);
}

float curve_mask(vec2 st, vec2 start_p, vec2 end_p, float amplitude, float enthropy, float seed) {
    vec2 start_deviation = vec2(fbm2(st * enthropy, seed, amplitude), fbm2(st * enthropy, seed * 1.5, amplitude));
    start_deviation *= distance(st, start_p);
    start_p += start_deviation;

    vec2 end_deviation = vec2(fbm2(st * enthropy, seed + 1.5, amplitude), fbm2(st * enthropy, seed * 2.5, amplitude));
    end_deviation *= distance(st, end_p);
    end_p += end_deviation;

    float mask = distance_to_line(start_p, end_p, st);
    
    return mask;
}

float many_curves_mask(vec2 st, vec2 start_p, vec2 end_p, float amplitude, float enthropy, float seed) {
    float mask = 1.;
    for (float i = 0.; i < 15.; i++) {
        mask = min(mask, curve_mask(st, start_p, end_p, amplitude, enthropy, seed + i));
    }
    return mask;
}

float wc_curve_mask(vec2 st, vec2 start_p, vec2 end_p, float width, float amplitude, float enthropy, float seed) {
    float curve_mask = curve_mask(st, start_p, end_p, amplitude, enthropy, seed);
    curve_mask *= clamp(perlin(st * 5. + seed), 0.5, 1.);

    float hole_delta = 0.005;
    float low_tier = width;
    float high_tier = width + 0.0005;

    float higt_tier_deviation = 0.01;
    high_tier = abs(noise1(st * 10., seed)) * higt_tier_deviation + high_tier;

    float curve = 1. - smoothstep(low_tier, high_tier, curve_mask);
    float hole = 1. - smoothstep(high_tier - hole_delta, high_tier, curve_mask);

    curve = (curve - hole / 1.5) + curve;

    //st += seed;

    vec2 st2 = st + noise1(vec2(seed), seed);

    curve *= clamp(perlin(st2 * 1.) * 1.2, 0.5, 1.);

    float noise_scale = 0.001;
    float l = .3 * length(vec2(perlin(st2 * noise_scale - 1.0), perlin(st2 * noise_scale + 1.0)));
    curve *= clamp(perlin(vec2(perlin(st2 * l))) * 1.2, 0.5, 1.);

    float paper_texture = paper(st2 - 1., 1.);
    curve *= paper_texture;

    return curve;
}

float many_wc_curve_mask(
    vec2 st, vec2 start_p, vec2 end_p,
    float width, float amplitude, float enthropy, float n,
    float seed
    ) {
     float mask = 0.;
     for (float i = 0.; i < 10.; i++) {
        if (i >= n) {
            break;
        }
        
        mask = max(mask, wc_curve_mask(st, start_p, end_p, width, amplitude, enthropy, seed + i));
     }
     return mask;
 }

vec3 bulbs_line(
    vec2 st, 
    vec2 start_p, vec2 end_p, 
    float seed, vec3 color1, vec3 color2
    ) {
    vec2 prev_p = start_p;
    vec2 direction = normalize(end_p - start_p);
    float len = length(end_p - start_p);
    float step_len = 0.05;

    vec3 result = vec3(1.);

    for (float i = 0.; i < 4.; i++) {
        float curr_len = len * 0.5;
        len -= curr_len + step_len;
        
        vec2 next_p = prev_p + curr_len * direction;

        vec3 mixedColor = colored_blob(
            st, 
            vec3(many_wc_curve_mask(st, prev_p, next_p, 0.001, 0.6, 2.1, 10., seed + i)),
            color1,
            color2,
            i + seed 
        );
        result = min(result, mixedColor);

        prev_p = next_p + step_len * direction;
    }
    return result;
}

vec3 circled_lines(
    vec2 st,
    vec2 start_p, vec2 end_p,
    float ang_range, float n,
    float seed) {
    vec2 direction = end_p - start_p;
    float r = length(direction) / 2.;
    vec2 center = start_p + r * normalize(direction);

    vec2 end_p_norm = end_p - center;
    float ang = atan(end_p_norm.y, end_p_norm.x);

    vec3 blobs = vec3(1.);

    float ang_shift = ang_range / max(n - 1., 1.);
    for (float i = 0.; i < 10.; i++) {
        if (i >= n) {
            break;
        }

        float curr_ang = ang + ang_shift * i - ang_range / 2.;

        vec2 curr_end_p = vec2(r * cos(curr_ang), r * sin(curr_ang)) + center;
        blobs = min(blobs, bulbs_line(st, start_p, curr_end_p, seed + i, u_color_7, u_color_8));
    }
    return blobs;
}

vec3 simple_lines(
    vec2 st, 
    vec2 start_p, vec2 end_p, 
    float seed
    ) {
    vec2 direction = normalize(end_p - start_p);
    float len = length(end_p - start_p);

    float shift = rnd(vec2(seed)) * 0.3 + 0.2;
    vec2 prev_p = start_p + len * shift * direction;

    float step_len = 0.05;

    vec3 result = vec3(1.);

    for (float i = 0.; i < 4.; i++) {
        float curr_len = len * 0.2;
        len -= curr_len + step_len;
        
        vec2 next_p = prev_p + curr_len * direction;

        float col_rnd = rnd(vec2(seed + i));
        vec3 col1 = u_color_1;
        vec3 col2 = u_color_2;

        if (col_rnd < 0.33) {
            col1 = u_color_3;
            col2 = u_color_4;
        } else if (col_rnd < 0.66) {
            col1 = u_color_9;
            col2 = u_color_10;
        }

        vec3 mixedColor = colored_blob(
            st, 
            vec3(wc_curve_mask(st, prev_p, next_p, 0.006, 0.7, 13.1, seed + i)),
            col1,
            col2,
            i + seed 
        );
        result = min(result, mixedColor);

        prev_p = next_p + step_len * direction;
    }
    return result;
}

vec3 simple_circled_lines(
    vec2 st,
    vec2 start_p, vec2 end_p,
    float ang_range, float n,
    float seed
) {
    vec2 direction = end_p - start_p;
    float r = length(direction) / 2.;
    vec2 center = start_p + r * normalize(direction);

    vec2 end_p_norm = end_p - center;
    float ang = atan(end_p_norm.y, end_p_norm.x);

    vec3 blobs = vec3(1.);

    float ang_shift = ang_range / max(n - 1., 1.);
    for (float i = 0.; i < 10.; i++) {
        if (i >= n) {
            break;
        }

        float curr_ang = ang + ang_shift * i - ang_range / 2.;
        vec2 curr_end_p = vec2(r * cos(curr_ang), r * sin(curr_ang)) + center;
        blobs = min(blobs, simple_lines(st, start_p, curr_end_p, seed + i));
    }
    return blobs;
}

vec3 flower(vec2 st, vec2 center, float r, float seed) {
    vec3 blobs = vec3(1.);

    const float n = 6.;
    float ang_shift = 2. * PI / n;
    for (float i = 0.; i < n; i++) {
        float curr_ang = ang_shift + i;

        vec2 end_p = vec2(r * cos(curr_ang), r * sin(curr_ang)) + center;
        vec3 mask = vec3(many_wc_curve_mask(st, center, end_p, 0.001, 0.5, 2.1, 5., seed + i));
        vec3 mixedColor = colored_blob(
            st, 
            mask,
            u_color_1,
            u_color_2,
            seed
        );
        blobs = min(blobs, mixedColor);
    }
    return blobs;
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv.y = 1.0 - uv.y;

    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;

    float seed = 0.00001 * float(u_count / 2) + u_seed;

    vec3 blobs = vec3(1.);

    vec3 mask = vec3(wc_curve_mask(st, vec2(u_x0, u_y0), vec2(u_x1, u_y1), 0.003, 0.7, 13.1, seed));
    //vec3 mask = vec3(wc_curve_mask(st, vec2(0.1, 0.8), vec2(0.65, 0.1), 0.004, 0.5, 3.1, seed));
    vec3 mixedColor = colored_blob(
        st, 
        mask,
        u_color_1,
        u_color_2,
        seed
    );
    blobs = min(blobs, mixedColor);


    float paper_texture = paper(st, .8);
    vec3 paper_colored = mix(bg_color_light, vec3(paper_texture), vec3(0.5));
    vec4 finalMix = vec4(blobs, 1.); // * vec4(paper_colored, 1.);

    if (u_count != 0) {
        finalMix = min(texture2D(u_tex, uv), finalMix);
    }

    if (u_paper) {
        finalMix = finalMix * vec4(paper_colored, 1.);
    }

    gl_FragColor = finalMix;
}