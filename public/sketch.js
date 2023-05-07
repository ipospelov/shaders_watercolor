let blobShader, curveShader, waveShader, paperShader;

var buffer;
var myCanvas;

var xBufferSize = 2000;
var ratio = 1.38;
var yBufferSize = xBufferSize * ratio;

let pipelinePainter;

function preload () {
	blobShader = loadShader('shaders/shader.vert', 'shaders/blob.frag');
  	curveShader = loadShader('shaders/shader.vert', 'shaders/curve.frag');
	waveShader = loadShader('shaders/shader.vert', 'shaders/wave.frag');
  	paperShader = loadShader('shaders/shader.vert', 'shaders/paper.frag');
};

function setup () {
	var w, h;
	if (windowHeight / windowWidth >= ratio) {
		w = windowWidth;
		h = windowWidth * ratio;
	} else {
		w = windowHeight / ratio;
		h = windowHeight;
	}

	myCanvas = createCanvas(w, h);
	myCanvas.id('mycanvas');
	myCanvas.style('display', 'block');

	buffer = createBuffer(w, h);

	//noiseSeed(0);
	//frameRate(15);

	pipelinePainter = new PipelinePainter(
		buildPipeline()
	);
	buffer.background(255);
};

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
	pipelinePainter.draw();
	// drawBlob(100, 100, palettes[4][0], palettes[4][1], {
	// 	"u_size": 0.3
	// });
	
};

function keyTyped() {
	if (key === 's') {
		save(buffer, 'watercolor.png');
	}
};