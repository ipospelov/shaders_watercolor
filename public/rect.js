class RectanglePainter {
    constructor (x, y, width, height) {
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;

        this.currentX = x;
        this.currentY = y;
    }

    draw () {
        if (this.currentX >= this.width) {
            return 0;
        }

        let stepLen = 500 + fxRandRanged(-50, 50);
        let yMargin = 100 + fxRandRanged(-30, 30);
        let xMargin = 50;

        let nextY = this.currentY + stepLen;
        drawCurve(this.currentX, this.currentY, this.currentX, nextY);

        this.currentY = nextY + yMargin;
        if (this.currentY >= this.height) {
            this.currentY = this.y;
            this.currentX += xMargin;
        }
        return 1;
    }
}