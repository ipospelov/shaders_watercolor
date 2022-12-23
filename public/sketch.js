let theShader;

var buffer;
var myCanvas;
var xBufferSize = 3000;
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

var color1 = rgb(153, 0, 0);
var color2 = rgb(178, 80, 104);

var color3 = rgb(255, 191, 0);
var color4 = rgb(133, 0, 0);

var color5 = rgb(229, 186, 115);
var color6 = rgb(255, 230, 154);

var color7 = rgb(254, 194, 96);
var color8 = rgb(235, 69, 95);

var color9 = rgb(225, 77, 42);
var color10 = rgb(156, 44, 119);


function drawShader () {
  buffer.shader(theShader);
  
  theShader.setUniform("u_resolution", [xBufferSize, yBufferSize]);
  theShader.setUniform("u_seed", fxrand());

  theShader.setUniform("u_color_1", color1);
  theShader.setUniform("u_color_2", color2);

  theShader.setUniform("u_color_3", color3);
  theShader.setUniform("u_color_4", color4);

  theShader.setUniform("u_color_5", color5);
  theShader.setUniform("u_color_6", color6);

  theShader.setUniform("u_color_7", color7);
  theShader.setUniform("u_color_8", color8);

  theShader.setUniform("u_color_9", color9);
  theShader.setUniform("u_color_10", color10);

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