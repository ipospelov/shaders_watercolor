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
        for (var x = 0; x < xBufferSize; x += step) {
            for (var y = 0; y < yBufferSize; y += step) {
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



class Scene {
    constructor () {
        this.flowNoise = new NoiseCache(...brushStyles[brushStyle1]);
        this.flowNoise2 = new NoiseCache(...brushStyles[brushStyle2]);

        // this.flowNoise = new NoiseCache(...[0.0009, 0, 640]);
        // this.flowNoise2 = new NoiseCache(...[0.009, 0, 30]);
        
        var circleStep = 0.005;
        this.circleNoise = new NoiseCache(circleStep);
        this.delimeterNoise = new NoiseCache(circleStep);

        this.noiseByArea = {
            0: this.flowNoise,
            1: this.circleNoise,
            2: this.flowNoise2,
            3: this.circleNoise,
        }
        this.styleByArea = {
            0: "flow",
            1: "circle",
            2: "flow",
            3: "circle",
        }

        this.colorByIsRiver = {
            true: {
                0: true,
                1: true,
                2: false,
                3: false,
            },
            false: {
                0: false,
                1: false,
                2: true,
                3: true
            }
        };

        this.defaultArea = 0;

        this.delimeterPercentiles = delimeterPercentiles[delIndex];
    }

    static toString () {
        return "Default scene";
    }

    setDefaultArea (area) {
        this.defaultArea = area;
    }

    isInFrame (x, y) {
        var xOut = x <= frameWidth || x >= xBufferSize - frameWidth;
        var yOut = y <= frameWidth || y >= yBufferSize - frameWidth;

        if (xOut || yOut) {
            return true;
        }
        return false;
    }

    isLeftArea (area) {
        return this.defaultArea !== area
    }

    getPointStyle (x, y) {
        var area = this.getAreaSuper(x, y);
        var noiseGenerator = this.noiseByArea[area];
        var noiseVal = noiseGenerator.get(x, y);
        
        var inFrame = this.isInFrame(x, y);

        if (!inFrame) {
            var color = this.getColor(noiseVal * 1.5, area, noiseGenerator);
        } else {
            var color = [0, 0, 0];
        }
        
 
        return {
            "area": area,
            "noise": noiseVal,
            "color": color,
            "style": this.styleByArea[area]
        }
    }

    getHeight (x, y, area) {
        var noiseGenerator = this.noiseByArea[area];
        return noiseGenerator.get(x, y);
    }

    getArea (x, y) {
        return this.getAreaByDelimeter(x, y);
    }

    getAreaSuper (x, y) {
        var area = this.getArea(x, y);
        // var inFrame = this.isInFrame(x, y);

        // if (inFrame) {
        //     return (area + 1) % 4;
        // }
        return area;
    }

    getAreaByDelimeter (x, y) {
        var h1 = this.delimeterNoise.get(x, y);
        var del = 0;
        for (var perc of this.delimeterPercentiles) {
            var v1 = perc[0];
            var v2 = perc[1];
            if (h1 < this.delimeterNoise.getPercentile(v2) & h1 > this.delimeterNoise.getPercentile(v1)) {
                del = 1;
            }
        }

        return del;
    }

    getColor (height, area, noiseGenerator) {
        var riverPercentiles = [0.15, 0.35];
        var isRiver = false;
        var p1, p2;

        p1 = noiseGenerator.getPercentile(riverPercentiles[0]);
        p2 = noiseGenerator.getPercentile(riverPercentiles[1]);
        if (height >= p1 & height <= p2) {
            isRiver = true;
        }

        var isReverted = this.colorByIsRiver[isRiver][area];

        return this.mixColors(isReverted, height, noiseGenerator);
    }

    mixColors (isInverted, height, noiseGenerator) {
        if (isInverted) {
            return multipleMixColors(palette[0], palette[1], height, noiseGenerator);
        } else {
            return multipleMixColors(palette[2], palette[3], height, noiseGenerator);
        }
    }
}


class SinScene extends Scene {
    constructor () {
        super();

        this.delCoef = fxRandRanged(80, 120);
    }

    static toString () {
        return "Low frequency waves scene";
    }

    getArea (x, y) {
        var ang = -Math.PI / 4;
        var xn = x * Math.cos(ang) - y * Math.sin(ang);
        var yn = x * Math.sin(ang) + y * Math.cos(ang);

        var sinDel = sin(xn / this.delCoef) * xn < yn;
        var isFlow = this.getAreaByDelimeter(x, y);

        if (sinDel) {
            return isFlow;
        }
        return isFlow + 2;
    }
}

class HighFrequencySinScene extends SinScene {
    constructor () {
        super();

        this.delCoef = fxRandRanged(20, 50);
    }

    static toString () {
        return "High frequency waves scene";
    }
}

class HorizontalScene extends Scene {
    constructor () {
        super();

        this.nLines = fxRandRanged(4, 20);
        this.margin = Math.floor(yBufferSize / this.nLines);
    }

    static toString () {
        return "Simple stripes scene";
    }

    getArea (x, y) {
        var isFlow = this.getAreaByDelimeter(x, y);

        return (Math.floor(Math.max(y, 0) / this.margin) + isFlow) % 4;
    }
}

class ManySpiralScene extends Scene {
    constructor () {
        super();

        this.xCenter = fxRandRanged(0, 500);
        this.yCenter = fxRandRanged(-500, 500);
        this.rStep = fxRandRanged(250, 450);
    }

    static toString () {
        return "Spirals scene 1";
    }

    getArea (x, y) {
        var isFlow = this.getAreaByDelimeter(x, y);

        var xc = x - xBufferSize / 2 - this.xCenter;
        var yc = y - yBufferSize / 2 - this.yCenter;
        var r = Math.sqrt(xc ** 2 + yc ** 2);

        var axc = Math.abs(xc);
        var ayc = Math.abs(yc);
        var ang;        
        if (xc >=0 & yc >= 0) {
            ang = Math.atan(ayc / axc);
        } else if (yc >= 0 & xc < 0) {
            ang = Math.atan(axc / ayc) + Math.PI / 2;
        } else if (xc < 0 & yc < 0) {
            ang = Math.atan(ayc / axc) + Math.PI;
        } else {
            ang = Math.atan(axc / ayc) + 3 * Math.PI / 2;
        }
        
        var spiralWidth = 150;
        var angCoef = (ang + 2) / (2 * Math.PI);
        for (var i = this.rStep; i < yBufferSize * 2; i += this.rStep) {
            if (r > i * angCoef & r < (i + spiralWidth) * angCoef) {
                return isFlow + 2;
            }
        }

        return isFlow;
    }
}

class SnailSpiralScene extends Scene {
    constructor () {
        super();

        this.xCenter = fxRandRanged(-500, 500);
        this.yCenter = fxRandRanged(-500, 500);
        this.rStep = fxRandRanged(100, 400);
    }

    static toString () {
        return "Spirals scene 2";
    }

    getArea (x, y) {
        var isFlow = this.getAreaByDelimeter(x, y);

        var xc = x - xBufferSize / 2 - this.xCenter;
        var yc = y - yBufferSize / 2 - this.yCenter;
        var r = Math.sqrt(xc ** 2 + yc ** 2);

        var axc = Math.abs(xc);
        var ayc = Math.abs(yc);
        var ang;        
        if (xc >=0 & yc >= 0) {
            ang = Math.atan(ayc / axc);
        } else if (yc >= 0 & xc < 0) {
            ang = Math.atan(axc / ayc) + Math.PI / 2;
        } else if (xc < 0 & yc < 0) {
            ang = Math.atan(ayc / axc) + Math.PI;
        } else {
            ang = Math.atan(axc / ayc) + 3 * Math.PI / 2;
        }
        
        var spiralWidth = 250;
        var angCoef = (ang) / (2 * Math.PI);
        for (var i = this.rStep; i < yBufferSize * 2; i += this.rStep) {
            var r1 = i * angCoef + i;
            var r2 = (i + spiralWidth) * angCoef + i;
            if (r > r1 & r < r2) {
                return isFlow + 2;
            }
        }

        return isFlow;
    }
}

class ExtraSpiralScene extends Scene {
    constructor () {
        super();

        this.xCenter = fxRandRanged(-500, 500);
        this.yCenter = fxRandRanged(-500, 500);
        this.rStep = fxRandRanged(200, 400);
        this.spiralWidth = fxRandRanged(100, 120);
    }

    static toString () {
        return "Spirals scene 3";
    }

    getArea (x, y) {
        var isFlow = this.getAreaByDelimeter(x, y);

        var xc = x - xBufferSize / 2 - this.xCenter;
        var yc = y - yBufferSize / 2 - this.yCenter;
        var r = Math.sqrt(xc ** 2 + yc ** 2);

        var axc = Math.abs(xc);
        var ayc = Math.abs(yc);
        var ang;        
        if (xc >=0 & yc >= 0) {
            ang = Math.atan(ayc / axc);
        } else if (yc >= 0 & xc < 0) {
            ang = Math.atan(axc / ayc) + Math.PI / 2;
        } else if (xc < 0 & yc < 0) {
            ang = Math.atan(ayc / axc) + Math.PI;
        } else {
            ang = Math.atan(axc / ayc) + 3 * Math.PI / 2;
        }
        
        var angCoef = (ang) / (2 * Math.PI);
        for (var i = this.rStep; i < yBufferSize * 2; i += this.rStep) {
            var r1 = i * angCoef + i * Math.abs(Math.sin(i));
            var r2 = (i + this.spiralWidth) * angCoef + i * Math.abs(Math.sin(i));
            if (r > r1 & r < r2) {
                return isFlow + 2;
            }
        }

        return isFlow;
    }
}

class FlowDelimiterScene extends Scene {
    constructor () {
        super();

        this.flowDel = new NoiseCache(0.00005);
        this.percentiles = [
            [0.1, 0.2],
            [0.3, 0.5],
            [0.7, 0.9],
        ]
        this.flowBorderWidth = 0.01;
    }

    static toString () {
        return "Flow scene 1";
    }

    getArea (x, y) {
        var isFlow = this.getAreaByDelimeter(x, y);

        var h = this.flowDel.get(x, y);

        for (var perc of this.percentiles) {
            var v1 = perc[0];
            var v2 = perc[1];
            if (h < this.flowDel.getPercentile(v2) & h >= this.flowDel.getPercentile(v1)) {
                return isFlow;
            }
        }

        return isFlow + 2;
    }
}

class FlowDelimiterScene2 extends FlowDelimiterScene {
    constructor () {
        super();

        this.flowDel = new NoiseCache(0.00009);
        this.percentiles = [
            [0.1, 0.25],
            [0.35, 0.5],
            [0.6, 0.75],
            [0.85, 1],
        ]
    }

    static toString () {
        return "Flow scene 2";
    }
}

class DoubleFlowDelimiterScene extends FlowDelimiterScene {
    constructor () {
        super();

        this.flowDel = new NoiseCache(0.00009);
        this.flowDel2 = new NoiseCache(0.00009, 155);
        this.percentiles = [
            [0.1, 0.25],
            [0.35, 0.5],
            [0.6, 0.75],
            [0.85, 1],
        ]
    }

    static toString () {
        return "Double flow scene";
    }

    getArea (x, y) {
        var isFlow = this.getAreaByDelimeter(x, y);

        var h = this.flowDel.get(x, y);
        var h2 = this.flowDel2.get(x, y);

        var acc = 0;

        for (var perc of this.percentiles) {
            var v1 = perc[0];
            var v2 = perc[1];
            if (h < this.flowDel.getPercentile(v2) & h >= this.flowDel.getPercentile(v1)) {
                acc += 1;
                break;
            }
        }
        for (var perc of this.percentiles) {
            var v1 = perc[0];
            var v2 = perc[1];
            if (h2 < this.flowDel2.getPercentile(v2) & h2 >= this.flowDel2.getPercentile(v1)) {
                acc += 1;
                break;
            }
        }

        return isFlow + acc;
    }
}

class ExtraFlowDelimiterScene extends FlowDelimiterScene {
    constructor () {
        super();

        this.noises = [];
        for (var i = 0; i < 5; i++) {
            this.noises.push(new NoiseCache(0.000009, fxRandRanged(0, 1000)));
        }
        this.percentiles = [
            [0.0, 0.4],
            [0.7, 1],
        ]
    }

    static toString () {
        return "Flow scene 3";
    }

    getArea (x, y) {
        var isFlow = this.getAreaByDelimeter(x, y);
        var acc = 0;

        for (var noiseMap of this.noises) {
            var h = noiseMap.get(x, y);
            for (var perc of this.percentiles) {
                var v1 = perc[0];
                var v2 = perc[1];
                if (h < noiseMap.getPercentile(v2) & h >= noiseMap.getPercentile(v1)) {
                    acc += 1;
                    break;
                }
            }
        }

        return (isFlow + acc) % 4;
    }
}

class ExtraNoiseCache extends NoiseCache {
    get (x, y) {
        return noise(
            x * this.step + this.seedStep,
            y * x * this.step + this.seedStep,
        );
    }
}

class FlowDelimiterScene3 extends FlowDelimiterScene {
    constructor () {
        super();

        this.flowDel = new ExtraNoiseCache(0.00000005);
        this.percentiles = [
            [0.1, 0.25],
            [0.35, 0.5],
            [0.6, 0.75],
            [0.85, 1],
        ]
    }

    static toString () {
        return "Flow scene 4";
    }
}


class RevertNoiseCache extends NoiseCache {
    get (x, y) {
        return noise(y * this.step + this.seedStep, x * this.step + this.seedStep) * this.coef;
    }
}
class FlowDelimiterScene4 extends DoubleFlowDelimiterScene {
    constructor () {
        super();

        this.flowDel = new NoiseCache(0.000009);
        this.flowDel2 = new RevertNoiseCache(0.000009);
        this.percentiles = [
            [0.1, 0.2],
            [0.3, 0.4],
            [0.6, 0.7],
            [0.9, 1],
        ]
        this.percentiles2 = [
            [0.2, 0.3],
            [0.5, 0.6],
            [0.7, 0.9],
        ]
    }

    getArea (x, y) {
        var isFlow = this.getAreaByDelimeter(x, y);

        var h = this.flowDel.get(x, y);
        var h2 = this.flowDel2.get(x, y);

        var acc = 0;

        for (var perc of this.percentiles) {
            var v1 = perc[0];
            var v2 = perc[1];
            if (h < this.flowDel.getPercentile(v2) & h >= this.flowDel.getPercentile(v1)) {
                acc += 1;
                break;
            }
        }
        for (var perc of this.percentiles2) {
            var v1 = perc[0];
            var v2 = perc[1];
            if (h2 < this.flowDel2.getPercentile(v2) & h2 >= this.flowDel2.getPercentile(v1)) {
                acc += 1;
                break;
            }
        }

        return isFlow + acc;
    }

    static toString () {
        return "Flow scene 5";
    }
}