window.THEORY_MAPS = {
    enharmonics: {
        preferred_keys: {
            sharps: ["G","D","A","E","B","F#","C#","e","b","f#","c#","g#","d#","a#"],
            flats: ["F","Bb","Eb","Ab","Db","Gb","Cb","d","g","c","f","bb","eb","ab"]
        },
        conversion_map: {
            "C#": "Db", "D#": "Eb", "F#": "Gb", "G#": "Ab", "A#": "Bb",
            "E#": "F", "B#": "C", "Fb": "E", "Cb": "B"
        }
    },
    relative_map: {
        "C": "A", "G": "E", "D": "B", "A": "F#", "E": "C#", "B": "G#", "F#": "D#", "C#": "A#",
        "F": "D", "Bb": "G", "Eb": "C", "Ab": "F", "Db": "Bb", "Gb": "Eb", "Cb": "Ab"
    },
    key_signatures: {
        "C": [], "G":["F#"], "D":["F#","C#"], "A":["F#","C#","G#"], "E":["F#","C#","G#","D#"], "B":["F#","C#","G#","D#","A#"],
        "F#":["F#","C#","G#","D#","A#","E#"], "C#":["F#","C#","G#","D#","A#","E#","B#"],
        "F":["Bb"], "Bb":["Bb","Eb"], "Eb":["Bb","Eb","Ab"], "Ab":["Bb","Eb","Ab","Db"],
        "Db":["Bb","Eb","Ab","Db","Gb"], "Gb":["Bb","Eb","Ab","Db","Gb","Cb"], "Cb":["Bb","Eb","Ab","Db","Gb","Cb","Fb"]
    },
    note_to_degree: {
        "0":{"name":"Tonic","degree":"I","label":"1"},
        "1":{"name":"Minor Second","degree":"bII","label":"b2"},
        "2":{"name":"Major Second","degree":"II","label":"2"},
        "3":{"name":"Minor Third","degree":"bIII","label":"b3"},
        "4":{"name":"Major Third","degree":"III","label":"3"},
        "5":{"name":"Perfect Fourth","degree":"IV","label":"4"},
        "6":{"name":"Augmented Fourth","degree":"#IV","label":"#4/b5"},
        "7":{"name":"Perfect Fifth","degree":"V","label":"5"},
        "8":{"name":"Minor Sixth","degree":"bVI","label":"b6"},
        "9":{"name":"Major Sixth","degree":"VI","label":"6"},
        "10":{"name":"Minor Seventh","degree":"bVII","label":"b7"},
        "11":{"name":"Major Seventh","degree":"VII","label":"7"}
    }
};