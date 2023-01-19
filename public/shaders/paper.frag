precision mediump float;

varying vec2 vTexCoord;

uniform sampler2D u_tex;

uniform vec2 u_resolution;
uniform int u_count;

uniform vec3 u_bg_color;

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
    return e-w;
}

float paper (vec2 st, float intensity) {
    return 0.95 + intensity * grad(st * 3000.);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv.y = 1.0 - uv.y;

    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;

    float paper_texture = paper(st, .8);
    vec3 paper_colored = mix(u_bg_color, vec3(paper_texture), vec3(0.5));

    vec4 finalMix = vec4(paper_colored, 1.);

    if (u_count != 1) {
        finalMix = texture2D(u_tex, uv) * finalMix;
    }

    gl_FragColor = finalMix;
}