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

	noiseSeed(0);
	frameRate(15);

	let angleMargin = 1400;
	pipelinePainter = new PipelinePainter([
		//new CircledBlobsPainter(xBufferSize / 2 + 500, yBufferSize / 2, 150),
		new FlowerPainter(xBufferSize / 2 + 500, yBufferSize / 2, 0, Math.PI - Math.PI / 8, 700, 7, {
			"u_width": new RandParam([0.001, 0.0005]),
			"u_blur": new RandParam([0.01, 0.0005]),
			"u_color_1": palettes[0][4][0],
			"u_color_2": palettes[0][4][1],
		}),
		new FlowerPainter(xBufferSize / 2 + 500, yBufferSize / 2, Math.PI + Math.PI / 8, 2 * Math.PI, 700, 7, {
			"u_width": new RandParam([0.001, 0.0005]),
			"u_blur": new RandParam([0.01, 0.0005]),
			"u_color_1": palettes[0][4][0],
			"u_color_2": palettes[0][4][1],
		}),

		new FlowerPainter(xBufferSize / 2 + 500, yBufferSize / 2, Math.PI / 10, Math.PI + Math.PI / 10, 1200, 6, {
			"u_color_1": palettes[0][0][0],
			"u_color_2": palettes[0][0][1],
			"u_width": 0.002,
			"u_blur": 0.01,
			"u_amplitude": 0.5,
			"u_frequency": 50,
			"u_fbm_frequency": 1.3,
			"u_fbm_amplitude": 0.3,
		}),
		new FlowerPainter(xBufferSize / 2 + 500, yBufferSize / 2, Math.PI + Math.PI / 10, 2 * Math.PI + Math.PI / 10, 1200, 6, {
			"u_color_1": palettes[0][6][0],
			"u_color_2": palettes[0][6][1],
			"u_width": 0.002,
			"u_blur": 0.01,
			"u_amplitude": 0.5,
			"u_frequency": 50,
			"u_fbm_frequency": 1.3,
			"u_fbm_amplitude": 0.3,
		}),

		new WavePainter(900, 1200, 1, [
			palettes[0][0],
		], angleMargin),

		new WavePainter(500, 800, 1, [
			palettes[0][2],
		], angleMargin),

		new WavePainter(350, 650, 3, [
			palettes[0][3],
		], angleMargin),

		new WavePainter(-100, 200, 3, [
			palettes[0][4],
		], angleMargin),
		new WavePainter(-500, -200, 5, [
			palettes[0][5],
		], angleMargin),

		new BlobsPainter(100),
		new PaperPainted()
	]);
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