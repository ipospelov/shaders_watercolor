function rgb (v1, v2, v3) {
    return [v1, v2, v3];
}

var palettes = [
    [
        [
            rgb(42, 9, 68),
            rgb(63, 167, 150),
            rgb(254, 194, 96),
            rgb(161, 0, 53)
        ],
        [
            rgb(0, 8, 57),
            rgb(110, 144, 134),
            rgb(255, 164, 27),
            rgb(222, 53, 106),
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
            rgb(132, 84, 96),
            rgb(242, 235, 233),
            rgb(165, 190, 204),
            rgb(43, 79, 96)
        ],
    ],
    [
        [
            rgb(247, 247, 247),
            rgb(133, 14, 53),
            rgb(57, 62, 70),
            rgb(146, 154, 171)
        ],
        [
            rgb(247, 247, 247),
            rgb(159, 30, 73),
            rgb(57, 62, 70),
            rgb(146, 154, 171)
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
            rgb(47, 27, 65),
            rgb(159, 30, 73),
            rgb(254, 205, 81),
            rgb(242, 242, 242)
        ],
        [
            rgb(59, 24, 95),
            rgb(156, 37, 77),
            rgb(254, 219, 57),
            rgb(255, 247, 233)
        ]
    ],
    [
        [
            rgb(247, 247, 247),
            rgb(6, 70, 99),
            rgb(57, 62, 70),
            rgb(146, 154, 171)
        ],
        [
            rgb(247, 247, 247),
            rgb(6, 70, 99),
            rgb(57, 62, 70),
            rgb(146, 154, 171)
        ],
    ],
    [
        [
            rgb(81, 50, 82),
            rgb(122, 64, 105),
            rgb(202, 78, 121),
            rgb(255, 193, 142)
        ],
        [
            rgb(42, 9, 68),
            rgb(59, 24, 95),
            rgb(161, 37, 104),
            rgb(254, 194, 96)
        ]
    ],
    [
        [
            rgb(0, 0, 0),
            rgb(26, 77, 46),
            rgb(255, 159, 41),
            rgb(250, 243, 227)
        ],
        [
            rgb(57, 62, 70),
            rgb(85, 113, 83),
            rgb(240, 165, 0),
            rgb(247, 247, 247)
        ]
    ],
    [
        [
            rgb(246, 246, 201),
            rgb(186, 209, 194),
            rgb(79, 160, 149),
            rgb(21, 52, 98)
        ],
        [
            rgb(243, 236, 176),
            rgb(186, 209, 194),
            rgb(110, 204, 175),
            rgb(52, 77, 103)
        ]
    ],
    [
        [
            rgb(120, 28, 104),
            rgb(49, 157, 160),
            rgb(255, 211, 154),
            rgb(255, 245, 225)
        ],
        [
            rgb(59, 24, 95),
            rgb(79, 160, 149),
            rgb(245, 213, 174),
            rgb(255, 245, 225)
        ]
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

   var intensity = map(height, p1, p2, 0, 1.5);
   intensity = constrain(intensity, 0, 1);
   return mixColors(color1, color2, intensity);
}
