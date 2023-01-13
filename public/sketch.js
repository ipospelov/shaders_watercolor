let theShader;

var buffer, buffer2;
var myCanvas;
var xBufferSize = 2000;
var ratio = 1.38;
var yBufferSize = xBufferSize * ratio;

function preload () {
  theShader = loadShader('shader.vert', 'shader.frag');
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

  buffer2 = createGraphics(xBufferSize, yBufferSize);
  buffer2.pixelDensity(1);
  buffer2.width = newW;
  buffer2.height = newH;

  myCanvas.style('display', 'block');

  noiseSeed(0);

  //buffer2.background(245, 239, 230);
  buffer2.clear();

  //drawFlow(xBufferSize / 2, yBufferSize / 2);

  frameRate(15);

  drawShader();
}

function perlin (x, y, step, seed) {
  // var value = 0.;
  // var amplitude = .5;
  
  // for (var i = 0; i < 3; i++) {
  //     value += amplitude * noise(x * step, y * step, seed);
  //     x *= 9.;
  //     y *= 9.;
  //     amplitude *= .2;
  // }
  // return value / 1;

  return noise(x * step, y * step, seed);
}

var n = 1;
var nCurr = 0;

var x = 100;
var y = 100;
var xStart = 100;
var yStart = 100;
var r = 500;

var isPaperDrawn = false;

function drawShader () {
  if (isPaperDrawn) {
    return;
  }

  buffer.shader(theShader);

  theShader.setUniform("u_resolution", [xBufferSize, yBufferSize]);
  theShader.setUniform("u_seed", 1.);
  theShader.setUniform("u_time", millis() / 1000.0);

  var col_noise = perlin(x, y, 0.01, 1.5);

  if (col_noise < 0.33) {
    theShader.setUniform("u_color_1", color1);
    theShader.setUniform("u_color_2", color2);
  } else if (col_noise < 0.66) {
    theShader.setUniform("u_color_1", color5);
    theShader.setUniform("u_color_2", color6);
  } else {
    theShader.setUniform("u_color_1", color9);
    theShader.setUniform("u_color_2", color10);
  }


  theShader.setUniform("u_color_3", color3);
  theShader.setUniform("u_color_4", color4);

  theShader.setUniform("u_color_5", color5);
  theShader.setUniform("u_color_6", color6);

  theShader.setUniform("u_color_7", color7);
  theShader.setUniform("u_color_8", color8);

  theShader.setUniform("u_color_9", color9);
  theShader.setUniform("u_color_10", color10);

  theShader.setUniform("u_tex", buffer);

  theShader.setUniform("u_count", frameCount);

  if (y >= yBufferSize) {
    theShader.setUniform("u_paper", true);
    isPaperDrawn = true;
  } else {
    theShader.setUniform("u_paper", false);
  }


  var noiseVal = perlin(x, y, 0.001, 0);
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
    yStart += 100;

    x = xStart;
    y = yStart;
  }

  buffer.rect(0, 0, xBufferSize, yBufferSize);
  image(buffer, 0, 0);
}

function draw () {  
  drawShader();
  image(buffer, 0, 0);
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

  buffer2.width = newW;
  buffer2.height = newH;

  image(buffer, 0, 0);
};

function keyTyped() {
  if (key === 's') {
      save(buffer, '1.png');
  }
};