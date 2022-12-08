let theShader;

var buffer;
var myCanvas;
var xBufferSize = 2000;
var ratio = 1.25;
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

  myCanvas.style('display', 'block');

  drawShader();
}

function drawShader () {
  //shader() sets the active shader with our shader
  buffer.shader(theShader);
  
  theShader.setUniform("u_resolution", [xBufferSize, yBufferSize]);

  // rect gives us some geometry on the screen
  buffer.rect(0, 0, xBufferSize, yBufferSize);
  image(buffer, 0, 0);
}

function draw () {  
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