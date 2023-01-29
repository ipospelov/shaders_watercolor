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
    let h = yBufferSize / 2 - 800;
    let stripeShift = -1000;

    let w = 1200;
    let x = xBufferSize / 2 - w / 2;

    let pipeline = [
        // new LeafFlowerPainter(
        //     500, yBufferSize - 500,
        //     0, 360, 400, 15, 1, 6, palettes[1][0], {
        //         "u_width": 0.001,
        //         "u_amplitude": 0.7,
        //         "u_frequency": 1,
        //         "u_fbm_n": 3,
        //         "u_fbm_frequency": 2.5,
        //         "u_fbm_amplitude": 0.3,
        //     }),

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

        new LeafFlowerMarginPainter(
            1, yBufferSize,
            270, 360, 0, 800, 12, 7, palettes[0][4], {
                "u_width": 0.001,
                "u_amplitude": 0.4,
                "u_frequency": 1,
                "u_fbm_n": 3,
                "u_fbm_frequency": 2.5,
                "u_fbm_amplitude": 0.3,
                "u_blur": 0.0005
            }),
        new LeafFlowerMarginPainter(
            10, yBufferSize - 10,
            270, 360, 600, 450, 13, 5, palettes[0][2], {
                "u_width": 0.0015,
                "u_amplitude": 0.6,
                "u_frequency": 1,
                "u_fbm_n": 3,
                "u_fbm_frequency": 2.5,
                "u_fbm_amplitude": 0.3,
            }),
        new LeafFlowerMarginPainter(
            10, yBufferSize - 10,
            270, 360, 1000, 350, 23, 7, palettes[0][1], {
                "u_width": 0.0005,
                "u_amplitude": 0.6,
                "u_frequency": 1,
                "u_fbm_n": 3,
                "u_fbm_frequency": 2.5,
                "u_fbm_amplitude": 0.3,
            }),

        new LeafFlowerMarginPainter(
            10, yBufferSize - 10,
            270, 360, 1200, 250, 24, 7, palettes[0][0], {
                "u_width": 0.0005,
                "u_amplitude": 0.6,
                "u_frequency": 1,
                "u_fbm_n": 3,
                "u_fbm_frequency": 2.5,
                "u_fbm_amplitude": 0.3,
            }),
        
        //new CircledBlobsPainter(400, yBufferSize - 100, 50),

        // new ManyStripesPainter(x, 300, w, yBufferSize - 600, 5, palettes[0][3], {
        //     "u_amplitude": .5,
        //     "u_frequency": 50,
        //     "u_fbm_n": 3,
        //     "u_fbm_frequency": 2,
        //     "u_fbm_amplitude": 0.15,
        // }),

        // new LineStripePainter(
        //     ...linePoint(ang, h + 1150, stripeShift + 1300),
        //     ang + 3 * Math.PI / 2, 500, 100, 3, 3, 70, palettes[0][3], {
        //         "u_width": 0.004,
        //         "u_blur": 0.0005,
        //         "u_amplitude": .1,
        //         "u_frequency": 30,
        //         "u_fbm_n": 3,
        //         "u_fbm_frequency": 2,
        //         "u_fbm_amplitude": 0.15,
        //     }),


        new BlobsPainter(100),
        new PaperPainted(),
    ];
    
    return pipeline;
}