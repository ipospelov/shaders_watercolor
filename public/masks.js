class NoiseCache {
    constructor (step = 0.005, seedStep = 0, coef = 1, colorStep = 0.05) {
        this.step = step;
        this.percentilesCache = new Map();
        this.seedStep = seedStep;
        this.coef = coef;

        this.colorPercentiles = [];
        var step = colorStep;
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
        var step = 20;
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
        this.flowNoise2 = new NoiseCache(...brushStyles2[brushStyle2]);

        this.colorNoise = new NoiseCache(0.001, 1231);
        this.colorNoise2 = new NoiseCache(0.001, 1231, 1, 0.2);

        // this.flowNoise = new NoiseCache(...[0.0009, 0, 640]);
        // this.flowNoise2 = new NoiseCache(...[0.009, 0, 30]);
        
        var circleStep = 0.008;
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
        var area = this.getArea(x, y);
        var noiseGenerator = this.noiseByArea[area];
        var noiseVal = noiseGenerator.get(x, y);
        
        //var inFrame = this.isInFrame(x, y);

        
        //if (!inFrame) {

        //var color = this.getColor(noiseVal, area, noiseGenerator);

        if (area < 2) {
            var colorHeight = this.colorNoise.get(x, y);
            var color = this.getColor(colorHeight, area, this.colorNoise);
        } else {
            var colorHeight = this.colorNoise2.get(x, y);
            var color = this.getColor(colorHeight, area, this.colorNoise2);
        }
        

        // } else {
        //     var color = [0, 0, 0];
        // }
        
 
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

        // p1 = noiseGenerator.getPercentile(riverPercentiles[0]);
        // p2 = noiseGenerator.getPercentile(riverPercentiles[1]);
        // if (height >= p1 & height <= p2) {
        //     isRiver = true;
        // }

        var isReverted = this.colorByIsRiver[isRiver][area];

        return this.mixColors(isReverted, height, noiseGenerator);
    }

    mixColors (isInverted, height, noiseGenerator) {
        if (palette.length == 1) {
            localPalette = palette[0];
        } else {
            var localPalette = palette[currIter % 2];
        }
        
        if (isInverted) {
            return multipleMixColors(localPalette[0], localPalette[1], height, noiseGenerator);
        } else {
            return multipleMixColors(localPalette[2], localPalette[3], height, noiseGenerator);
        }
    }
}

class ExtraFlowDelimiterScene extends Scene {
    constructor () {
        super();

        this.noises = [];
        for (var i = 0; i < 20; i++) {
            this.noises.push(new NoiseCache(0.001, fxRandRanged(-10000, 10000)));
        }
        this.percentiles = [
            // [0.0, 0.3],
            // [0.6, 1],
//            [0.1, 0.2],
            [0.45, 0.55],
            [0.56, 0.57],
            
        ]

        this.percentilesMargin = 0.001;
    }

    static toString () {
        return "Flow scene 3";
    }

    getHeights (x, y) {
        return this.noises.map((getter) => getter.get(x, y));
    }

    getFlowMarginNoise (x, y) {
        var heights = this.getHeights(x, y);

        var borderPercentiles = [];
        for (var perc of this.percentiles) {
            for (var pval of perc) {
                borderPercentiles.push(
                    [pval - this.percentilesMargin, pval + this.percentilesMargin]
                );
            }
        }
        
        var acc = 0;
        for (var percentile of borderPercentiles) {
            var vMin = percentile[0];
            var vMax = percentile[1];

            for (var i = 0; i < heights.length; i++) {
                var h = heights[i];
                var getter = this.noises[i];
                if (h < getter.getPercentile(vMax) & h >= getter.getPercentile(vMin)) {
                    acc++;
                    return getter;
                }
            }
            acc = 0;
        }
        return;
    }

    getIndex (x, y) {
        var acc = this.getAreaByDelimeter(x, y);

        for (var noiseMap of this.noises) {
            var h = noiseMap.get(x, y);
            for (var perc of this.percentiles) {
                var v1 = perc[0];
                var v2 = perc[1];
                if (h < noiseMap.getPercentile(v2) & h >= noiseMap.getPercentile(v1)) {
                    acc += 1;
                }
            }
        }
        return acc;
    }

    getFillColor (x, y) {
        //var index = 1;//this.getIndex(x, y);
        //var paletteLength = palette[0].length;
        //var colorIndex = index % paletteLength;
        //var intensity = index / paletteLength - Math.floor(index / paletteLength);

        var area = this.getArea(x, y);
        var noiseGenerator = this.noiseByArea[area];

        return this.getColor(1, area, noiseGenerator);
    }

    getArea (x, y) {
        var isFlow = this.getAreaByDelimeter(x, y) + 0; // + 3
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

class Line {
    constructor (phi, x0, y0) {
        this.k = Math.tan(phi);
        this.x0 = x0;
        this.y0 = y0;
    }

    isGreater (x, y) {
        var xn = x - xBufferSize / 2;
        var yn = y - yBufferSize / 2;
        if (yn - this.y0 > this.k * (xn - this.x0)) {
            return 0;
        }
        return 1;
    }
}
class SimpleLinesDelimeter extends ExtraFlowDelimiterScene {
    constructor () {
        super();
        this.lines = [];


        for (var i = 0; i < 20; i++) {
            var orbitR = 100;
            var orbitAng = fxRandRanged(0, 2 * Math.PI);
            var [xr, yr] = getDecartShifted(orbitR, orbitAng, 0, 0);

            var xr = 0, yr = 0;

            var r = 100;

            if (fxrand() < 0.5) {
                var ang = fxRandRanged(Math.PI / 3, Math.PI - Math.PI / 3);
            } else {
                var ang = fxRandRanged(Math.PI + Math.PI / 3, 2 * Math.PI - Math.PI / 3);
            }
            // var ang = fxRandRanged(0, 2 * Math.PI);
            var [x, y] = getDecartShifted(r, ang, xr, yr);
            this.lines.push(new Line(ang + Math.PI / 2, x, y));
    
            ang -= Math.PI;
            var [x, y] = getDecartShifted(r, ang, xr, yr);
            this.lines.push(new Line(ang + Math.PI / 2, x, y));

            var [x, y] = getDecartShifted(r + 100, ang, xr, yr);
            this.lines.push(new Line(ang + Math.PI / 2, x, y));

            
            var [x, y] = getDecartShifted(r + 130, ang, xr, yr);
            this.lines.push(new Line(ang + Math.PI / 2, x, y));
        }

    }
    getArea (x, y) {
        var isFlow = this.getAreaByDelimeter(x, y);
        var acc = 0;
        for (var line of this.lines) {
            acc += line.isGreater(x, y);
        }
        return (isFlow + acc) % 4;
    }
}