function drawPaper () {
    buffer.shader(paperShader);

    paperShader.setUniform("u_resolution", [xBufferSize, yBufferSize]);
    paperShader.setUniform("u_bg_color", rgb(249, 251, 255));

    buffer.rect(0, 0, xBufferSize, yBufferSize);
    image(buffer, 0, 0);
}

function drawBlob (x, y, colorA, colorB) {
    buffer.shader(blobShader);
  
    blobShader.setUniform("u_resolution", [xBufferSize, yBufferSize]);
    blobShader.setUniform("u_seed", fxrand());
    blobShader.setUniform("u_time", millis() / 1000.0);
  
    blobShader.setUniform("u_color_1", colorA);
    blobShader.setUniform("u_color_2", colorB);
  
    blobShader.setUniform("u_tex", buffer);
  
    blobShader.setUniform("u_count", frameCount);  
    
    blobShader.setUniform("u_p", [x / xBufferSize, y / yBufferSize]);
  
    buffer.rect(0, 0, xBufferSize, yBufferSize);
    image(buffer, 0, 0);
}
  
function drawCurve (x0, y0, x1, y1, colorA, colorB) {
    buffer.shader(curveShader);
  
    curveShader.setUniform("u_resolution", [xBufferSize, yBufferSize]);
    curveShader.setUniform("u_seed", 0.1);
    curveShader.setUniform("u_color_seed", fxrand());
    curveShader.setUniform("u_time", millis() / 1000.0);
    curveShader.setUniform("u_tex", buffer);
    curveShader.setUniform("u_count", frameCount);
  
    curveShader.setUniform("u_color_1", colorA);
    curveShader.setUniform("u_color_2", colorB);
  
    curveShader.setUniform("u_width", 0.003);
    curveShader.setUniform("u_amplitude", 0.5);
    
    curveShader.setUniform("u_frequency", 50);
  
    curveShader.setUniform("u_p0", [x0 / xBufferSize, y0 / yBufferSize]);
    curveShader.setUniform("u_p1", [x1 / xBufferSize, y1 / yBufferSize]);
  
    buffer.rect(0, 0, xBufferSize, yBufferSize);
    image(buffer, 0, 0);
}
  
function drawWave (x0, y0, x1, y1, colorA, colorB) {
    buffer.shader(waveShader);
  
    waveShader.setUniform("u_resolution", [xBufferSize, yBufferSize]);
    waveShader.setUniform("u_seed", fxrand());
    waveShader.setUniform("u_time", millis() / 1000.0);
    waveShader.setUniform("u_tex", buffer);
    waveShader.setUniform("u_count", frameCount);
  
    waveShader.setUniform("u_width", 0.2);
    waveShader.setUniform("u_amplitude", 0.3);
    waveShader.setUniform("u_frequency", 10.1);
    
    waveShader.setUniform("u_fbm_frequency", 20);
    waveShader.setUniform("u_fbm_amplitude", 0.05);
  
    waveShader.setUniform("u_color_1", colorA);
    waveShader.setUniform("u_color_2", colorB);
  
    waveShader.setUniform("u_p0", [x0 / xBufferSize, y0 / yBufferSize]);
    waveShader.setUniform("u_p1", [x1 / xBufferSize, y1 / yBufferSize]);
  
    buffer.rect(0, 0, xBufferSize, yBufferSize);
    image(buffer, 0, 0);
}