let theShader, curveShader;

var buffer, buffer2;
var myCanvas;
var xBufferSize = 2000;
var ratio = 1.38;
var yBufferSize = xBufferSize * ratio;

var noise1;

function preload () {
  theShader = loadShader('shaders/shader.vert', 'shaders/blob.frag');
  curveShader = loadShader('shaders/shader.vert', 'shaders/curve.frag');
}

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

  noise1 = new NoiseCache(0.001, 123);

  noiseSeed(0);

  frameRate(15);

  //drawShader();

  drawCurve(100, yBufferSize - 100, 1900, 100);
}

function perlin (x, y, step, seed) {
  return noise(x * step, y * step, seed);
}

var n = 5;
var nCurr = 0;

var x = 100;
var y = 100;
var xStart = 100;
var yStart = 100;
var r = 100;

var isPaperDrawn = false;

function drawShader () {
  if (isPaperDrawn) {
    return;
  }

  buffer.shader(theShader);

  theShader.setUniform("u_resolution", [xBufferSize, yBufferSize]);
  theShader.setUniform("u_seed", 1.);
  theShader.setUniform("u_time", millis() / 1000.0);

  var col_noise = noise1.get(x, y);

  theShader.setUniform("u_color_1", color9);
  theShader.setUniform("u_color_2", color10);

  theShader.setUniform("u_tex", buffer);

  theShader.setUniform("u_count", frameCount);

  if (yStart >= yBufferSize) {
    theShader.setUniform("u_paper", true);
    isPaperDrawn = true;
  } else {
    theShader.setUniform("u_paper", false);
  }



  var noiseVal = perlin(x, y, 0.001, 2);
  
  var ang = map(noiseVal, 0, 1, 0, Math.PI * 2);

  var xNext = x + r * Math.cos(ang);
  var yNext = y + r * Math.sin(ang);
  
  theShader.setUniform("u_x0", x / xBufferSize);
  theShader.setUniform("u_y0", y / yBufferSize);
  theShader.setUniform("u_x1", xNext / xBufferSize);
  theShader.setUniform("u_y1", yNext / yBufferSize);

  x = xNext;
  y = yNext;

  nCurr++;

  if (nCurr >= n) {
    xStart += 100;
    x = xStart;
    y = yStart;
    nCurr = 0;
  }

  if (xStart >= xBufferSize) {
    xStart = 100;
    yStart += 120;

    x = xStart;
    y = yStart;
  }

  buffer.rect(0, 0, xBufferSize, yBufferSize);
  image(buffer, 0, 0);
}

function drawCurve (x0, y0, x1, y1) {
  buffer.shader(curveShader);

  curveShader.setUniform("u_resolution", [xBufferSize, yBufferSize]);
  curveShader.setUniform("u_seed", 0.8);
  curveShader.setUniform("u_time", millis() / 1000.0);
  curveShader.setUniform("u_tex", buffer);
  curveShader.setUniform("u_count", frameCount);

  curveShader.setUniform("u_color_1", color1);
  curveShader.setUniform("u_color_2", color2);

  curveShader.setUniform("u_width", 0.005);
  curveShader.setUniform("u_amplitude", 0.2);
  curveShader.setUniform("u_frequency", 15);

  curveShader.setUniform("u_p0", [x0 / xBufferSize, y0 / yBufferSize]);
  curveShader.setUniform("u_p1", [x1 / xBufferSize, y1 / yBufferSize]);

  buffer.rect(0, 0, xBufferSize, yBufferSize);
  image(buffer, 0, 0);
}

function draw () {  
  //drawShader();

  // var noise = perlin(1, 1, 0.01, frameCount * 0.01);
  //drawCurve(100, yBufferSize - 100, 1900, 100);
  //image(buffer, 0, 0);
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

function keyTyped() {
  if (key === 's') {
      save(buffer, '1.png');
  }
};