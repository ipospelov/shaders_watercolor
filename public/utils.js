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

// var color1 = rgb(16, 161, 157);
// var color2 = rgb(85, 132, 172);

// var color3 = rgb(250, 255, 175);
// var color4 = rgb(0, 85, 85);

// var color5 = rgb(136, 164, 124);
// var color6 = rgb(255, 191, 0);

// var color7 = rgb(255, 191, 0);
// var color8 = rgb(255, 234, 17);

// var color9 = rgb(225, 77, 42);
// var color10 = rgb(156, 44, 119);


var color1 = rgb(121, 2, 82);
var color2 = rgb(255, 186, 186);

var color3 = rgb(59, 24, 95);
var color4 = rgb(20, 66, 114);

var color5 = rgb(59, 24, 95);
var color6 = rgb(192, 96, 161);

var color7 = rgb(255, 191, 0);
var color8 = rgb(59, 24, 95);

var color9 = rgb(123, 40, 105);
var color10 = rgb(130, 195, 236);



function drawShader () {
  buffer.shader(theShader);

  theShader.setUniform("u_tex", buffer2);
  
  theShader.setUniform("u_resolution", [xBufferSize, yBufferSize]);
  theShader.setUniform("u_seed", 1.);
  theShader.setUniform("u_time", millis() / 1000.0);

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