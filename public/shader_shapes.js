function drawShader (shader, uniforms) {
    buffer.shader(shader);

    shader.setUniform("u_resolution", [xBufferSize, yBufferSize]);
    shader.setUniform("u_tex", buffer);
    shader.setUniform("u_count", frameCount);  
    shader.setUniform("u_time", millis() / 1000.0);

    for (let key in uniforms) {
        let val = uniforms[key];
        if (val instanceof RandParam) {
            val = val.get();
        }
        shader.setUniform(key, val);
    }

    buffer.rect(0, 0, xBufferSize, yBufferSize);
    image(buffer, 0, 0);
}

function drawPaper () {
    drawShader(paperShader, {
        "u_bg_color": rgb(249, 251, 255)
    })
}

function drawBlob (x, y, colorA, colorB, uniformsOverload = {}) {
    drawShader(blobShader, {
        "u_seed": fxrand(),
        "u_color_1": colorA,
        "u_color_2": colorB,
        "u_size": 0.5,
        "u_radius": 20,
        "u_noise_multiplier": 0.3,
        "u_p": [x / xBufferSize, y / yBufferSize],
        ...uniformsOverload
    });
}
  
function drawCurve (x0, y0, x1, y1, colorA, colorB, uniformsOverload = {}) {
    drawShader(curveShader, {
        "u_seed": 0.1,
        "u_color_seed": fxrand(),
        "u_color_1": colorA,
        "u_color_2": colorB,
        "u_width": 0.001,
        "u_blur": 0.0005, // 0.05 - 0.0005
        "u_amplitude": 0.5,
        "u_frequency": 7,
        "u_fbm_n": 3,
        "u_fbm_frequency": 1.5,
        "u_fbm_amplitude": 0.3,
        "u_p0": [x0 / xBufferSize, y0 / yBufferSize],
        "u_p1": [x1 / xBufferSize, y1 / yBufferSize],
        ...uniformsOverload
    });
}
  
function drawWave (x0, y0, x1, y1, colorA, colorB, uniformsOverload = {}) {
    drawShader(waveShader, {
        "u_seed": fxrand(),
        "u_color_1": colorA,
        "u_color_2": colorB,
        "u_width": 0.5,
        "u_amplitude": 0.3,
        "u_frequency": 10.1,
        "u_fbm_frequency": 5,
        "u_fbm_amplitude": 0.5,
        "u_iters": 7,
        "u_overlay": false,
        "u_p0": [x0 / xBufferSize, y0 / yBufferSize],
        "u_p1": [x1 / xBufferSize, y1 / yBufferSize],
        ...uniformsOverload
    });
}