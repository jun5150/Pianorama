/**
 * PIANORAMA - TheorySpeller.js
 */
window.TheorySpeller = {
    letters: ["C", "D", "E", "F", "G", "A", "B"],

    spell: function(rootKey, degreeIndex, midiValue) {
        // Proteção: Garante que rootKey seja uma string tratável
        if (!rootKey || typeof rootKey !== 'string') {
            rootKey = "C";
        }

        var rootLetter = rootKey.charAt(0).toUpperCase();
        var rootLetterIndex = this.letters.indexOf(rootLetter);
        var targetLetter = this.letters[(rootLetterIndex + degreeIndex) % 7];

        var signature = (window.THEORY_MAPS && window.THEORY_MAPS.key_signatures) 
                        ? window.THEORY_MAPS.key_signatures[rootKey] || [] 
                        : [];
        
        return this._matchNoteToLetter(midiValue, targetLetter, signature);
    },

    _matchNoteToLetter: function(midi, letter, signature) {
        var octave = Math.floor(midi / 12) - 1;
        var noteInOctave = midi % 12;
        
        var midiMap = {
            0: ["C", "B#", "Dbb"], 1: ["C#", "Db"], 2: ["D"], 3: ["D#", "Eb"],
            4: ["E", "Fb"], 5: ["F", "E#"], 6: ["F#", "Gb"], 7: ["G"],
            8: ["G#", "Ab"], 9: ["A"], 10: ["A#", "Bb"], 11: ["B", "Cb"]
        };

        var possibilities = midiMap[noteInOctave] || ["C"];
        var bestMatch = possibilities;

        for (var i = 0; i < possibilities.length; i++) {
            if (possibilities[i].charAt(0) === letter) {
                bestMatch = possibilities[i];
                break;
            }
        }

        return bestMatch + octave;
    }
};