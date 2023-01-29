let curveUniforms = [
    {
        "u_amplitude": .3,
        "u_frequency": 20,
        "u_fbm_n": 3,
        "u_fbm_frequency": 5,
        "u_fbm_amplitude": 0.15,
    },
    {
        "u_amplitude": .1,
        "u_frequency": 50,
        "u_fbm_n": 3,
        "u_fbm_frequency": 5,
        "u_fbm_amplitude": 0.15,
    },
    {  // 
        "u_amplitude": .5,
        "u_frequency": 50,
        "u_fbm_n": 3,
        "u_fbm_frequency": 2,
        "u_fbm_amplitude": 0.15,
    },
    { // simple
        "u_amplitude": .1,
        "u_frequency": 50,
        "u_fbm_n": 3,
        "u_fbm_frequency": 2,
        "u_fbm_amplitude": 0.15,
    },
    {
        "u_amplitude": .1,
        "u_frequency": 100,
        "u_fbm_n": 3,
        "u_fbm_frequency": 2,
        "u_fbm_amplitude": 0.15,
    },
    {
        "u_amplitude": .1,
        "u_frequency": 100,
        "u_fbm_n": 3,
        "u_fbm_frequency": 2,
        "u_fbm_amplitude": 0.55,
    },
    {
        "u_amplitude": .5,
        "u_frequency": 10,
        "u_fbm_n": 4,
        "u_fbm_frequency": 2,
        "u_fbm_amplitude": 0.55,
    },
    {
        "u_amplitude": .5,
        "u_frequency": 10,
        "u_fbm_n": 4,
        "u_fbm_frequency": 30,
        "u_fbm_amplitude": 0.05,
    },
    {
        "u_amplitude": .5,
        "u_frequency": 2,
        "u_fbm_n": 4,
        "u_fbm_frequency": 100,
        "u_fbm_amplitude": 0.05,
    },
    {
        "u_amplitude": .5,
        "u_frequency": 15,
        "u_fbm_n": 3,
        "u_fbm_frequency": 10,
        "u_fbm_amplitude": 0.05,
    }
]

let waveUniforms = [
    { // liquid
        "u_width": 0.3,
        "u_amplitude": 0.3,
        "u_frequency": 20.1,
        "u_fbm_frequency": 2,
        "u_fbm_amplitude": 0.05,
        "u_iters": 5,
    },
    {  // много острых краев
        "u_width": 0.3,
        "u_amplitude": 0.3,
        "u_frequency": 10.1,
        "u_fbm_frequency": 20,
        "u_fbm_amplitude": 0.05,
        "u_overlay": false,
        "u_iters": 5,
    },
    {  // spray
        "u_width": 0.3,
        "u_amplitude": 0.3,
        "u_frequency": 10.1,
        "u_fbm_frequency": 5,
        "u_fbm_amplitude": 0.55,
        "u_iters": 5,
    }
]