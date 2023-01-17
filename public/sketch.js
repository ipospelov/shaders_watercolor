let blobShader, curveShader, waveShader, paperShader;
var buffer;
var myCanvas;
var xBufferSize = 2000;
var ratio = 1.38;
var yBufferSize = xBufferSize * ratio;

function preload () {
  blobShader = loadShader('shaders/shader.vert', 'shaders/blob.frag');
  curveShader = loadShader('shaders/shader.vert', 'shaders/curve.frag');
  waveShader = loadShader('shaders/shader.vert', 'shaders/wave.frag');
  paperShader = loadShader('shaders/shader.vert', 'shaders/paper.frag');
}

let rectPainter;

function setup () {
  var newW, newH;
  if (windowHeight / windowWidth >= ratio) {
      newW = windowWidth;
      newH = windowWidth * ratio;
  } else {
      newW = windowHeight / ratio;
      newH = windowHeight;
  }

  myCanvas = createCanvas(newW, newH);
  myCanvas.id('mycanvas');

  buffer = createGraphics(xBufferSize, yBufferSize, WEBGL);
  buffer.pixelDensity(1);
  buffer.width = newW;
  buffer.height = newH;

  myCanvas.style('display', 'block');


  noiseSeed(0);

  frameRate(15);

  rectPainter = new RectanglePainter(100, 100, 1000, 2000);

  drawPaper();
}

function windowResized() {
  var newW, newH;
  if (windowHeight / windowWidth >= ratio) {
      newW = windowWidth;
      newH = windowWidth * ratio;
  } else {
      newW = windowHeight / ratio;
      newH = windowHeight;
  }

  resizeCanvas(newW, newH);
  buffer.width = newW;
  buffer.height = newH;

  image(buffer, 0, 0);
};

function drawBlob () {
  buffer.shader(blobShader);

  blobShader.setUniform("u_resolution", [xBufferSize, yBufferSize]);
  blobShader.setUniform("u_seed", 1.);
  blobShader.setUniform("u_time", millis() / 1000.0);

  blobShader.setUniform("u_color_1", color9);
  blobShader.setUniform("u_color_2", color10);

  blobShader.setUniform("u_tex", buffer);

  blobShader.setUniform("u_count", frameCount);  
  
  blobShader.setUniform("u_x0", x / xBufferSize);
  blobShader.setUniform("u_y0", y / yBufferSize);
  blobShader.setUniform("u_x1", xNext / xBufferSize);
  blobShader.setUniform("u_y1", yNext / yBufferSize);

  buffer.rect(0, 0, xBufferSize, yBufferSize);
  image(buffer, 0, 0);
}

function drawPaper () {
  buffer.shader(paperShader);

  paperShader.setUniform("u_resolution", [xBufferSize, yBufferSize]);
  paperShader.setUniform("u_bg_color", rgb(249, 251, 255));

  buffer.rect(0, 0, xBufferSize, yBufferSize);
  image(buffer, 0, 0);
}

function drawCurve (x0, y0, x1, y1) {
  buffer.shader(curveShader);

  curveShader.setUniform("u_resolution", [xBufferSize, yBufferSize]);
  curveShader.setUniform("u_seed", 0.7);
  curveShader.setUniform("u_time", millis() / 1000.0);
  curveShader.setUniform("u_tex", buffer);
  curveShader.setUniform("u_count", frameCount);

  curveShader.setUniform("u_color_1", color1);
  curveShader.setUniform("u_color_2", color2);

  curveShader.setUniform("u_width", 0.003);
  curveShader.setUniform("u_amplitude", 0.5);
  curveShader.setUniform("u_frequency", 20);

  curveShader.setUniform("u_p0", [x0 / xBufferSize, y0 / yBufferSize]);
  curveShader.setUniform("u_p1", [x1 / xBufferSize, y1 / yBufferSize]);

  buffer.rect(0, 0, xBufferSize, yBufferSize);
  image(buffer, 0, 0);
}

function drawWave (x0, y0, x1, y1) {
  buffer.shader(waveShader);

  waveShader.setUniform("u_resolution", [xBufferSize, yBufferSize]);
  waveShader.setUniform("u_seed", fxrand());
  waveShader.setUniform("u_time", millis() / 1000.0);
  waveShader.setUniform("u_tex", buffer);
  waveShader.setUniform("u_count", frameCount);

  waveShader.setUniform("u_width", 0.2);
  waveShader.setUniform("u_amplitude", 0.5);
  waveShader.setUniform("u_frequency", 10);
  waveShader.setUniform("u_fbm_frequency", 5);
  waveShader.setUniform("u_fbm_amplitude", 0.15);

  waveShader.setUniform("u_color_1", color1);
  waveShader.setUniform("u_color_2", color2);

  waveShader.setUniform("u_p0", [x0 / xBufferSize, y0 / yBufferSize]);
  waveShader.setUniform("u_p1", [x1 / xBufferSize, y1 / yBufferSize]);

  buffer.rect(0, 0, xBufferSize, yBufferSize);
  image(buffer, 0, 0);
}

function draw () {  
  rectPainter.draw();

  // if (frameCount > 7) {
  //   return;
  // }

  // var y = 500 + frameCount * 100;
  // drawWave(100, y, 1900, y);
}

function keyTyped() {
  if (key === 's') {
      save(buffer, '1.png');
  }
};