/**
 * PIANORAMA - ContextTranslator.js (v12.2)
 * Tradutor de MIDI para Notação Visual.
 * Versão robusta: Sem ES6, sem Template Strings, compatibilidade total.
 */

window.ContextTranslator = {
    LETTERS: ["C", "D", "E", "F", "G", "A", "B"],
    GLYPHS: { sharp: "\uE262", flat: "\uE260", natural: "\uE261", noteBlack: "\uE0A4" },
    currentKey: "C",
    accidentalPreference: "sharp",
    signature: [],

    /**
     * Inicializa o contexto musical.
     */
    init: function(key) {
        var targetKey = key || "C";
        this.setContext(targetKey);
        return this;
    },

    setContext: function(key) {
        this.currentKey = key;
        // Acesso defensivo aos motores globais de teoria
        if (window.TheoryEngine && typeof window.TheoryEngine.getAccidentalType === 'function') {
            this.accidentalPreference = window.TheoryEngine.getAccidentalType(key);
        }
        if (window.PIANORAMA_DATA && window.PIANORAMA_DATA.key_signatures) {
            this.signature = window.PIANORAMA_DATA.key_signatures[key] || [];
        }
    },

    /**
     * Função PÚBLICA exigida pelo ChordGenerator e AtlasEngine.
     * @param {Object} note - Objeto contendo {letter, octave}
     * @returns {number} - Posição vertical absoluta na pauta.
     */
    getAbsoluteY: function(note) {
        if (!note || !note.letter) return 0;
        return this._calculateAbsoluteY(note.letter, note.octave);
    },

    /**
     * Traduz um valor MIDI para um objeto de nota completo para o RenderEngine.
     */
    translate: function(midi, targetLetter) {
        var pc = midi % 12;
        var octave = Math.floor(midi / 12) - 1;
        
        var info;
        if (targetLetter) {
            info = this._getAccidentalForLetter(pc, targetLetter);
        } else {
            info = this._inferNoteByContext(pc);
        }

        var visualOctave = octave;
        // Correção de oitava visual para evitar saltos na pauta (Ex: B3 para C4)
        if (info.letter === "C" && pc > 6) visualOctave = octave + 1;
        if (info.letter === "B" && pc < 6) visualOctave = octave - 1;

        var absY = this._calculateAbsoluteY(info.letter, visualOctave);

        return {
            midi: midi,
            octave: octave, 
            letter: info.letter,
            accidental: info.accidental,
            glyph: this._getGlyph(info.accidental),
            absoluteY: absY, 
            fileName: this._getFileName(info.letter, info.accidental, octave)
        };
    },

    /**
     * Lógica interna de cálculo de posição vertical.
     * Referência: Octave 4 (C4) é o ponto de partida.
     */
    _calculateAbsoluteY: function(letter, octave) {
        var stepIdx = this.LETTERS.indexOf(letter);
        if (stepIdx === -1) stepIdx = 0;
        // Normaliza para que a oitava 4 seja o centro da pauta
        return ((parseInt(octave) - 4) * 7) + stepIdx;
    },

    _inferNoteByContext: function(pc) {
        var sharps = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
        var flats = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
        
        var list = (this.accidentalPreference === "flat") ? flats : sharps;
        var raw = list[pc] || "C";

        return {
            letter: raw.charAt(0),
            accidental: raw.substring(1)
        };
    },

    _getAccidentalForLetter: function(pc, targetLetter) {
        var letterBaseMap = { "C":0, "D":2, "E":4, "F":5, "G":7, "A":9, "B":11 };
        var basePc = letterBaseMap[targetLetter.toUpperCase()] || 0;
        var diff = pc - basePc;
        
        if (diff > 9) diff -= 12;
        if (diff < -9) diff += 12;

        var accMap = { "0": "", "1": "#", "2": "##", "-1": "b", "-2": "bb" };
        var diffStr = diff.toString();

        return {
            letter: targetLetter.toUpperCase(),
            accidental: accMap[diffStr] || ""
        };
    },

    _getGlyph: function(accidental) {
        var map = { 
            "#": this.GLYPHS.sharp, 
            "b": this.GLYPHS.flat, 
            "##": "\uE263", 
            "bb": "\uE264", 
            "n": this.GLYPHS.natural 
        };
        return map[accidental] || "";
    },

    _getFileName: function(letter, accidental, octave) {
        var name = letter + accidental;
        if (window.PIANORAMA_DATA && window.PIANORAMA_DATA.enharmonics) {
            var conversion = window.PIANORAMA_DATA.enharmonics.conversion_map[name];
            if (conversion) name = conversion;
        }
        return name + octave + ".mp3";
    }
};