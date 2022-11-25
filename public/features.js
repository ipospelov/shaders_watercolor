var scenes = [
    DoubleLineScene,
    SimpleLinesScene,
    ManyLinesScene,
    SquaresScene,
    DividedScene,
    DoubleCircle,
    MonoAngleScene,
    SpiralCorners,
    CircleDividedScene,
    ThinLinesScene,
    RectShapesScene,
    TwoFocusesScene,
    CirclesScene,
    LowAmountScene,
]

var sceneIndex;
var sceneClass = DoubleLineScene;
var sceneRand = fxrand();
if (sceneRand <= 0.02) {
    sceneClass = LowAmountScene;
    sceneIndex = 1;
} else if (sceneRand <= 0.05) {
    sceneClass = CirclesScene;
    sceneIndex = 2;
} else if (sceneRand <= 0.08) {
    sceneClass = TwoFocusesScene;
    sceneIndex = 3;
} else if (sceneRand <= 0.12) {
    sceneClass = RectShapesScene;
    sceneIndex = 4;
} else if (sceneRand <= 0.16) {
    sceneClass = ThinLinesScene;
    sceneIndex = 5;
} else if (sceneRand <= 0.2) {
    sceneClass = CircleDividedScene;
    sceneIndex = 6;
} else if (sceneRand <= 0.25) {
    sceneClass = SpiralCorners;
    sceneIndex = 7;
} else if (sceneRand <= 0.3) {
    sceneClass = MonoAngleScene;
    sceneIndex = 8;
} else if (sceneRand <= 0.4) {
    sceneClass = DoubleCircle;
    sceneIndex = 9;
} else if (sceneRand <= 0.5) {
    sceneClass = DividedScene;
    sceneIndex = 10;
} else if (sceneRand <= 0.6) {
    sceneClass = SquaresScene;
    sceneIndex = 11;
} else if (sceneRand <= 0.7) {
    sceneClass = ManyLinesScene;
    sceneIndex = 12;
} else if (sceneRand <= 0.8) {
    sceneClass = SimpleLinesScene;
    sceneIndex = 13;
} else {
    sceneClass = DoubleLineScene;
    sceneIndex = 14;
}

var paletteIndex = randomInt(0, palettes.length - 1);

window.$fxhashFeatures = {
    "Style index #": sceneIndex,
    "Palette index #": paletteIndex
}

var curlicuesParams = [
    {
        "percentiles": [
            [0.1, 0.12],
            [0.2, 0.22],
            [0.3, 0.32],
            [0.5, 0.52],
            [0.8, 0.82],
            [0.9, 0.92]
        ],
        "step": 0.0008
    },
    {
        "percentiles": [
            [0.1, 0.15],
            [0.2, 0.25],
            [0.3, 0.35],
            [0.5, 0.55],
        ],
        "step": 0.008
    },
    {
        "percentiles": [
            [0.1, 0.25],
            [0.3, 0.45],
            [0.5, 0.65],
        ],
        "step": 0.008
    },
    {
        "percentiles": [
            [0.1, 0.15],
            [0.5, 0.55],
            [0.8, 0.85],
        ],
        "step": 0.008
    }
];

var paramRand = randomInt(0, 3);
var delParams = curlicuesParams[paramRand];
