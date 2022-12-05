precision mediump float;

#define PI 3.14159265359

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;


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

        if((ceil(t*uv.x)/t) == 1.0)
        {
            b = rnd(vec2(0.0, floor(t*uv.y)/t));
            d = rnd(vec2(0.0, ceil(t*uv.y)/t));
        }

        coef1 = fract(t*uv.x);
        coef2 = fract(t*uv.y);
        p += inter(inter(a,b,coef1), inter(c,d,coef1), coef2) * (1.0/pow(2.0,(i+0.6)));
        t *= 2.0;
    }
    return p;
}

vec3 bgColor = vec3(0.96, 0.94, 0.9);
vec3 colorA = vec3(0.611, 0.145, 0.302);
vec3 colorB = vec3(0.247, 0.0, 0.443);

vec3 colorC = vec3(255./255., 178./255., 0./255.);
vec3 colorD = vec3(255./255., 246./255., 191./255.);

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    float scale = 20.0;
    float scale2 = 3.;
    float r = length(st);

    float texture_noise = fract(snoise(st * 100.) * snoise(st * 1000.)) * 0.1;
    vec3 texture_mask = vec3(texture_noise);
    texture_mask = vec3(1.0) - texture_mask;

    float noise_val = perlin(st * scale2) + noise(st * scale);
    float holeVal = perlin(st * scale2) + noise(st * scale);
    
    vec3 color = vec3(smoothstep(0.6, 0.63, noise_val)); // Чёрные всплески
    color -= vec3(smoothstep(.6, 0.9, holeVal)) / 2.; // Отверстия во всплесках
    color *= 1.5;
    vec3 coloredBlot = color * mix(colorA, colorB, noise(st * 5.));

    color *= texture_mask;
    color *= texture_mask + vec3(0.1);
    color = vec3(1.0) - color;
    //color *= bgColor;

    vec3 color2 = vec3(smoothstep(.6, 1., noise_val)); // Чёрные всплески
    color2 -= vec3(smoothstep(.6, 1.9, holeVal)); // Отверстия во всплесках
    color2 /= 1.5;
    vec3 coloredBlot2 = color2 * mix(colorA, colorB, noise(st * 15.));

    color2 *= texture_mask + vec3(0.15);;
    color2 *= texture_mask + vec3(0.2);
    color2 = vec3(1.0) - color2;

    vec2 st2 = st + vec2(1.4, 1.2);
    // noise_val = perlin(st2 * scale2) + noise(st2 * scale);
    // vec3 color3 = vec3(smoothstep(0.6, 0.63, noise_val)); // Чёрные всплески
    // color3 -= vec3(smoothstep(.6, 0.9, noise_val)) / 2.; // Отверстия во всплесках
    // color3 *= 1.5;
    // vec3 coloredBlot3 = color3 * mix(colorC, colorD, noise(st * 15.));

    // color3 *= texture_mask;
    // color3 *= texture_mask + vec3(0.1);
    // color3 = vec3(1.0) - color3;

    vec3 mixedColor = coloredBlot + color;
    vec3 mixedColor2 = coloredBlot2 + color2;
    //vec3 mixedColor3 = coloredBlot3 + color3;

    texture_mask *= noise(st2 * 1012.);
    texture_mask /= 8.5;
    texture_mask = vec3(1.0) - texture_mask;
    
    vec3 bg = bgColor * texture_mask;

    //vec4 finalMix = vec4(mixedColor, 1.) * vec4(mixedColor2, 1.) * vec4(mixedColor3, 1.0) * vec4(bg, 1.);
    vec4 finalMix = vec4(mixedColor, 1.) * vec4(mixedColor2, 1.) * vec4(bg, 1.);

    //gl_FragColor = vec4(mixedColor2, 1.);
    gl_FragColor = finalMix;
}