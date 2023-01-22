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
		new RectanglePainter(470, 500, 330, 1900, [
			[hexColor('#CFB1B7'), hexColor('#C19AA2')]
		], {"u_blur": 0.03}),

		new WavePainter(900, 1200, 1, [
			[hexColor('#CEC4D4'), hexColor('#CEC4D4')],
		], -angleMargin, {"u_overlay": true}),

		new RectanglePainter(700, 200, 330, 1900, [
			[hexColor('#355070'), hexColor('#355070')]
		]),

		new RectanglePainter(1400, 1000, 330, 1000, [
			[hexColor('#D7CCC1'), hexColor('#D7CCC1')]
		], {"u_blur": 0.05}),

		new WavePainter(500, 800, 1, [
			[hexColor('#CFB1B7'), hexColor('#CFB1B7')],
		], angleMargin, {"u_overlay": true}),

		new WavePainter(350, 650, 1, [
			[hexColor('#ACC0D8'), hexColor('#ACC0D8')],
		], -400, {"u_overlay": true}),

		new RectanglePainter(1200, 300, 330, 1900, [
			[hexColor('#402633'), hexColor('#BA8CA4')]
		]),

		new RectanglePainter(600, 0, 200, 1300, [
			[hexColor('#6D597A'), hexColor('#6D597A')]
		], {"u_blur": 0.05}),
		// new RectanglePainter(1050, 50, 300, 700, [
		// 	[hexColor('#4C2F34'), hexColor('#4C2F34')]
		// ], {"u_blur": 0.005}),


		new WavePainter(-100, 200, 1, [
			[hexColor('#6D597A'), hexColor('#663D52')],
		], angleMargin, {"u_overlay": true}),

		new BlobsPainter(100),
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