function rgb (v1, v2, v3) {
    return [v1, v2, v3];
}

var palettes = [
    [
        [
            rgb(52, 103, 81),
            rgb(144, 161, 125),
            rgb(2, 64, 89),
            rgb(165, 190, 204),
        ],
        [
            rgb(52, 103, 81),
            rgb(144, 161, 125),
            rgb(0, 18, 83),
            rgb(163, 199, 214),
        ]
    ],
    [
        [
            rgb(4, 28, 50),
            rgb(163, 199, 214),
            rgb(6, 70, 99),
            rgb(236, 179, 101),
        ],
        [
            rgb(4, 28, 50),
            rgb(95, 157, 247),
            rgb(0, 18, 83),
            rgb(242, 211, 136),
        ]
    ],
    [
        [
            rgb(255, 245, 228),
            rgb(255, 196, 196),
            rgb(238, 105, 131),
            rgb(133, 14, 53)
        ],
        [
            rgb(255, 245, 228),
            rgb(156, 15, 72),
            rgb(249, 228, 212),
            rgb(71, 13, 33)
        ],
    ],
    [
        [
            rgb(189, 199, 201),
            rgb(43, 79, 96),
            rgb(255, 248, 234),
            rgb(89, 69, 69)
        ],
        [
            rgb(189, 199, 201),
            rgb(43, 79, 96),
            rgb(255, 248, 234),
            rgb(89, 69, 69)
        ],
    ],
    [
        [
            rgb(189, 199, 201),
            rgb(43, 79, 96),
            rgb(255, 196, 196),
            rgb(133, 14, 53)
        ],
        [
            rgb(165, 190, 204),
            rgb(36, 58, 115),
            rgb(255, 196, 196),
            rgb(133, 14, 53)
        ],
    ],
    [
        [
            rgb(234, 168, 27),
            rgb(201, 85, 1),
            rgb(144, 161, 125),
            rgb(1, 44, 11)
        ],
        [
            rgb(234, 168, 27),
            rgb(201, 85, 1),
            rgb(144, 161, 125),
            rgb(1, 44, 11)
        ],
    ],
    [
        [
            rgb(247, 247, 247),
            rgb(238, 238, 238),
            rgb(57, 62, 70),
            rgb(146, 154, 171)
        ],
        [
            rgb(240, 235, 227),
            rgb(228, 220, 207),
            rgb(125, 157, 156),
            rgb(87, 111, 114)
        ],
    ],
    [
        [
            rgb(253, 132, 31),
            rgb(225, 77, 42),
            rgb(205, 16, 77),
            rgb(156, 44, 119)
        ],
        [
            rgb(255, 159, 159),
            rgb(253, 132, 31),
            rgb(130, 0, 0),
            rgb(255, 171, 225),
        ],
    ],
    [
        [
            rgb(97, 118, 75),
            rgb(155, 161, 123),
            rgb(255, 165, 0),
            rgb(250, 214, 165)
        ],
        [
            rgb(95, 113, 97),
            rgb(53, 66, 89),
            rgb(239, 234, 216),
            rgb(208, 201, 192)
        ]
    ],
    [
        [
            rgb(0, 43, 91),
            rgb(255, 245, 228),
            rgb(37, 109, 133),
            rgb(143, 227, 207)
        ],
        [
            rgb(255, 248, 154),
            rgb(255, 201, 0),
            rgb(0, 43, 91),
            rgb(26, 95, 122),
        ],
    ],
    [
        [
            rgb(132, 84, 96),
            rgb(234, 211, 203),
            rgb(189, 199, 201),
            rgb(43, 79, 96)
        ],
        [
            rgb(124, 62, 102),
            rgb(242, 235, 233),
            rgb(165, 190, 204),
            rgb(43, 79, 96)
        ],
    ],
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

   var intensity = map(height, p1, p2, 0, 1.5);
   intensity = constrain(intensity, 0, 1);
   return mixColors(color1, color2, intensity);
}
