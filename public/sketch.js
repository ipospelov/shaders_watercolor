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

var color1 = rgb(192, 222, 255);
var color2 = rgb(130, 195, 236);

var color3 = rgb(13, 76, 146);
var color4 = rgb(89, 193, 189);

var color5 = rgb(230, 226, 195);
var color6 = rgb(252, 249, 190);

var color7 = rgb(255, 225, 225);
var color8 = rgb(222, 182, 171);

var color9 = rgb(134, 171, 161);
var color10 = rgb(223, 243, 227);


function drawShader () {
  buffer.shader(theShader);
  
  theShader.setUniform("u_resolution", [xBufferSize, yBufferSize]);
  theShader.setUniform("u_rand", fxrand());

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