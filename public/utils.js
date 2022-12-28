function fxRandRanged (minV, maxV) {
    var maxVal = Math.max(minV, maxV);
    var minVal = Math.min(minV, maxV);
    
    let diff = maxVal - minVal;
    return fxrand() * diff + minVal;
}
function randomInt(minV, maxV) {
    let diff = maxV - minV + 1;
    return Math.floor(fxrand() * 0.9999 * diff + minV);
}
function randomFromRange(range) {
    return range[randomInt(0, range.length - 1)];
}

function normAngle(angle) {
    return angle / 180 * Math.PI;
}

function rgb(r, g, b) {
    return [r / 255, g / 255, b / 255];
}

var color1 = rgb(255, 229, 241);
var color2 = rgb(255, 234, 17);

var color3 = rgb(235, 69, 95);
var color4 = rgb(255, 191, 0);

var color5 = rgb(225, 77, 42);
var color6 = rgb(156, 44, 119);

var color7 = rgb(255, 191, 0);
var color8 = rgb(255, 234, 17);

var color9 = rgb(225, 77, 42);
var color10 = rgb(156, 44, 119);


function drawShader () {
  buffer.shader(theShader);

  theShader.setUniform("u_tex", buffer2);
  
  theShader.setUniform("u_resolution", [xBufferSize, yBufferSize]);
  theShader.setUniform("u_seed", 1.);

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