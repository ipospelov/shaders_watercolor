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
    let ang = -Math.PI / 4;
    let h = yBufferSize / 2 - 800;
    let stripeShift = -1000;

    let pipeline = [
        new WavePainter(
            h, 1700, ang, 6, palettes[0], {
                "u_width": 0.3,
                "u_amplitude": 0.3,
                "u_frequency": 20.1,
                "u_fbm_frequency": 2,
                "u_fbm_amplitude": 0.05,
                "u_overlay": false,
                "u_iters": 5,
            }),

        new LineStripePainter(
            ...linePoint(ang, h + 350, stripeShift),
            ang, 500, 100, 4, 5, 70, palettes[0][2], {
                "u_width": 0.004,
                "u_blur": 0.0005,
                "u_amplitude": .2,
                "u_frequency": 50,
                "u_fbm_n": 5,
                "u_fbm_frequency": 2,
                "u_fbm_amplitude": 0.2,
            }),
        new LineStripePainter(
            ...linePoint(ang, h + 780, stripeShift + 700),
            ang + 3 * Math.PI / 2, 150, 100, 10, 7, 50, palettes[0][4], {
                "u_width": 0.003,
                "u_blur": 0.0005,
                "u_amplitude": .5,
                "u_frequency": 50,
                "u_fbm_n": 3,
                "u_fbm_frequency": 2,
                "u_fbm_amplitude": 0.15,
            }),
        new LineStripePainter(
            ...linePoint(ang, h + 920, stripeShift + 820),
            ang, 300, 100, 4, 5, 50, palettes[0][0], {
                "u_width": 0.003,
                "u_blur": 0.0005,
                "u_amplitude": .5,
                "u_frequency": 30,
                "u_fbm_n": 3,
                "u_fbm_frequency": 2,
                "u_fbm_amplitude": 0.15,
            }),
        new LineStripePainter(
            ...linePoint(ang, h + 1150, stripeShift + 1300),
            ang + 3 * Math.PI / 2, 500, 100, 3, 3, 70, palettes[0][3], {
                "u_width": 0.004,
                "u_blur": 0.0005,
                "u_amplitude": .1,
                "u_frequency": 30,
                "u_fbm_n": 3,
                "u_fbm_frequency": 2,
                "u_fbm_amplitude": 0.15,
            }),
        // new LineStripePainter(
        //     ...linePoint(ang, h - 1000, -200),
        //     ang, 500, 100, 5, 5, 20, palettes[0][1], {
        //         "u_width": 0.001,
        //         "u_blur": 0.0005,
        //         "u_amplitude": .5,
        //         "u_frequency": 30,
        //         "u_fbm_n": 3,
        //         "u_fbm_frequency": 2,
        //         "u_fbm_amplitude": 0.15,
        //     }),

        // new LeafFlowerPainter(
        //     ...linePoint(ang, h, 500),
        //     ang, ang + Math.PI,
        //     700, 10, 1, 5, palettes[0][5], {
        //         "u_amplitude": 0.5,
        //         "u_frequency": 50,
        //         "u_fbm_frequency": 1.3,
        //         "u_fbm_amplitude": .3,
        //         "u_width": 0.003,
        //         "u_blur": 0.002
        //     }),
        new BlobsPainter(100),
        new PaperPainted(),
    ];
    
    return pipeline;
}