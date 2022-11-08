var brushStyles = [
    [0.0009, 0, 340],
    [0.0009, 0, 640],
    [0.009, 0, 30],
    [0.00001, 0, 2410],
]
var brushStyles2 = [
    [0.009],
    [0.09],
    [0.05],
    [0.0008],
]

var brushStyle1 = randomInt(0, brushStyles.length - 1);
var brushStyle2 = randomInt(0, brushStyles2.length - 1);

var sceneRand = fxrand();
var sceneClass = DoubleFlowDelimiterScene;
if (sceneRand <= 0.02) {
    sceneClass = SinScene;
} else if (sceneRand <= 0.04) {
    sceneClass = HighFrequencySinScene;
// } else if (sceneRand <= 0.05) {
//     sceneClass = HorizontalScene;
} else if (sceneRand <= 0.15) {
    sceneClass = ManySpiralScene;
} else if (sceneRand <= 0.3) {
    sceneClass = SnailSpiralScene;
} else if (sceneRand <= 0.6) {
    sceneClass = ExtraSpiralScene;
// } else if (sceneRand <= 0.425) {
//     sceneClass = FlowDelimiterScene;
// } else if (sceneRand <= 0.65) {
//     sceneClass = FlowDelimiterScene2;
} else if (sceneRand <= 0.8) {
    sceneClass = DoubleFlowDelimiterScene;
} else  {
    sceneClass = ExtraFlowDelimiterScene;
}
//  else {
//     sceneClass = FlowDelimiterScene3;
// }

var paletteIndex = randomInt(0, palettes.length - 1);

window.$fxhashFeatures = {
    "Brush style 1": brushStyle1 + 1,
    "Brush style 2": brushStyle2 + 1,
    "Scene generator": sceneClass.toString(),
}
console.log(brushStyle1, brushStyle2, sceneClass.toString());
console.log(brushStyles[brushStyle1], brushStyles2[brushStyle2])


var delimeterPercentiles = [
    [
        [0.1, 0.15],
        [0.5, 0.55],
        [0.8, 0.85],
    ],
    [
        [0.1, 0.2],
        [0.8, 0.9]
    ],
    [
        [0.1, 0.2],
        [0.4, 0.5],
        [0.8, 0.9]
    ],
    [
        [0.1, 0.3],
        [0.6, 0.9]
    ],
];
var delRand = fxrand();
var delIndex = 0;
if (delRand < 0.05) {
    delIndex = 3;
} else if (delRand < 0.1) {
    delIndex = 2;
} else if (delRand < 0.25){
    delIndex = 1;
} else {
    delIndex = 0;
}
console.log(delimeterPercentiles[delIndex], delIndex)