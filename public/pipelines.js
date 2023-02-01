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
        //new ManyLeafOnLinePainter(),
        //new LeafOnIsolinePainter(),
        //new RectFlowPainter(),
        new RectFlowPainter(300, yBufferSize - 300, xBufferSize - 300, 500, 8, palettes[0][1], {
            "u_width": 0.001,
            "u_amplitude": 0.5,
            "u_frequency": 1.5,
            "u_fbm_n": 3,
            "u_fbm_frequency": 1.5,
            "u_fbm_amplitude": 0.3,
        }),

        new WavePainter(
            1200, 1000, ang, 5, palettes[0], {
                "u_width": 0.4,
                "u_amplitude": 0.3,
                "u_frequency": 10.1,
                "u_fbm_frequency": 5,
                "u_fbm_amplitude": 0.55,
                "u_iters": 8,
            }),
        new WavePainter(
            1000, 1500, -ang + Math.PI / 5, 5, palettes[0], {
                "u_width": 0.4,
                "u_amplitude": 0.3,
                "u_frequency": 10.1,
                "u_fbm_frequency": 5,
                "u_fbm_amplitude": 0.55,
                "u_iters": 5,
            }),
        new BlobsPainter(100),
        new PaperPainted(),
    ];
    
    return pipeline;
}