class StripePainter {
    constructor (x, y, ang, h, n, margin, colors, uniforms) {
        Object.assign(this, { x, y, ang, h, n, margin, colors, uniforms });
        this.nCurrent = 0;
        this.seed = fxrand();
    }

    getColor () {
        return this.colors;
    }

    draw () {
        if (this.nCurrent >= this.n) {
            return 0;
        }

        let r = this.nCurrent * this.margin;
        let [x0, y0] = getDecart(r, this.ang);
        x0 += this.x;
        y0 += this.y;

        let [x1, y1] = getDecart(this.h, this.ang + Math.PI / 2);
        x1 += x0;
        y1 += y0;

        let uniforms = {...this.uniforms, "u_seed": this.seed};
        drawCurve(x0, y0, x1, y1, ...this.getColor(), uniforms);

        this.nCurrent++;
        return 1;
    }
}