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
        
        this.painters.push(
            new LinePainter(x, y0, x, y1, colors, uniforms)
        );

        let lineLen = Math.abs(y0 - y1);
        let h = fxRandRanged(0.1 * lineLen, 0.3 * lineLen);
        this.painters.push(
            new LeafPainter(x, y1, x, y1 - h, 17, colors, uniforms)
        );
    }
}

class ManyLeafOnLinePainter extends NestedPainter {
    constructor (x, y0, y1, xBias, yBias, n, uniforms) {
        super();
        
        for (let i = 0; i < n; i++) {
            let xl = x + symmetricalRand(xBias);
            let yl = y1 + symmetricalRand(yBias);

            let colors = randomFromRange(palettes[0]);

            let painter = new LeafOnLinePainter(xl, y0, yl, colors, uniforms);
            this.painters.push(painter);
        }
    }
}