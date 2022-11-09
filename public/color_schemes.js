function rgb (v1, v2, v3) {
    return [v1, v2, v3];
}

var palettes = [
    [
        rgb(132, 84, 96),
        rgb(234, 211, 203),
        rgb(189, 199, 201),
        rgb(43, 79, 96)
    ],
    [
        rgb(242, 222, 186),
        rgb(255, 239, 214),
        rgb(14, 94, 111),
        rgb(87, 111, 114)
    ],
    [
        rgb(124, 62, 102),
        rgb(242, 235, 233),
        rgb(165, 190, 204),
        rgb(36, 58, 115)
    ],
    [
        rgb(255, 245, 228),
        rgb(255, 196, 196),
        rgb(238, 105, 131),
        rgb(133, 14, 53)
    ],
    [
        rgb(41, 52, 98),
        rgb(214, 28, 78),
        rgb(254, 177, 57),
        rgb(255, 248, 10)
    ],
    [
        rgb(41, 52, 98),
        rgb(242, 76, 76),
        rgb(236, 155, 59),
        rgb(247, 215, 22)
    ],
    [
        rgb(214, 125, 62),
        rgb(156, 15, 72),
        rgb(249, 228, 212),
        rgb(71, 13, 33)
    ],
    [
        rgb(120, 28, 104),
        rgb(49, 157, 160),
        rgb(255, 211, 154),
        rgb(255, 245, 225)
    ],
    [
        rgb(49, 225, 247),
        rgb(216, 0, 166),
        rgb(255, 119, 119),
        rgb(64, 13, 81),
    ],
    [
        rgb(57, 81, 68),
        rgb(78, 108, 80),
        rgb(170, 139, 86),
        rgb(240, 235, 206)
    ],
    [
        rgb(255, 164, 27),
        rgb(0, 8, 57),
        rgb(0, 80, 130),
        rgb(250, 237, 240),
    ],
    [
        rgb(22, 24, 83),
        rgb(92, 184, 228),
        rgb(250, 237, 240),
        rgb(236, 37, 90)
    ],
    [
        [55, 226, 213],
        [89, 6, 150],
        [199, 10, 128],
        [251, 203, 10]
    ]
]

function mixColors(color1, color2, intensity) {
    return color1.map((n, i) => {
        var diff = color2[i] - n;
        var toAdd = map(intensity, 0, 1, 0, diff);
        return n + toAdd
    });
}

var colorRanges = [
    [0, 0.1],
    [0.1, 0.2],
    [0.2, 0.3],
    [0.3, 0.4],
    [0.4, 0.5],
    [0.5, 0.6],
    [0.6, 0.7],
    [0.7, 0.8],
    [0.8, 0.9],
    [0.9, 1]
]

function multipleMixColors(color1, color2, height, noiseGenerator) {
    var p1 = 0, p2 = 1;
    for (var range of noiseGenerator.colorPercentiles) {
        p1 = range[0];
        p2 = range[1];
        if (height >= p1 & height <= p2) {
            break;
        }
    }

   var intensity = map(height, p1, p2, 0, 1);
   intensity = constrain(intensity, 0, 1);
   return mixColors(color1, color2, intensity);
}
