let blobShader, curveShader, waveShader, paperShader;

var buffer, localBuffer;
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
	localBuffer = createBuffer(w, h);

	noiseSeed(0);
	frameRate(15);

	let angleMargin = 400;
	pipelinePainter = new PipelinePainter([
		//new FlowPainter(),

		new WavePainter(900, 1200, 1, [
			[hexColor('#B57D94'), hexColor('#F4B67C')],
		], -angleMargin),
		new RectanglePainter(470, 200, 330, 1900, [
			[hexColor('#0A2647'), hexColor('#5584AC')]
		]),

		new WavePainter(600, 900, 1, [
			[hexColor('#3D314A'), hexColor('#5584AC')],
		], angleMargin, true),
		new RectanglePainter(1290, 200, 330, 1900, [
			[hexColor('#0A2647'), hexColor('#5584AC')]
		]),

		new WavePainter(300, 600, 1, [
			[hexColor('#3D314A'), hexColor('#B57D94')],
		], -200, true),
		new RectanglePainter(880, 200, 330, 1900, [
			[hexColor('#955670'), hexColor('#73163E')]
		]),


		new WavePainter(-100, 200, 1, [
			[hexColor('#0A2647'), hexColor('#3D314A')],
		], angleMargin, true),

		new BlobsPainter(50),
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