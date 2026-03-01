/**
 * PIANORAMA - ContextTranslator.js (v13.7)
 */
window.ContextTranslator = {
    LETTERS: ["C", "D", "E", "F", "G", "A", "B"],
    GLYPHS: { sharp: "\uE262", flat: "\uE260", natural: "\uE261" },
    currentKey: "C",
    signature: [],

    setContext: function(key, effectiveSignatureKey) {
        this.currentKey = key;
        var sigKey = effectiveSignatureKey || key;
        if (window.PIANORAMA_DATA && window.PIANORAMA_DATA.key_signatures) {
            this.signature = window.PIANORAMA_DATA.key_signatures[sigKey] || [];
        }
        var flats = ["F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb"];
        this.accidentalPreference = (flats.indexOf(sigKey) !== -1) ? "flat" : "sharp";
    },

    translate: function(midi, targetLetter) {
        var pc = midi % 12;
        var octave = Math.floor(midi / 12) - 1;
        var info = targetLetter ? this._getAccidentalForLetter(pc, targetLetter) : this._inferNoteByContext(pc);
        var noteName = info.letter + info.accidental;
        var isInSignature = this.signature.indexOf(noteName) !== -1;

        var visualOctave = octave;
        if (info.letter === "C" && pc === 11) visualOctave++;
        if (info.letter === "B" && pc === 0) visualOctave--;

        return {
            midi: midi, octave: octave, letter: info.letter, accidental: info.accidental,
            glyph: this._getGlyph(info.accidental), isInSignature: isInSignature,
            absoluteY: this._calculateAbsoluteY(info.letter, visualOctave), 
            fileName: this._getFileName(midi) // MUDANÇA: Áudio baseado no som real (MIDI)
        };
    },

    _getAccidentalForLetter: function(pc, targetLetter) {
        var naturals = { "C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11 };
        var naturalPC = naturals[targetLetter];
        var diff = pc - naturalPC;
        if (diff > 6) diff -= 12;
        if (diff < -6) diff += 12;
        var acc = "";
        if (diff === 1) acc = "#"; else if (diff === -1) acc = "b";
        else if (diff === 2) acc = "##"; else if (diff === -2) acc = "bb";
        return { letter: targetLetter, accidental: acc };
    },

    _inferNoteByContext: function(pc) {
        var sharps = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
        var flats = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
        var list = (this.accidentalPreference === "flat") ? flats : sharps;
        var res = list[pc] || "C";
        return { letter: res.charAt(0), accidental: res.substring(1) };
    },

    _calculateAbsoluteY: function(letter, octave) {
        var stepIdx = this.LETTERS.indexOf(letter);
        return (parseInt(octave) * 7) + stepIdx;
    },

    _getFileName: function(midi) {
        // Para o Áudio, não importa se é D# ou Eb, usamos o nome padrão do seu banco (Sustenidos)
        var notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
        var pc = midi % 12;
        var octave = Math.floor(midi / 12) - 1;
        return notes[pc] + octave + ".mp3";
    },

    _getGlyph: function(accidental) {
        var map = { "#": this.GLYPHS.sharp, "b": this.GLYPHS.flat, "##": "\uE263", "bb": "\uE264", "n": this.GLYPHS.natural };
        return map[accidental] || "";
    }
};