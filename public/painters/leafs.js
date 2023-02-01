class LeafPainter {
    constructor (x0, y0, x1, y1, n, colors, uniforms) {
        Object.assign(this, { x0, y0, x1, y1, n, colors, uniforms });
        this.nCurrent = 0;
    }

    draw () {
        if (this.nCurrent >= this.n) {
            return 0;
        }
        if (outOfScene(this.x0, this.y0) & outOfScene(this.x1, this.y1)) {
            // this.nCurrent++;
            return 0;
        }

        let [c1, c2] = this.colors;
        let uniforms = {...this.uniforms, "u_seed": fxrand()};
        drawCurve(this.x0, this.y0, this.x1, this.y1, c1, c2, uniforms);
        this.nCurrent++;

        return 1;
    }
}

class LeafLinePainter extends NestedPainter {
    constructor (x, y, r, ang, nLeafs, nLines, colors, uniforms) {
        super();
        let xPrev = x, yPrev = y;
        let [xPolar, yPolar] = getDecart(r, ang);
        for (let i = 0; i < nLeafs; i++) {
            let xNext = xPrev + xPolar;
            let yNext = yPrev + yPolar;
            let painter = new LeafPainter(xPrev, yPrev, xNext, yNext, nLines, colors, uniforms);
            this.painters.push(painter);

            xPrev = xNext;
            yPrev = yNext;
        }
    }
}

class LeafFlowerPainter extends NestedPainter {
    constructor (x, y, ang0, ang1, r, nPetals, nLeafs, nLines, colors, uniforms = {}) {
        super();
        ang0 = degreeToRadian(ang0);
        ang1 = degreeToRadian(ang1);
        let angStep = (ang1 - ang0) / max(1, nPetals);
        for (let i = 0; i < nPetals; i++) {
            let ang = ang0 + angStep * i;
            let painter = new LeafLinePainter(
                x=x, y=y, r=r, ang=ang, nLeafs=nLeafs, nLines=nLines,
                colors=colors, uniforms=uniforms
                );
            this.painters.push(painter);
        }
    }
}

class LeafFlowerMarginPainter extends NestedPainter {
    constructor (x, y, ang0, ang1, rMargin, petalLen, nPetals, nLines, colors, uniforms = {}) {
        super();
        ang0 = degreeToRadian(ang0);
        ang1 = degreeToRadian(ang1);
        let angStep = (ang1 - ang0) / max(1, nPetals);

        for (let i = 0; i < nPetals; i++) {
            let rl = rMargin + fxRandRanged(-rMargin * 0.3, rMargin * 0.3);
            let lenl = petalLen + fxRandRanged(-petalLen * 0.3, petalLen * 0.3);
            let ang = ang0 + angStep * i;
            let [x0, y0] = getDecart(rl, ang);
            let [x1, y1] = getDecart(rl + lenl, ang);

            x0 += x;
            y0 += y;
            x1 += x;
            y1 += y;
            
            let painter = new LeafPainter(x0, y0, x1, y1, nLines, colors, uniforms);
            this.painters.push(painter);
        }
    }
}

class LeafOnLinePainter extends NestedPainter {
    constructor (x, y0, y1, colors, uniforms) {
        super();

        let c = 0.0009;

        let ang = -Math.PI / 2;
        if (fxrand() < 0.8) {
            ang = map(noise(x * c, y1 * c), 0, 1, 0, 2 * Math.PI);
        } 
        
        let width = fxRandRanged(0.0001, 0.001);
        let localUniforms = {...uniforms, "u_width": width}
        this.painters.push(
            new LinePainter(x, y0, x, y1, colors, localUniforms)
        );

        let lineLen = Math.abs(y0 - y1);
        let h = map(noise(x * c, y1 * c) , 0, 1, 50, 500); 

        let [xl, yl] = getDecart(h, ang);
        xl += x;
        yl += y1;

        this.painters.push(
            new LeafPainter(x, y1, xl, yl, 5, colors, localUniforms)
        );
    }
}

class ManyLeafOnLinePainter extends NestedPainter {
    constructor () {
        super();

        let x = xBufferSize / 2 + symmetricalRand((xBufferSize / 2) * 0.3);
        let xBias = fxRandRanged(300, 500);
        let yBias = fxRandRanged(300, 800);
        let n = fxRandRanged(5, 30);

        let y0 = randomFromRange([0, yBufferSize]);
        let y1 = yBufferSize - 900;

        let uniforms = {
            "u_width": 0.001,
            "u_amplitude": 0.5,
            "u_frequency": 1.5,
            "u_fbm_n": 3,
            "u_fbm_frequency": 1.5,
            "u_fbm_amplitude": 0.3,
        }
        
        for (let i = 0; i < n; i++) {
            let xl = x + symmetricalRand(xBias);
            let yl = y1 + symmetricalRand(yBias);

            let colors = randomFromRange(palettes[0]);

            let painter = new LeafOnLinePainter(xl, y0, yl, colors, uniforms);
            this.painters.push(painter);
        }
    }
}

class LeafOnIsolinePainter extends NestedPainter {
    constructor () {
        super();

        let uniforms = {
            "u_width": 0.001,
            "u_amplitude": 0.5,
            "u_frequency": 1.5,
            "u_fbm_n": 3,
            "u_fbm_frequency": 1.5,
            "u_fbm_amplitude": 0.3,
        }

        let xInit = 1200;
        let Yinit = yBufferSize - 1000;
        let direction = -30;

        for (let k = 0; k < 500; k += 100) {
            for (let j = 0; j < 100; j += 100) {
                let ang = direction;
                let x = xInit + k;
                let y = Yinit + j;
                let color = randomFromRange(palettes[0]);
                for (let i = 0; i < 5; i++) {
                    let leafLen = map(noise(x * 0.05, y * 0.05), 0, 1, 100, 350);

                    let [xNext, yNext, nextAng] = getIsolineNextPoint(x, y, leafLen, ang);
                    
                    let painter = new LeafPainter(x, y, xNext, yNext, 5, color, uniforms);
                    this.painters.push(painter);

                    ang = nextAng;
                    let [xNext2, yNext2, nextAng2] = getIsolineNextPoint(xNext, yNext, 100, ang);
        
                    x = xNext2;
                    y = yNext2;
                    ang = nextAng2;
                }
            }
        }
    }
}

class RectFlowPainter extends NestedPainter {
    constructor (x, y, x2, y2, level, colors, uniforms) {
        super();

        if (level == 0) {
            colors = randomFromRange(palettes[0]);
            this.painters.push(
                new LeafPainter(x, y, x2, y2, 10, colors, uniforms)
            );
            this.painters.push(
                new LinePainter(x, y, x, 0, colors, uniforms)
            );
            return;
        }

        if (fxrand() < 0.1) {
            return;
        }

        if (fxrand() < 0.5) {
            let xLen = Math.abs(x2 - x);
            let xd = 0.5 * xLen + symmetricalRand(0.1 * xLen);
            this.painters.push(
                new RectFlowPainter(x, y, x + xd, y2, level - 1, colors, uniforms)
            );
            this.painters.push(
                new RectFlowPainter(xd + x, y, x2, y2, level - 1, colors, uniforms)
            );
        } else {
            let yLen = Math.abs(y2 - y);
            let yd = 0.5 * yLen + symmetricalRand(0.1 * yLen);
            this.painters.push(
                new RectFlowPainter(x, y, x2, y - yd, level - 1, colors, uniforms)
            );
            this.painters.push(
                new RectFlowPainter(x, y - yd, x2, y2, level - 1, colors, uniforms)
            );
        }

    }
}