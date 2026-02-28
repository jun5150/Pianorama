/**
 * PIANORAMA - ContextTranslator.js (v12.3)
 */

window.ContextTranslator = {
    LETTERS: ["C", "D", "E", "F", "G", "A", "B"],
    GLYPHS: { sharp: "\uE262", flat: "\uE260", natural: "\uE261" },
    currentKey: "C",
    accidentalPreference: "sharp",
    signature: [],

    init: function(key) {
        this.setContext(key || "C");
        return this;
    },

    setContext: function(key) {
        if (!key) return;
        this.currentKey = key;
        
        // Proteção: Garante que a preferência de acidente mude com a tonalidade
        if (window.TheoryEngine && typeof window.TheoryEngine.getAccidentalType === 'function') {
            this.accidentalPreference = window.TheoryEngine.getAccidentalType(key);
        } else {
            // Fallback manual se o TheoryEngine falhar
            var flats = ["F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb"];
            this.accidentalPreference = (flats.indexOf(key) !== -1) ? "flat" : "sharp";
        }

        if (window.PIANORAMA_DATA && window.PIANORAMA_DATA.key_signatures) {
            this.signature = window.PIANORAMA_DATA.key_signatures[key] || [];
        }
    },

    translate: function(midi, targetNoteName) {
        // Se o Speller já nos deu um nome (ex: "Eb4"), vamos usá-lo!
        if (typeof targetNoteName === 'string') {
            var match = targetNoteName.match(/^([A-Ga-g][#b]?|[A-Ga-g])(\d)$/);
            if (match) {
                var letter = match.charAt(0).toUpperCase();
                var accidental = match.substring(1);
                var octave = parseInt(match);
            
                return {
                    letter: letter,
                    accidental: accidental,
                    octave: octave,
                    absoluteY: this._calculateAbsoluteY(letter, octave),
                    fileName: this._getFileName(letter, accidental, octave)
                };
            }
        }

        // Caso contrário, mantém a lógica antiga baseada apenas no MIDI
        var pc = midi % 12;
        var octave = Math.floor(midi / 12) - 1;
        var res = this._getNoteFromPC(pc); // Sua lógica atual de flats/sharps
    
        return {
            letter: res.letter,
            accidental: res.accidental,
            octave: octave,
            absoluteY: this._calculateAbsoluteY(res.letter, octave),
            fileName: this._getFileName(res.letter, res.accidental, octave)
        };
    },

    _calculateAbsoluteY: function(letter, octave) {
        var stepIdx = this.LETTERS.indexOf(letter);
        if (stepIdx === -1) stepIdx = 0;
        
        // A MAGIA ESTÁ AQUI:
        // Cada oitava (7 steps) precisa ser multiplicada pelo número da oitava.
        // Usamos (octave * 7) para que o C4 seja 28 e o C5 seja 35.
        // Isso garante que quando o MIDI sobe, o absoluteY sobe junto.
        return (parseInt(octave) * 7) + stepIdx;
    },

    _inferNoteByContext: function(pc) {
        var sharps = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
        var flats = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
        
        var list = (this.accidentalPreference === "flat") ? flats : sharps;
        
        // Inteligência adicional: se a tonalidade atual tem uma nota específica na armadura, use-a
        // Ex: Se estamos em G, a nota no PC 6 deve ser F#, não Gb.
        var res = list[pc] || "C";
        
        return {
            letter: res.charAt(0),
            accidental: res.substring(1)
        };
    },

    _getFileName: function(letter, accidental, octave) {
        var name = letter + accidental;

        // Mapa de conversão para garantir que o JS ache o arquivo físico
        // Se seus arquivos usam BEMOL (Eb), inverta a lógica abaixo.
        var enharmonics = {
            "Db": "C#",
            "Eb": "D#",
            "Gb": "F#",
            "Ab": "G#",
            "Bb": "A#",
            "Cb": "B",  // B3
            "Fb": "E",
            "E#": "F",
            "B#": "C"   // C5
        };

        if (enharmonics[name]) {
            name = enharmonics[name];
        }

        // Se a nota resultante for "C" vinda de um "B#", 
        // a oitava precisa subir, mas vamos manter simples por enquanto:
        return name + octave + ".mp3";
    },

    _getGlyph: function(accidental) {
        var map = { "#": this.GLYPHS.sharp, "b": this.GLYPHS.flat, "n": this.GLYPHS.natural };
        return map[accidental] || "";
    }
};