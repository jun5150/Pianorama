window.CHORDS = {
    formulas: {
        triads: {"maj":[0,4,7],"min":[0,3,7],"dim":[0,3,6],"aug":[0,4,8]},
        sevenths: {"maj7":[0,4,7,11],"m7":[0,3,7,10],"7":[0,4,7,10],"m7b5":[0,3,6,10],"dim7":[0,3,6,9],"aug7M":[0,4,8,11]},
        extensions: {
            "9":[0,4,7,10,14], "maj9":[0,4,7,11,14], "m9":[0,3,7,10,14],
            "11":[0,4,7,10,14,17], "maj11":[0,4,7,11,14,17],
            "13":[0,4,7,10,14,17,21], "maj13":[0,4,7,11,14,17,21],
            "7b9":[0,4,7,10,13], "7#9":[0,4,7,10,15], "7b5":[0,4,6,10], "7#5":[0,4,8,10]
        }
    },
    harmonic_fields: {
        "major": {
            "I":{"chord":"maj7","function":"T"}, "ii":{"chord":"m7","function":"S"},
            "iii":{"chord":"m7","function":"T"}, "IV":{"chord":"maj7","function":"S"},
            "V":{"chord":"7","function":"D"}, "vi":{"chord":"m7","function":"T"}, "vii°":{"chord":"m7b5","function":"D"}
        },
        "minor_natural": {
            "i":{"chord":"m7","function":"T"}, "ii°":{"chord":"m7b5","function":"S"},
            "III":{"chord":"maj7","function":"T"}, "iv":{"chord":"m7","function":"S"},
            "v":{"chord":"m7","function":"D"}, "VI":{"chord":"maj7","function":"T"}, "VII":{"chord":"7","function":"D"}
        },
        "minor_harmonic": {
            "i":{"chord":"m7M","function":"T"}, "ii°":{"chord":"m7b5","function":"S"},
            "III+":{"chord":"aug7M","function":"D"}, "iv":{"chord":"m7","function":"S"},
            "V":{"chord":"7","function":"D"}, "VI":{"chord":"maj7","function":"T"}, "vii°":{"chord":"dim7","function":"D"}
        }
    },
    functions_advanced: {
        "T":["I","iii","vi"], "S":["ii","IV"], "D":["V","vii°"],
        "D_secondary":["V/ii","V/vi"], "ModalInterchange":["bIII","bVI","bVII"]
    },
    inversions: {
        "triads": {"1st":[0,1,2],"2nd":[0,2,1]},
        "sevenths": {"1st":[0,1,2,3],"2nd":[0,2,3,1],"3rd":[0,3,1,2]}
    },
    blues_penta_chords: {
        "penta_major":["maj7","7","maj7","7","maj7"],
        "penta_minor":["m7","m7","m7","7","m7"],
        "blues_minor":["m7","m7","7","m7","7","m7"]
    }
};