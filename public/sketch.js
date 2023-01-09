let theShader;

var buffer, buffer2;
var myCanvas;
var xBufferSize = 3000;
var ratio = 1.38;
var yBufferSize = xBufferSize * ratio;
var frameWidth = 100;
var windowEdgeSize;

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

function drawFlow (x, y) {
  var xBegin = x, yBegin = y;

  buffer2.noFill();
  buffer2.strokeWeight(2);
  buffer2.stroke(255);

  var r = 5;

  for (var j = 0; j < 30; j++) {
    var seed = j / 100;

    x = xBegin;
    y = yBegin;
    
    buffer.beginShape();
    for (var i = 0; i <= 200; i++) {
      buffer2.curveVertex(x, y);

      var noiseVal = perlin(x, y, 0.01, seed);
      var ang = map(noiseVal, 0, 1, 0, Math.PI * 2);

      x = x + r * Math.cos(ang);
      y = y + r * Math.sin(ang);
    }

    buffer2.endShape();
  }
}

function draw () {  
  //drawShader();
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