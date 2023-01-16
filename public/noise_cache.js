class NoiseCache {
    constructor (step = 0.005, seedStep = 0, coef = 1) {
        this.step = step;
        this.percentilesCache = new Map();
        this.seedStep = seedStep;
        this.coef = coef;

        this.colorPercentiles = [];
        var step = 0.1;
        for (var i = 0; i <= 1; i += step) {
            this.colorPercentiles.push([
                this.getPercentile(i),
                this.getPercentile(i + step)
            ])
        }
    }

    get (x, y) {
        return noise(x * this.step + this.seedStep, y * this.step + this.seedStep) * this.coef;
    }

    getPercentile (percentile) {
        if (percentile > 1) {
            percentile = 1;
        } else if (percentile < 0) {
            percentile = 0;
        }
        var cached = this.percentilesCache.get(percentile);
        if (cached) {
            return cached;
        }
            
        var values = []
        var step = 10;
        for (var x = 0; x <= xBufferSize; x += step) {
            for (var y = 0; y <= yBufferSize; y += step) {
                values.push(this.get(x, y));
            }
        }
        values.sort(function (a, b) {
            return a - b;
        });

        var index = Math.floor((values.length - 1) * percentile);
        var val = values[index];
        this.percentilesCache.set(percentile, val);
        return val;
    }
}