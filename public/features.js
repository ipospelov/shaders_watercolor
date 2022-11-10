var brushStyles = [
    [0.0009, 0, 340],
    [0.0009, 0, 640],
    [0.009, 0, 30],
]
var brushStyles2 = [
    [0.09],
    [0.0009, 0, 340],
    [0.0009, 0, 640],
    [0.009, 0, 30],
    [0.0009, 0, 11640],
]

var brushStyle1 = randomInt(0, brushStyles.length - 1);
var brushStyle2 = randomInt(0, brushStyles2.length - 1);

var sceneRand = fxrand();
var sceneClass = ExtraFlowDelimiterScene;
var sceneIndex = 0;


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
    // [
    //     [0.1, 0.2],
    //     [0.8, 0.9]
    // ],
    // [
    //     [0.1, 0.2],
    //     [0.4, 0.5],
    //     [0.8, 0.9]
    // ],
    // [
    //     [0.1, 0.3],
    //     [0.6, 0.9]
    // ],
];
var delRand = fxrand();
var delIndex = 0;
// if (delRand < 0.05) {
//     delIndex = 3;
// } else if (delRand < 0.1) {
//     delIndex = 2;
// } else if (delRand < 0.25){
//     delIndex = 1;
// } else {
//     delIndex = 0;
// }
console.log(delimeterPercentiles[delIndex], delIndex)