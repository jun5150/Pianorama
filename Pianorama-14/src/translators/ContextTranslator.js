/**
 * PIANORAMA - ContextTranslator.js (v13.6)
 */

window.ContextTranslator = {
    LETTERS: ["C", "D", "E", "F", "G", "A", "B"],
    currentKey: "C",
    accidentalPreference: "sharp",

    setContext: function(key) {
        if (!key) return;
        this.currentKey = key;
        this.accidentalPreference = window.TheoryEngine.getAccidentalType(key);
    },

    translate: function(midi, targetLetter) {
        var pc = midi % 12;
        var octave = Math.floor(midi / 12) - 1;
        var info;

        // Se passarmos a letra (ex: E), ele força a nota a ser Eb e não D#
        if (targetLetter) {
            info = this._getNoteByLetter(pc, targetLetter);
        } else {
            info = this._inferNoteByContext(pc);
        }

        return {
            midi: midi,
            octave: octave, 
            letter: info.letter,
            accidental: info.accidental,
            absoluteY: this._calculateAbsoluteY(info.letter, octave),
            fileName: info.letter + info.accidental + octave + ".mp3"
        };
    },

    // A FUNÇÃO QUE RESOLVE O PROBLEMA DAS NOTAS REPETIDAS
    _getNoteByLetter: function(pc, targetLetter) {
        var letterMidiMap = { "C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11 };
        var basePc = letterMidiMap[targetLetter.toUpperCase()];
        var diff = pc - basePc;
        if (diff > 6) diff -= 12;
        if (diff < -6) diff += 12;

        var acc = "";
        if (diff === 1) acc = "#";
        else if (diff === -1) acc = "b";
        else if (diff === 2) acc = "##";
        else if (diff === -2) acc = "bb";
        return { letter: targetLetter.toUpperCase(), accidental: acc };
    },

    _calculateAbsoluteY: function(letter, octave) {
        var stepIdx = this.LETTERS.indexOf(letter);
        return (parseInt(octave) * 7) + stepIdx;
    },

    _inferNoteByContext: function(pc) {
        var sharps = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
        var flats = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
        var list = (this.accidentalPreference === "flat") ? flats : sharps;
        var res = list[pc] || "C";
        return { letter: res.charAt(0), accidental: res.substring(1) };
    }
};