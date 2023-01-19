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
	myCanvas.style('display', 'block');

	buffer = createGraphics(xBufferSize, yBufferSize, WEBGL);
	buffer.pixelDensity(1);
	buffer.width = newW;
	buffer.height = newH;

	noiseSeed(0);
	frameRate(15);

	pipelinePainter = new PipelinePainter([
		new WavePainter(1000, 1300, 2, [
			[color7, color8],
		]),
		new RectanglePainter(530, 200, 330, 1900),

		new WavePainter(600, 900, 2, [
			[color3, color4],
		], true),
		new RectanglePainter(880, 200, 330, 1900),

		new WavePainter(200, 500, 2, [
			[color5, color6],
		], true),
		new RectanglePainter(1230, 200, 330, 1900),

		// new WavePainter(0, 500, 1, [
		// 	[color7, color8]
		// ], true),
		// new WavePainter(0, 300, 2, [
		// 	[color7, color8],
        //     [color5, color6]
		// ]),
		//new BlobsPainter(50),
		new PaperPainted()
	]);


	//drawPaper();
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
};

function keyTyped() {
	if (key === 's') {
		save(buffer, 'watercolor.png');
	}
};