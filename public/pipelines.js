class PipelinePainter {
    constructor (painters) {
        this.painter_objs = painters;
        this.n = 0;
    } 

    draw () {
        if (this.n >= this.painter_objs.length) {
            return;
        }

        if (!this.painter_objs[this.n].draw()) {
            this.n++;
        }
    }
}

function randomLinePoint (ang, h) {
    let len = xBufferSize / Math.cos(ang);
    let r = fxRandRanged(-len / 2, len / 2);
    let [x, y] = getDecart(r, ang);
    return [x + xBufferSize / 2, y + h];
}

function linePoint(ang, h, r) {
    let [x, y] = getDecart(r, ang);
    return [x + xBufferSize / 2, y + h];
}

function buildPipeline () {
    let ang = -Math.PI / 8;

    let w = xBufferSize * 0.7;
    let x = xBufferSize / 2 - w / 2;
    let h = yBufferSize * 0.7;
    let y = yBufferSize / 2 - h / 2;

    let pipeline = [
        // new FlowPainter(),
        new ContinuousLinePainter(palettes[1][1]),
        new WavePainter(
            1200, 1000, ang, 5, palettes[2], {
                "u_width": 0.4,
                "u_amplitude": 0.3,
                "u_frequency": 10.1,
                "u_fbm_frequency": 5,
                "u_fbm_amplitude": 0.55,
                "u_iters": 8,
            }),
        new WavePainter(
            1000, 1500, -ang + Math.PI / 5, 5, palettes[2], {
                "u_width": 0.4,
                "u_amplitude": 0.3,
                "u_frequency": 10.1,
                "u_fbm_frequency": 5,
                "u_fbm_amplitude": 0.55,
                "u_iters": 5,
            }),

        // new BlobsPainter(10),
        // new LinePainter(100, 500, xBufferSize - 100, 500, palettes[5][0], {
        //     "u_width": 0.004,
        //     "u_blur": 0.001,
        //     "u_amplitude": 0.1,
        //     "u_frequency": 7,
        //     "u_fbm_frequency": 1.5,
        //     "u_fbm_amplitude": 0.3,
        // }),
        // new LinePainter(100, 700, xBufferSize - 100, 700, palettes[6][1], {
        //     "u_width": 0.002,
        //     "u_blur": 0.001,
        //     "u_amplitude": 0.1,
        //     "u_frequency": 7,
        //     "u_fbm_frequency": 1.5,
        //     "u_fbm_amplitude": 0.3,
        // }),
        new PaperPainted(),
    ];
    
    return pipeline;
}