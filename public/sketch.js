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

let rectPainter, wavePainter, blobsPainter;

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

  rectPainter = new RectanglePainter(550, 200, 1000, 1900);
  wavePainter = new WavePainter(0, 1000, 3);
  blobsPainter = new BlobsPainter(50);

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

function draw () {
  if (wavePainter.draw()) {

  } else if (rectPainter.draw()) {

  } else if (blobsPainter.draw()) {

  }
  

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