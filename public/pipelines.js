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

function buildPipeline () {
    let pipeline = [];

    let ang = Math.PI / 5;
    let h = yBufferSize / 2 - 500;
    pipeline.push(new WavePainter(h, 1000, ang, 5, palettes[0], {
        "u_amplitude": 0.1,
        "u_frequency": 1.1,
        "u_fbm_frequency": 5,
        "u_fbm_amplitude": 0.1,
    }));

    let [x, y] = randomLinePoint(ang, h);
    pipeline.push(new StripePainter(
        x, y, ang, 500, 5, 50, palettes[0][1], {
            "u_width": 0.003,
            "u_blur": 0.0005,
            "u_amplitude": 0.5,
            "u_frequency": 17,
            "u_fbm_n": 3,
            "u_fbm_frequency": 1.5,
            "u_fbm_amplitude": 0.5,
        }
    ))

    pipeline.push(new LeafFlowerPainter(
        ...randomLinePoint(ang, h),
        ang, ang + Math.PI,
        500, 7, 1, 5, palettes[0][0], {
            "u_amplitude": 0.3,
            "u_frequency": .1,
            "u_fbm_frequency": 2,
            "u_fbm_amplitude": 0.3,
            "u_width": 0.001,
            "u_blur": 0.0002
        }));
    pipeline.push(new PaperPainted());
 
    

    return pipeline;
}