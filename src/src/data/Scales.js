window.SCALES = {
    intervals: {
        simple: {
            "P1": [0,1], "m2": [1,2], "M2": [2,2], "m3": [3,3], "M3": [4,3],
            "P4": [5,4], "A4": [6,4], "d5": [6,5], "P5": [7,5], "m6": [8,6],
            "M6": [9,6], "m7": [10,7], "M7": [11,7], "P8": [12,8]
        },
        compound: {
            "9": {"semitones": 14, "visual_degree": 2, "octave_offset": 1},
            "11": {"semitones": 17, "visual_degree": 4, "octave_offset": 1},
            "13": {"semitones": 21, "visual_degree": 6, "octave_offset": 1}
        }
    },
    library: {
        diatonic: {
            "major": {"name":"Major","intervals":[0,2,4,5,7,9,11], "relative":"minor_natural","id":"major"},
            "minor_natural": {"name":"Natural Minor","intervals":[0,2,3,5,7,8,10], "relative":"major","id":"minor_natural"},
            "minor_harmonic": {"name":"Harmonic Minor","intervals":[0,2,3,5,7,8,11],"id":"minor_harmonic"},
            "minor_melodic": {"name":"Melodic Minor","intervals":[0,2,3,5,7,9,11],"id":"minor_melodic"}
        },
        modes: {
            "ionian": [0,2,4,5,7,9,11], "dorian": [0,2,3,5,7,9,10], "phrygian": [0,1,3,5,7,8,10],
            "lydian": [0,2,4,6,7,9,11], "mixolydian": [0,2,4,5,7,9,10], "aeolian": [0,2,3,5,7,8,10], "locrian": [0,1,3,5,6,8,10]
        },
        pentatonic_blues: {
            "penta_major": [0,2,4,7,9], "penta_minor": [0,3,5,7,10],
            "blues_minor": [0,3,5,6,7,10], "blues_heptatonic": [0,2,3,5,6,7,10], "blues_nonatonic": [0,2,3,4,5,6,7,9,10]
        },
        special: {
            "bebop_dominant": [0,2,4,5,7,9,10,11], "whole_tone": [0,2,4,6,8,10], "chromatic": [0,1,2,3,4,5,6,7,8,9,10,11]
        }
    }
};