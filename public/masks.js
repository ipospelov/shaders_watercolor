class NoiseCache {
    constructor (step = 0.005, seedStep = 0, coef = 1, colorStep = 0.05) {
        this.step = step;
        this.percentilesCache = {};
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
        var cached = this.percentilesCache[percentile];
        if (cached) {
            return cached;
        }
        if (percentile > 1) {
            percentile = 1;
        } else if (percentile < 0) {
            percentile = 0;
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
        this.percentilesCache[percentile] = val;
        return val;
    }
}

class Scene {
    constructor () {
        this.flowNoise = new NoiseCache(0.0009, 0, 340);

        this.colorNoise = new NoiseCache(0.001, 1231);
        this.colorNoise2 = new NoiseCache(0.001, 1231, 1, 0.2);
        
        var circleStep = delParams.step;
        this.circleNoise = new NoiseCache(circleStep);
        this.delimeterNoise = new NoiseCache(circleStep);

        this.noiseByArea = {
            0: this.flowNoise,
            1: this.circleNoise,
            2: this.flowNoise,
            3: this.circleNoise,
        }

        this.isRevertedByArea = {
            0: false,
            1: false,
            2: true,
            3: true
        };

        this.delimeterPercentiles = delParams.percentiles;
    }

    setDefaultArea (area) {
        this.defaultArea = area;
    }

    isLeftArea (area) {
        return this.defaultArea !== area
    }

    getPointStyle (x, y) {
        var area = this.getArea(x, y);
        var noiseGenerator = this.noiseByArea[area];
        var noiseVal = noiseGenerator.get(x, y);

        if (area < 2) {
            var colorHeight = this.colorNoise.get(x, y);
            var color = this.getColor(colorHeight, area, this.colorNoise);
        } else {
            var colorHeight = this.colorNoise2.get(x, y);
            var color = this.getColor(colorHeight, area, this.colorNoise2);
        }
 
        return {
            "area": area,
            "noise": noiseVal,
            "color": color
        }
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

    getFillColor (x, y) {
        var area = this.getArea(x, y);
        var noiseGenerator = this.noiseByArea[area];
        return this.getColor(1, area, noiseGenerator);
    }

    getColor (height, area, noiseGenerator) {
        var isReverted = this.isRevertedByArea[area];
        return this.mixColors(isReverted, height, noiseGenerator);
    }

    getIterationPalette () {
        if (palette.length == 1) {
            return palette[0];
        }
        return palette[currIter % 2];
    }

    mixColors (isInverted, height, noiseGenerator) {
        var localPalette = this.getIterationPalette();
        
        if (isInverted) {
            return multipleMixColors(localPalette[0], localPalette[1], height, noiseGenerator);
        } else {
            return multipleMixColors(localPalette[2], localPalette[3], height, noiseGenerator);
        }
    }
}

class SimpleLinesScene extends Scene {
    constructor () {
        super();
        this.lines = [];
        this.createLines();
    }

    createLines () {
        var r = fxRandRanged(100, 200);
        var iters = randomInt(30, 70);
        for (var i = 0; i < iters; i++) {
            var ang = map(noise(i * 0.1), 0, 1, 0, 2 * Math.PI);

            var [x, y] = getDecartShifted(r, ang, 0, 0);
            this.lines.push(new Line(ang + Math.PI / 2, x, y));
    
            ang -= Math.PI;
            var [x, y] = getDecartShifted(r, ang, 0, 0);
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

class TwoFocusesScene extends SimpleLinesScene {
    createLines () {
        var r = randomInt(300, 600);
        var x0 = 0, y0 = 0;
        var iters = randomInt(11, 51);
        for (var i = 0; i < iters; i++) {
            var ang = map(noise(i * 0.1), 0, 1, 0, 2 * Math.PI);

            var [x, y] = getDecartShifted(r, ang, x0, y0);
            this.lines.push(new Line(ang + Math.PI / 2, x, y));
    
            ang -= Math.PI;
            var [x, y] = getDecartShifted(r, ang, 0, 0);
            this.lines.push(new Line(ang + Math.PI / 2, x, y));
        }

        var phi = fxRandRanged(0, 2 * Math.PI);
        var [x0, y0] = getDecartShifted(r, phi, 0, 0);
        var iters = randomInt(11, 51);
        for (var i = 0; i < iters; i++) {
            var ang = fxRandRanged(0, 2 * Math.PI)

            var [x, y] = getDecartShifted(r, ang, 0, 0);
            this.lines.push(new Line(ang + Math.PI / 2, x0, y0));
    
            ang -= Math.PI;
            var [x, y] = getDecartShifted(r, ang, 0, 0);
            this.lines.push(new Line(ang + Math.PI / 2, x0, y0));
        }
    }
}

class LowAmountScene extends SimpleLinesScene {
    createLines () {
        var r = randomInt(100, 400);
        var x0 = 0, y0 = 0;
        for (var i = 0; i < 7; i++) {
            var ang = fxRandRanged(0, 2 * Math.PI)

            var [x, y] = getDecartShifted(r, ang, x0, y0);
            this.lines.push(new Line(ang + Math.PI / 2, x, y));
    
            ang -= Math.PI;
            var [x, y] = getDecartShifted(r, ang, x0, y0);
            this.lines.push(new Line(ang + Math.PI / 2, x, y));
        }
    }
}

class DoubleLineScene extends SimpleLinesScene {
    createLines () {
        var r = randomInt(80, 150);
        var x0 = 0, y0 = 0;
        var iters = randomInt(15, 50);
        for (var i = 0; i < iters; i++) {
            var ang = map(noise(i), 0, 1, 0, 2 * Math.PI);

            var [x, y] = getDecartShifted(r, ang, x0, y0);
            var l1 = new Line(ang + Math.PI / 2, x, y);
    
            ang -= Math.PI;
            var [x, y] = getDecartShifted(r, ang, x0, y0);
            var l2 = new Line(ang + Math.PI / 2, x, y);

            this.lines.push([l1, l2]);

            var [x, y] = getDecartShifted(r + 30, ang, x0, y0);
            var l1 = new Line(ang + Math.PI / 2, x, y);

            var [x, y] = getDecartShifted(r + 50, ang, x0, y0);
            var l2 = new Line(ang + Math.PI / 2, x, y);

            this.lines.push([l1, l2]);
        }
    }

    getArea (x, y) {
        var isFlow = this.getAreaByDelimeter(x, y);
        var acc = 0;
        for (var linesPair of this.lines) {
            var l1 = linesPair[0];
            var l2 = linesPair[1];

            if (!l1.isGreater(x, y) & l2.isGreater(x, y)) {
                acc++;
            } else if (l1.isGreater(x, y) & !l2.isGreater(x, y)) {
                acc++;
            } 
        }
        return (isFlow + acc) % 4;
    }
}

class ManyLinesScene extends DoubleLineScene {
    createLines () {
        var r = randomInt(130, 250);
        var x0 = 0, y0 = 0;
        var iters = randomInt(70, 100);
        for (var i = 0; i < iters; i++) {
            if (i < 10) {
                var ang = map(noise(i), 0, 1, 0, 2 * Math.PI);
            } else {
                var ang = map(noise(i * 0.05), 0, 1, 0, 2 * Math.PI);
            }
            
            var [x, y] = getDecartShifted(r, ang, x0, y0);
            var l1 = new Line(ang + Math.PI / 2, x, y);
    
            ang -= Math.PI;
            var [x, y] = getDecartShifted(r, ang, x0, y0);
            var l2 = new Line(ang + Math.PI / 2, x, y);

            this.lines.push([l1, l2]);
        }
    }
}

class RectShapesScene extends DoubleLineScene {
    createLines () {
        var r = 150;
        var x0 = 0, y0 = 0;
        var iters = randomInt(2, 3);
        for (var r = 10; r < 1000; r += randomInt(80, 200)) {
            for (var i = 0; i < iters; i++) {
                var ang = fxRandRanged(0, 2 * Math.PI)
                
                var [x, y] = getDecartShifted(r, ang, x0, y0);
                var l1 = new Line(ang + Math.PI / 2, x, y);
        
                ang -= Math.PI;
                var [x, y] = getDecartShifted(r, ang, x0, y0);
                var l2 = new Line(ang + Math.PI / 2, x, y);
    
                this.lines.push([l1, l2]);
            }
        }
    }
}

class CirclesScene extends DoubleLineScene {
    createLines () {
        var x0 = 0, y0 = 0;
        for (var r of [10, 100, 200, 500]) {
            for (var i = 0; i < 10; i++) {
                var ang = fxRandRanged(0, 2 * Math.PI)
                
                var [x, y] = getDecartShifted(r, ang, x0, y0);
                var l1 = new Line(ang + Math.PI / 2, x, y);
        
                ang -= Math.PI;
                var [x, y] = getDecartShifted(r, ang, x0, y0);
                var l2 = new Line(ang + Math.PI / 2, x, y);
    
                this.lines.push([l1, l2]);
            }
        }
    }
}

class MonoAngleScene extends DoubleLineScene {
    createLines () {
        var x0 = 0, y0 = 0;
        var r = randomInt(100, 300);
        var angShift = fxRandRanged(0, Math.PI / 2);
        for (var i = 0; i < 40; i++) {
            var ang = fxRandRanged(-Math.PI / 5, Math.PI / 5) + angShift;
            
            var [x, y] = getDecartShifted(r, ang, x0, y0);
            var l1 = new Line(ang + Math.PI / 2, x, y);
    
            ang -= Math.PI;
            var [x, y] = getDecartShifted(r, ang, x0, y0);
            var l2 = new Line(ang + Math.PI / 2, x, y);

            this.lines.push([l1, l2]);
        }

        var r = 300;
        var x0 = xBufferSize / 2, y0 = yBufferSize / 2;
        for (var i = 0; i < 10; i++) {
            var ang = fxRandRanged(Math.PI / 2, Math.PI);
            
            var [x, y] = getDecartShifted(r, ang, x0, y0);
            var l1 = new Line(ang + Math.PI / 2, x, y);
    
            ang -= Math.PI;
            var [x, y] = getDecartShifted(r, ang, x0, y0);
            var l2 = new Line(ang + Math.PI / 2, x, y);

            this.lines.push([l1, l2]);
        }

        var r = 300;
        var x0 = -xBufferSize / 2, y0 = -yBufferSize / 2;
        for (var i = 0; i < 10; i++) {
            var ang = fxRandRanged(Math.PI / 2, Math.PI);
            
            var [x, y] = getDecartShifted(r, ang, x0, y0);
            var l1 = new Line(ang + Math.PI / 2, x, y);
    
            ang -= Math.PI;
            var [x, y] = getDecartShifted(r, ang, x0, y0);
            var l2 = new Line(ang + Math.PI / 2, x, y);

            this.lines.push([l1, l2]);
        }
    }
}

class SquaresScene extends DoubleLineScene {
    createLines () {
        var r = 300;
        var x0 = 0, y0 = 0;
        var maxIters = randomFromRange([1, 2, 3]);
        var rStep = randomFromRange([100, 150, 200]);
        for (var r = 10; r < 700; r += rStep) {
            for (var i = 0; i < maxIters; i++) {
                var ang = map(noise(i), 0, 1, 0, 2 * Math.PI);

                var [x, y] = getDecartShifted(r, ang, x0, y0);
                var l1 = new Line(ang + Math.PI / 2, x, y);
        
                ang -= Math.PI;
                var [x, y] = getDecartShifted(r, ang, x0, y0);
                var l2 = new Line(ang + Math.PI / 2, x, y);

                this.lines.push([l1, l2]);

                ang += Math.PI / 2;
                var [x, y] = getDecartShifted(r, ang, x0, y0);
                var l1 = new Line(ang + Math.PI / 2, x, y);
        
                ang -= Math.PI;
                var [x, y] = getDecartShifted(r, ang, x0, y0);
                var l2 = new Line(ang + Math.PI / 2, x, y);

                this.lines.push([l1, l2]);
            }
        }
    }
}

class DividedScene extends DoubleLineScene {
    constructor () {
        super();

        var ang = fxRandRanged(0, 2 * Math.PI);
        this.mainLine = new Line(ang, 0, 0);

        this.singleLines = this.createSingleLines(0, 50);
        this.doubleLines = this.createLines(randomInt(150, 300), randomInt(20, 50));
    }

    createSingleLines (r, iters) {
        var lines = [];
        for (var i = 0; i < iters; i++) {
            var ang = fxRandRanged(0, 2 * Math.PI);

            var [x, y] = getDecartShifted(r, ang, 0, 0);
            lines.push(new Line(ang + Math.PI / 2, x, y));
    
            ang -= Math.PI;
            var [x, y] = getDecartShifted(r, ang, 0, 0);
            lines.push(new Line(ang + Math.PI / 2, x, y));
        }
        return lines;
    }

    createLines (r, iters) {
        var lines = [];
        for (var i = 0; i < iters; i++) {
            var ang = map(noise(i), 0, 1, 0, 2 * Math.PI);

            var [x, y] = getDecartShifted(r, ang, 0, 0);
            var l1 = new Line(ang + Math.PI / 2, x, y);
    
            ang -= Math.PI;
            var [x, y] = getDecartShifted(r, ang, 0, 0);
            var l2 = new Line(ang + Math.PI / 2, x, y);

            lines.push([l1, l2]);

            var [x, y] = getDecartShifted(r + 30, ang, 0, 0);
            var l1 = new Line(ang + Math.PI / 2, x, y);

            var [x, y] = getDecartShifted(r + 50, ang, 0, 0);
            var l2 = new Line(ang + Math.PI / 2, x, y);

            lines.push([l1, l2]);
        }
        return lines;
    }

    getArea (x, y) {
        var acc = this.getAreaByDelimeter(x, y);

        if (this.mainLine.isGreater(x, y)) {
            for (var line of this.singleLines) {
                acc += line.isGreater(x, y);
            }
        } else {
            for (var linesPair of this.doubleLines) {
                var l1 = linesPair[0];
                var l2 = linesPair[1];

                if (!l1.isGreater(x, y) & l2.isGreater(x, y)) {
                    acc++;
                } else if (l1.isGreater(x, y) & !l2.isGreater(x, y)) {
                    acc++;
                } 
            }
        }

        return acc % 4;
    }
}

class CircleDividedScene extends SimpleLinesScene {
    constructor () {
        super();

        this.rStep = fxRandRanged(300, 450);
        this.circleRadiuses = [];
        this.linesArr = [];
        for (var r = this.rStep; r < xBufferSize; r += this.rStep) {
            this.circleRadiuses.push(r);
            this.linesArr.push(this.createLines(fxRandRanged(1, r), fxRandRanged(10, 70)));
        }
    }

    createLines (r, iters) {
        var lines = [];
        for (var i = 0; i < iters; i++) {
            var ang = fxRandRanged(0, 2 * Math.PI);

            var [x, y] = getDecartShifted(r, ang, 0, 0);
            lines.push(new Line(ang + Math.PI / 2, x, y));
    
            ang -= Math.PI;
            var [x, y] = getDecartShifted(r, ang, 0, 0);
            lines.push(new Line(ang + Math.PI / 2, x, y));
        }
        return lines;
    }

    getArea (x, y) {
        var acc = this.getAreaByDelimeter(x, y);

        for (var i = 0; i < this.circleRadiuses.length; i++) {
            if (inCircle(this.circleRadiuses[i] - this.rStep, this.circleRadiuses[i], 0, 0, x, y)) {
                for (var line of this.linesArr[i]) {
                    acc += line.isGreater(x, y);
                }
                break;
            }
        }

        return acc % 4;
    }
}

class DoubleCircle extends DoubleLineScene {
    createLines () {
        var x0 = 0, y0 = 0;
        var rOrbit = 300;
        var iters = randomFromRange([20, 30]);
        for (var i = 0; i < iters; i++) {
            var orbitAng = fxRandRanged(0, 2 * Math.PI);
            [x0, y0] = getDecartShifted(rOrbit, orbitAng, 0, 0);
            
            var r = map(noise(i), 0, 1, 30, 300);

            var ang = orbitAng + Math.PI / 2 //map(noise(i), 0, 1, 0, 2 * Math.PI);

            var [x, y] = getDecartShifted(r, ang, x0, y0);
            var l1 = new Line(ang + Math.PI / 2, x, y);
    
            ang -= Math.PI;
            var [x, y] = getDecartShifted(r, ang, x0, y0);
            var l2 = new Line(ang + Math.PI / 2, x, y);

            this.lines.push([l1, l2]);

            var [x, y] = getDecartShifted(r + 30, ang, x0, y0);
            var l1 = new Line(ang + Math.PI / 2, x, y);

            var [x, y] = getDecartShifted(r + 50, ang, x0, y0);
            var l2 = new Line(ang + Math.PI / 2, x, y);

            this.lines.push([l1, l2]);
        }
    }
}

class SpiralCorners extends SimpleLinesScene {
    createLines () {
        var r = 100;
        var step = randomFromRange([Math.PI / 4, Math.PI / 8]);
        var maxIters = randomInt(5, 12);
        var rStep = randomInt(50, 150);
        var angShift = fxRandRanged(0, 2 * Math.PI);
        var ang2Shift = randomFromRange([Math.PI / 2, Math.PI / 4, Math.PI / 8]);
        for (var i = 0; i < maxIters; i++) {
            for (var ang = 0; ang < 2 * Math.PI; ang += step) {
                var localAng = ang + angShift;

                var [x, y] = getDecartShifted(r, localAng, 0, 0);
                var l1 = new Line(localAng + Math.PI / 2, x, y);
        
                var ang2 = localAng - ang2Shift;
                var [x, y] = getDecartShifted(r, ang2, 0, 0);
                var l2 = new Line(ang2 + Math.PI / 2, x, y);
    
                this.lines.push([l1, l2]);
            }
            r += rStep;
        }
    }

    getArea (x, y) {
        var isFlow = this.getAreaByDelimeter(x, y);
        var acc = 0;
        for (var linesPair of this.lines) {
            var l1 = linesPair[0];
            var l2 = linesPair[1];

            if (!l1.isGreater(x, y) & l2.isGreater(x, y)) {
                acc++;
            }
        }
        return (isFlow + acc) % 4;
    }
}

class ThinLinesScene extends DoubleLineScene {
    createLines () {
        var x0 = 0, y0 = 0;
        var iters = 5;
        for (var r of [130, 160, 190, 220]) {
            for (var i = 0; i < iters; i++) {
                var ang = map(noise(i), 0, 1, 0, 2 * Math.PI);
    
                var [x, y] = getDecartShifted(r, ang, x0, y0);
                var l1 = new Line(ang + Math.PI / 2, x, y);
        
                ang -= Math.PI;
                var [x, y] = getDecartShifted(r, ang, x0, y0);
                var l2 = new Line(ang + Math.PI / 2, x, y);
    
                this.lines.push([l1, l2]);
    
                var [x, y] = getDecartShifted(r + r, ang, x0, y0);
                var l1 = new Line(ang + Math.PI / 2, x, y);
    
                var [x, y] = getDecartShifted(r + r + 50, ang, x0, y0);
                var l2 = new Line(ang + Math.PI / 2, x, y);
    
                this.lines.push([l1, l2]);
            }
        }
    }
}