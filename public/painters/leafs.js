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
            this.nCurrent++;
            return 1;
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
        let angStep = (ang1 - ang0) / max(1, nPetals - 1);
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

class LeafFlowPainter extends NestedPainter {
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