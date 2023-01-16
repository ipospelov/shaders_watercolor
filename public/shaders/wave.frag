float fbm2(vec2 p2, float p, float amplitude) {
    float value = .0;
    
    for (int i = 0; i < 3; i++) {
        value += amplitude * noise1(p2, p);
        p2 *= 2.;
        amplitude *= .15;
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

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv.y = 1.0 - uv.y;

    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;

    float seed = 0.00001 * float(u_count / 2) + u_seed;

    vec3 blobs = vec3(1.);

    vec3 mask = vec3(wc_blob_mask(st, vec2(0.4, 0.8), .5, 0.8, seed));
    
    vec3 mixedColor = colored_blob(
        st, 
        mask,
        u_color_1,
        u_color_2,
        seed
    );
    blobs = min(blobs, mixedColor);

    float paper_texture = paper(st, .8);
    float blobs_avg = (blobs.x + blobs.y + blobs.z) / 3.; 
    vec3 paper_colored = mix(bg_color_light, vec3(paper_texture), vec3(0.5));

    vec4 finalMix = vec4(blobs, 1.) * vec4(paper_colored, 1.);

    if (u_count != 0) {
        finalMix = min(texture2D(u_tex, uv), finalMix);
    }

    if (u_paper) {
        finalMix = finalMix * vec4(paper_colored, 1.);
    }

    gl_FragColor = finalMix;
}