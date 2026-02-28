/**
 * PIANORAMA - ContextTranslator.js
 */
window.ContextTranslator = {
    LETTERS: ["C", "D", "E", "F", "G", "A", "B"],
    GLYPHS: { sharp: "\uE262", flat: "\uE260", natural: "\uE261" },
    currentKey: "C",
    accidentalPreference: "sharp",

    setContext: function(key) {
        if (!key) return;
        this.currentKey = key;
        if (window.TheoryEngine && window.TheoryEngine.getAccidentalType) {
            this.accidentalPreference = window.TheoryEngine.getAccidentalType(key);
        }
    },

    translate: function(midi, targetLetter) {
        var pc = midi % 12;
        var octave = Math.floor(midi / 12) - 1;
        var info;

        if (targetLetter) {
            info = this._getNoteByLetter(pc, targetLetter);
        } else {
            info = this._inferNoteByContext(pc);
        }

        var visualOctave = octave;
        if (info.letter === "C" && pc === 11) visualOctave = octave + 1;
        if (info.letter === "B" && pc === 0) visualOctave = octave - 1;

        return {
            midi: midi,
            octave: octave, 
            letter: info.letter,
            accidental: info.accidental,
            glyph: this._getGlyph(info.accidental),
            absoluteY: this._calculateAbsoluteY(info.letter, visualOctave),
            fileName: this._getFileName(info.letter, info.accidental, octave)
        };
    },

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
        return (parseInt(octave) * 7) + (stepIdx === -1 ? 0 : stepIdx);
    },

    _inferNoteByContext: function(pc) {
        var sharps = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
        var flats = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
        var list = (this.accidentalPreference === "flat") ? flats : sharps;
        var res = list[pc] || "C";
        return { letter: res.charAt(0), accidental: res.substring(1) };
    },

    _getFileName: function(letter, accidental, octave) {
        var name = letter + accidental;
        // Mapeia para sustenidos para garantir que o AudioEngine encontre o arquivo físico
        var map = { "Db":"C#","Eb":"D#","Gb":"F#","Ab":"G#","Bb":"A#","Cb":"B","Fb":"E","E#":"F","B#":"C" };
        return (map[name] || name) + octave + ".mp3";
    },

    _getGlyph: function(acc) {
        var map = { "#": this.GLYPHS.sharp, "b": this.GLYPHS.flat, "n": this.GLYPHS.natural };
        return map[acc] || "";
    }
};