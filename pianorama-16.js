/**
 * NÃO REMOVA COMENTÁRIOS NEM A SEPARAÇÃO COM TÍTULOS E NOMES DE ARQUIVOS!!!
 */

/**
 * PIANORAMA ENGINE (CONSOLIDATED VERSION)
 * Musical Engine (ES5 Legacy-friendly and Offline)
 * v3.0
 * WIP: code optimization, UI and some fixes
 */



/**
 * PIANORAMA - Config.js
 * Customization
 */

window.PIANORAMA_CONFIG = {
    audio: {
        volume: 1,        // Volume master (0 a 1)
        sustain: 2.0,     // Duração do som em segundos (quanto menor, mais curto/staccato)
        release: 0.15     // Tempo de desvanecimento para evitar estalos (fade-out)
    },
    playback: {
        baseDelay: 250,   // Miliseconds between notes in short scales/chords
        longDelay: 450,   // Miliseconds between notes in long scales/chords
        bpm: 120          // Default BPM
    }
};



/*
 * AudioData.js
 * Base64 FluidR3 mp3 piano sounds (only flats, e.g., Eb4 and not Ds4)
 */
function incluirAudioData(url, callback) {
    var script = document.createElement('script');
    script.src = url;
    script.type = 'text/javascript';
    
    script.onload = function() {
        console.log('AudioData carregado!');
        if (callback) callback(); // Só inicia o app quando o áudio chegar
    };

    script.onerror = function() {
        console.error('Erro crítico: Não foi possível carregar os sons.');
    };

    document.getElementsByTagName('head')[0].appendChild(script);
}

// 2. No final do seu código, mude o listener de inicialização:
window.addEventListener('DOMContentLoaded', function() {
    // Primeiro carrega o áudio, e quando terminar, inicia o App
    incluirAudioData('assets/audio/AudioData.js', function() {
        window.App.init(); 
    });
});



/**
 * @typedef {Object} NoteObject
 * @property {number} midi - Valor MIDI da nota
 * @property {number} octave - Oitava real
 * @property {string} letter - Letra (C, D, E...)
 * @property {string} accidental - Acidente (#, b, ##, bb, n)
 * @property {string} glyph - Caractere Bravura correspondente
 * @property {boolean} isInSignature - Se a nota pertence à armadura atual
 * @property {number} absoluteY - Posição vertical na pauta
 * @property {string} fileName - Nome do arquivo de áudio (Ex: Eb4.mp3)
 */



/**
 * TheoryMaps.js
 * 
 */
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



/**
 * Scales.js
 * 
 */
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



/**
 * Chords.js
 * 
 */
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



/**
 * Pedagogy.js
 * 
 */
window.PEDAGOGY = {
    pedagogy: {
        fingerings: {
            "RH_standard":[1,2,3,1,2,3,4,5],
            "LH_standard":[5,4,3,2,1,3,2,1],
            "exceptions":{"F_RH":[1,2,3,4,1,2,3,4],"Bb_RH":[4,1,2,3,1,2,3,4],"Eb_RH":[3,1,2,3,4,1,2,3]}
        },
        progressions:[
            {"name":"ii-V-I Jazz","degrees":["ii","V","I"],"style":"Jazz"},
            {"name":"I-V-vi-IV Pop","degrees":["I","V","vi","IV"],"style":"Pop"}
        ]
    },
    rhythm: {
        "time_signatures":["2/4","3/4","4/4","6/8","12/8"],
        "subdivisions":["quarter","eighth","sixteenth","thirty-second"],
        "style":["straight","swing"]
    }
};



/**
 * Database.js
 * 
 */
window.PIANORAMA_DATA = {
    config: {
        version: "4.5",
        pitch_reference: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
        piano_range: {
            central_octave: 4,
            sweet_spot_chords: [3, 4, 5],
            midi_limits: {"min": 21, "max": 108}
        }
    },
    // Teoria
    enharmonics: THEORY_MAPS.enharmonics,
    relative_map: THEORY_MAPS.relative_map,
    key_signatures: THEORY_MAPS.key_signatures,
    note_to_degree: THEORY_MAPS.note_to_degree,
    
    // Escalas
    intervals: SCALES.intervals,
    scale_library: SCALES.library,
    
    // Acordes
    chord_formulas: CHORDS.formulas,
    harmonic_fields: CHORDS.harmonic_fields,
    functions_advanced: CHORDS.functions_advanced,
    chord_inversions: CHORDS.inversions,
    blues_penta_chords: CHORDS.blues_penta_chords,
    
    // Outros
    pedagogy: PEDAGOGY.pedagogy,
    rhythm: PEDAGOGY.rhythm
};



/**
 * PIANORAMA - ContextTranslator.js
 * 
 */
window.ContextTranslator = {
    LETTERS: ["C", "D", "E", "F", "G", "A", "B"],
    GLYPHS: { sharp: "\uE262", flat: "\uE260", natural: "\uE261" },
    currentKey: "C",
    signature: [],

    /**
     * Define o contexto tonal para tradução de notas.
     * @param {string} key - Tônica
     * @param {string} effectiveSignatureKey - Chave da armadura
     */
    setContext: function(key, effectiveSignatureKey) {
        this.currentKey = key;
        var sigKey = effectiveSignatureKey || key;
        if (window.PIANORAMA_DATA && window.PIANORAMA_DATA.key_signatures) {
            this.signature = window.PIANORAMA_DATA.key_signatures[sigKey] || [];
        }
        var flats = ["F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb"];
        this.accidentalPreference = (flats.indexOf(sigKey) !== -1) ? "flat" : "sharp";
    },

   /**
    * Traduz um MIDI para um objeto de nota rico.
    * @param {number} midi 
    * @param {string} [targetLetter] - Força uma letra específica (para escalas)
    * @returns {NoteObject}
    */
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

    _normalizeNoteName: function(name) {
        var toFlats = { 
            "C#": "Db", "D#": "Eb", "F#": "Gb", "G#": "Ab", "A#": "Bb",
            "Db": "Db", "Eb": "Eb", "Gb": "Gb", "Ab": "Ab", "Bb": "Bb" 
        };
        var notePart = name.replace(/[0-9].*$/, "");
        var octavePart = name.replace(/^[A-G][#b]?/, "");
        var normalizedNote = toFlats[notePart] || notePart;
        return normalizedNote + octavePart;
    },

    _getFileName: function(midi) {
        var notes = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
        var pc = midi % 12;
        var octave = Math.floor(midi / 12) - 1;
        return notes[pc] + octave + ".mp3";
    },

    _getGlyph: function(accidental) {
        var map = { "#": this.GLYPHS.sharp, "b": this.GLYPHS.flat, "##": "\uE263", "bb": "\uE264", "n": this.GLYPHS.natural };
        return map[accidental] || "";
    }
};



/**
 * PIANORAMA - SequenceBuilder.js
 * Builds linear flow of notes with octave intelligence.
 */

window.SequenceBuilder = {
    /**
     * Modelo x2: Escala Principal + Pausa + Escala Relativa.
     */
    createModelX2: function(baseKey, type) {
        var scaleType = type || "major"; // Fallback para o tipo
        
        // 1. Escala Principal (Tônica na 4 e Baixo na 2)
        // Usamos var para compatibilidade total com motores antigos
        var mainTreble = window.ScaleGenerator.generateScale(baseKey + "4", scaleType);
        var mainBass = window.ScaleGenerator.generateScale(baseKey + "2", scaleType);

        // 2. Busca a relativa através do TheoryEngine robusto
        var relKey = window.TheoryEngine.getRelativeKey(baseKey, scaleType);
        var relType = window.TheoryEngine.getRelativeScaleType(scaleType);

        // --- INTELIGÊNCIA DE OITAVA (A CURA) ---
        // Padrão: Escala relativa na oitava 4 para visibilidade ideal na pauta
        var targetOctave = "4"; 
        
        // Ex: Se for C maior, a relativa A menor deve soar em A4 para não ficar "escondida"
        if (baseKey === "C" && relKey === "A") {
            targetOctave = "4";
        }

        var relTreble = window.ScaleGenerator.generateScale(relKey + targetOctave, relType);
        
        // Se a escala na oitava 4 falhar (ex: falta de amostras no AudioData), tenta a oitava 3
        if (!relTreble || relTreble.length === 0) {
            relTreble = window.ScaleGenerator.generateScale(relKey + "3", relType);
        }

        var relBass = window.ScaleGenerator.generateScale(relKey + "2", relType);

        // 3. Fusão com tratamento de pausas (null)
        // O concat é excelente e universal para juntar os arrays
        if (relTreble && relTreble.length > 0) {
            var pause = [null]; // Representa o silêncio visual e sonoro entre escalas
            
            return {
                treble: mainTreble.concat(pause, relTreble),
                bass: mainBass.concat(pause, relBass)
            };
        }

        // Caso a relativa falhe por algum motivo, retorna apenas a principal para não travar a UI
        return { 
            treble: mainTreble || [], 
            bass: mainBass || [] 
        };
    }
};



/**
 * PIANORAMA - TheoryCore.js
 * Basic mathematics of intervals and formulas.
 */
window.TheoryEngine = window.TheoryEngine || {};

(function(TE) {
    TE.getAccidentalType = function(key) {
        if (!key) return "sharp";
        var flats = ["F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb"];
        return (flats.indexOf(key) !== -1) ? "flat" : "sharp";
    };

    TE.getScaleFormula = function(type) {
        if (!window.SCALES || !window.SCALES.library) return [];
        var lib = window.SCALES.library;
        for (var cat in lib) {
            if (lib[cat][type]) return lib[cat][type].intervals || lib[cat][type];
        }
        return [];
    };

    TE.getChordFormula = function(type) {
        if (!window.CHORDS || !window.CHORDS.formulas) return [];
        var f = window.CHORDS.formulas;
        return f.triads[type] || f.sevenths[type] || f.extensions[type] || [];
    };
})(window.TheoryEngine);



/**
 * PIANORAMA - TheoryAnalyzer.js (v14.1)
 * 
 */
window.TheoryEngine = window.TheoryEngine || {};

(function(TE) {
    // 1. Calcula a armadura real baseada no modo
    TE.getEffectiveSignature = function(key, scaleType) {
        if (!scaleType) return key;

        var modeOffsets = {
            "ionian": 0, "major": 0,
            "dorian": 2, "phrygian": 4, "lydian": 5,
            "mixolydian": 7, "aeolian": 9, "minor_natural": 9, "locrian": 11
        };

        var offset = modeOffsets[scaleType];
        if (offset !== undefined) {
            var notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
            var normalizedKey = key.replace('Db','C#').replace('Eb','D#').replace('Gb','F#').replace('Ab','G#').replace('Bb','A#');
            var rootMidi = notes.indexOf(normalizedKey);
            if (rootMidi === -1) rootMidi = 0;
            
            var targetMidi = (rootMidi - offset + 12) % 12;
            var targetKey = notes[targetMidi];
            
            var flatKeys = ["F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb"];
            if (flatKeys.indexOf(key) !== -1 || key === 'F') {
                var toFlats = {"C#":"Db", "D#":"Eb", "F#":"Gb", "G#":"Ab", "A#":"Bb"};
                targetKey = toFlats[targetKey] || targetKey;
            }
            return targetKey;
        }
        return key;
    };

    // 2. Retorna o nome do grau (I, ii, iii...) - RE-ADICIONADO
    TE.getDegreeName = function(index, scaleType) {
        var degrees = ["I", "II", "III", "IV", "V", "VI", "VII"];
        var label = degrees[index] || "?";
        var type = "maj"; 

        var field = (window.CHORDS && window.CHORDS.harmonic_fields) ? 
                    (window.CHORDS.harmonic_fields[scaleType] || window.CHORDS.harmonic_fields["major"]) : 
                    null;

        if (field) {
            // Converte índice numérico para o romano correspondente no mapa de campo harmônico
            var keys = Object.keys(field);
            var currentKey = keys[index];
            if (currentKey) {
                var info = field[currentKey];
                label = currentKey;
                if (info.chord.indexOf("m") === 0) type = "min";
                if (info.chord.indexOf("dim") > -1 || info.chord.indexOf("°") > -1) type = "dim";
                if (info.chord.indexOf("aug") > -1 || info.chord.indexOf("+") > -1) type = "aug";
            }
        }
        return { degree: label, type: type };
    };

    // 3. Retorna a tonalidade relativa - RE-ADICIONADO
    TE.getRelativeKey = function(key, targetType) {
        if (!window.PIANORAMA_DATA || !window.PIANORAMA_DATA.relative_map) return key;
        if (targetType === "major") {
            for (var major in window.PIANORAMA_DATA.relative_map) {
                if (window.PIANORAMA_DATA.relative_map[major] === key) return major;
            }
        }
        return window.PIANORAMA_DATA.relative_map[key] || key;
    };

    // 4. Alterna entre tipo de escala maior/menor - RE-ADICIONADO
    TE.getRelativeScaleType = function(type) {
        if (type === "major") return "minor_natural";
        if (type === "minor_natural") return "major";
        return type;
    };

})(window.TheoryEngine);



/**
 * PIANORAMA - TheoryCatalog.js
 * Libraries scanning for menu/UI population.
 */
window.TheoryEngine = window.TheoryEngine || {};

(function(TE) {
    TE.getMenuCatalog = function() {
        var catalog = [];
        if (window.SCALES && window.SCALES.library) {
            var lib = window.SCALES.library;
            for (var cat in lib) {
                if (!lib.hasOwnProperty(cat)) continue;
                for (var key in lib[cat]) {
                    var item = lib[cat][key];
                    var label = (typeof item === 'object' && item.name) ? item.name : 
                                key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
                    catalog.push({ id: "scale:" + key, name: label });
                }
            }
        }
        if (window.CHORDS && window.CHORDS.harmonic_fields) {
            for (var fKey in window.CHORDS.harmonic_fields) {
                var fLabel = fKey.charAt(0).toUpperCase() + fKey.slice(1).replace(/_/g, ' ');
                catalog.push({ id: "field:\"" + fKey, name: fLabel });
            }
        }
        return catalog;
    };
})(window.TheoryEngine);



/**
 * PIANORAMA - AudioEngine.js
 * Audio engine
 */
window.AudioEngine = {
    cache: new Map(),
    decodedCache: new Map(),
    ctx: null,
    masterGain: null,

    /**
     * Inicializa o contexto de áudio. 
     * Chamado via interação do usuário para contornar bloqueios de autoplay.
     */
    init: function() {
        if (!this.ctx) {
            // Suporte para WebkitAudioContext (Safari antigo/iOS)
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            
            // Volume vindo das configurações globais
            var volume = (window.PIANORAMA_CONFIG && window.PIANORAMA_CONFIG.audio) 
                         ? window.PIANORAMA_CONFIG.audio.volume 
                         : 0.5;
            
            this.masterGain.gain.value = volume;
            this.masterGain.connect(this.ctx.destination);
        }
        
        // Retoma o contexto caso o navegador o tenha suspendido
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    /**
     * Converte string Base64 em ArrayBuffer binário.
     */
    _base64ToArrayBuffer: function(base64) {
        // Remove o cabeçalho "data:audio/mp3;base64," se existir
        var base64String = base64.indexOf(',') > -1 ? base64.split(',')[1] : base64;
        var binaryString = window.atob(base64String);
        var len = binaryString.length;
        var bytes = new Uint8Array(len);
        
        for (var i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    },

    /**
     * Prepara buffers de áudio.
     * @param {string[]} fileNames 
     * @param {function} callback 
     */
    preloadFiles: async function(folder, fileNames) {
        var self = this;
        if (!window.PIANORAMA_SAMPLES) {
            setTimeout(function() { self.preloadFiles(folder, fileNames); }, 100);
            return;
        }

        fileNames.forEach(function(name) {
            var cleanName = name.trim();
            // REMOVIDO: A lógica complexa de replaces que gerava Gb#
            // O cleanKey agora busca exatamente o que o banco Base64 possui
            var cleanKey = cleanName.replace('.mp3', ''); 

            if (self.cache.has(cleanName)) return;

            var base64Data = window.PIANORAMA_SAMPLES[cleanKey];
            if (base64Data) {
                var buffer = self._base64ToArrayBuffer(base64Data);
                self.cache.set(cleanName, buffer);
            }
        });
    },

    /**
     * Toca o arquivo a partir do cache de buffers.
     */
    playFile: async function(folder, fileName) {
        this.init(); 
        // Normaliza o nome para garantir que Eb4 vire D#4 antes de buscar no cache
        var cleanName = fileName.replace('.mp3', '');
        var normalizedKey = window.ContextTranslator._normalizeNoteName(cleanName);
        var nameWithExt = normalizedKey + ".mp3";

        if (this.decodedCache.has(nameWithExt)) {
            this._sourcePlay(this.decodedCache.get(nameWithExt));
            return;
        }

        if (this.cache.has(nameWithExt)) {
            var rawBuffer = this.cache.get(nameWithExt);
            var self = this;
            this.ctx.decodeAudioData(rawBuffer.slice(0), function(decoded) {
                self.decodedCache.set(nameWithExt, decoded);
                self._sourcePlay(decoded);
            });
        } else {
            console.warn("AudioEngine: Amostra não encontrada:", nameWithExt);
        }
    },

    /**
     * Cria o nó de áudio, aplica o envelope de volume e toca.
     */
    _sourcePlay: function(buffer, time) {
        var source = this.ctx.createBufferSource();
        var gainNode = this.ctx.createGain();
        source.buffer = buffer;

        var now = time || this.ctx.currentTime;
    
        var sustain = 3.5; 
        var release = 0.5;

        if (window.PIANORAMA_CONFIG && window.PIANORAMA_CONFIG.audio) {
            sustain = window.PIANORAMA_CONFIG.audio.sustain || 3.5;
            release = window.PIANORAMA_CONFIG.audio.release || 0.5;
        }

        // --- LÓGICA DE CORPO (PUNCH) ---
        // Fazemos a nota ficar no volume máximo (1.0) por 40% do tempo de sustain.
        // Isso evita a "fraqueza" na primeira nota e dá corpo ao piano.
        var peakDuration = sustain * 0.4; 

        // 1. Início imediato no volume máximo
        gainNode.gain.setValueAtTime(1.0, now);
    
        // 2. MANTÉM o volume em 1.0 até o fim do peakDuration
        gainNode.gain.setValueAtTime(1.0, now + peakDuration);
    
        // 3. Só agora inicia o decaimento exponencial suave até o fim
        // Usamos now + sustain + release para a curva total
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + sustain + release);

        source.connect(gainNode);
        gainNode.connect(this.masterGain);
    
        source.start(now);
        // Para o som um pouco depois do envelope acabar para evitar cliques
        source.stop(now + sustain + release + 0.1);
    }
};



/**
 * PIANORAMA - RenderConfig.js
 */
window.RenderConfig = {
    lineSp: 10,
    fontSize: 45,
    accSize: 32,
    clefSize: 40,
    braceSize: 160,
    staffGap: 80,
    stemHeight: 32,
    timeSize: 42,
    BRACE_X_OFFSET: -18,
    BRACE_Y_OFFSET: 80, 
    NOTE_X_START: 195,
    TIME_GLYPHS: { "0":"\uE080","1":"\uE081","2":"\uE082","3":"\uE083","4":"\uE084","5":"\uE085","6":"\uE086","7":"\uE087","8":"\uE088","9":"\uE089" },
    KEY_MAP: {
        "C": [], "G": ["F"], "D": ["F", "C"], "A": ["F", "C", "G"], "E": ["F", "C", "G", "D"], 
        "B": ["F", "C", "G", "D", "A"], "F#": ["F", "C", "G", "D", "A", "E"], "C#": ["F", "C", "G", "D", "A", "E", "B"],
        "G#": ["F", "C", "G", "D", "A", "E", "B", "F"], "D#": ["F", "C", "G", "D", "A", "E", "B", "F", "C"], // Suporte a tons teóricos
        "F": ["B"], "Bb": ["B", "E"], "Eb": ["B", "E", "A"], "Ab": ["B", "E", "A", "D"], 
        "Db": ["B", "E", "A", "D", "G"], "Gb": ["B", "E", "A", "D", "G", "C"], "Cb": ["B", "E", "A", "D", "G", "C", "F"]
    }
};



/**
 * PIANORAMA - RenderSystem.js
 * 
 */
window.RenderSystem = {
    drawStaff: function(ctx, xStart, xEnd, yBase, config) {
        var cfg = window.RenderConfig;
        ctx.lineWidth = 1; 
        ctx.strokeStyle = config.color || "#000";
        for (var i = 0; i < 5; i++) {
            var y = Math.floor(yBase + (i * cfg.lineSp)) + 0.5;
            ctx.beginPath(); ctx.moveTo(xStart, y); ctx.lineTo(xEnd, y); ctx.stroke();
        }
        var clefGlyph = (config.clef === "bass") ? '\uE062' : '\uE050';
        var clefOffset = (config.clef === "bass") ? cfg.lineSp : 3 * cfg.lineSp;
        this._fill(ctx, xStart + 10, yBase + clefOffset, clefGlyph, cfg.clefSize, config.color);

        if (config.accidentalMode !== "notes") {
            var keyToDraw = config.effectiveKey || config.key || "C";
            this._drawKeySignature(ctx, xStart + 45, yBase, config.clef, keyToDraw, config.color);
        }
        if (config.time) {
            this._drawTimeSignature(ctx, xStart + 145, yBase, config.time, config.color);
        }
    },

    _drawKeySignature: function(ctx, x, y, clef, key, col) {
        var sig = window.RenderConfig.KEY_MAP[key] || [];
        var isSharp = ["G","D","A","E","B","F#","C#","G#","D#"].indexOf(key) !== -1;
    
        // PATTERN CALIBRADO: Valores aumentados em 2 para subir na pauta
        var pat = isSharp 
            ? (clef==="treble"?[10,7,11,8,5,9,6]:[8,5,9,6,3,7,4]) 
            : (clef==="treble"?[6,9,5,8,4,7,3]:[4,7,3,6,2,5,1]);

        for (var i = 0; i < sig.length; i++) {
            // O multiplicador 5 garante o alinhamento linha/espaço
            var yP = y + 40 - (pat[i] * 5); 
            this._fill(ctx, x + (i * 12), yP, isSharp ? '\uE262' : '\uE260', 32, col);
        }
    },

    _drawBrace: function(ctx, x, yTop, yBottomBase, color) {
        var cfg = window.RenderConfig;
        var totalBottom = yBottomBase + 40;
        var targetY = ((yTop + totalBottom) / 2) + cfg.BRACE_Y_OFFSET;
        this._fill(ctx, x + cfg.BRACE_X_OFFSET, targetY, '\uE000', cfg.braceSize, color);
    },

    _drawTimeSignature: function(ctx, x, yBase, timeStr, color) {
        var cfg = window.RenderConfig;
        var p = timeStr.split("/");
        this._fill(ctx, x, yBase + 10, cfg.TIME_GLYPHS[p[0]] || p[0], cfg.timeSize, color);
        this._fill(ctx, x, yBase + 30, cfg.TIME_GLYPHS[p[1]] || p[1], cfg.timeSize, color);
    },

    _fill: function(ctx, x, y, char, size, color) {
        ctx.fillStyle = color || "black";
        ctx.font = size + "px Bravura";
        ctx.textBaseline = "middle";
        ctx.fillText(char, x, y);
    }
};



/**
 * PIANORAMA - RenderNotation.js
 * 
 */
window.RenderNotation = {
    drawNote: function(ctx, x, yBase, noteObj, config) {
        if (!noteObj) return;
        var clef = config.clef || "treble";
        
        if (Array.isArray(noteObj)) {
            var min = 100, max = 0;
            noteObj.forEach(n => { min = Math.min(min, n.absoluteY); max = Math.max(max, n.absoluteY); });
            this._drawLedgers(ctx, x, yBase, min, max, clef, config.color);
            noteObj.forEach(n => this._drawNoteHead(ctx, x, yBase, n, config));
        } else {
            this._drawLedgers(ctx, x, yBase, noteObj.absoluteY, noteObj.absoluteY, clef, config.color);
            this._drawNoteHead(ctx, x, yBase, noteObj, config);
        }
    },

    _drawNoteHead: function(ctx, x, yBase, noteObj, config) {
        var anchor = (config.clef === "bass") ? 18 : 30; 
        var yPos = (yBase + 40) - ((noteObj.absoluteY - anchor) * 5);
    
        this._drawStem(ctx, x, yPos, noteObj.absoluteY, config.clef, config.color);
        this._fill(ctx, x, yPos, '\uE0A4', 45, config.color);

        var mode = config.accidentalMode || "both"; 
        var showAccidental = false;

        if (noteObj.accidental) {
            if (mode === "both" || mode === "notes") {
                showAccidental = true; 
            } else if (mode === "signature") {
                // No modo Pro, se a nota tem acidente mas o nome (Ex: F#) 
                // já está na armadura, não desenha o símbolo ao lado da nota.
                showAccidental = !noteObj.isInSignature;
            }
        }

        if (showAccidental) {
            this._fill(ctx, x - 16, yPos, noteObj.glyph, 32, config.color);
        }
    },

    _drawStem: function(ctx, x, yH, absY, clef, color) {
        ctx.lineWidth = 1.2; ctx.strokeStyle = color || "#000";
        var isDown = absY >= (clef === "bass" ? 22 : 34); 
        var xL = Math.floor(x) + 0.5;
        ctx.beginPath();
        if (isDown) { ctx.moveTo(xL + 1, yH + 4); ctx.lineTo(xL + 1, yH + 36); } 
        else { ctx.moveTo(xL + 12, yH - 4); ctx.lineTo(xL + 12, yH - 36); }
        ctx.stroke();
    },

    _drawLedgers: function(ctx, x, yBase, min, max, clef, color) {
        ctx.lineWidth = 1; ctx.strokeStyle = color || "#000";
        var anchor = (clef === "bass") ? 18 : 30;
        var vBase = yBase + 40;
        var xS = Math.floor(x - 6) + 0.5;
        var xE = Math.floor(x + 19) + 0.5;

        if (min <= anchor - 2) {
            for (var i = anchor - 2; i >= min; i -= 2) {
                var y = Math.floor(vBase - ((i - anchor) * 5)) + 0.5;
                ctx.beginPath(); ctx.moveTo(xS, y); ctx.lineTo(xE, y); ctx.stroke();
            }
        }
        if (max >= anchor + 12) {
            for (var j = anchor + 12; j <= max; j += 2) {
                var y2 = Math.floor(vBase - ((j - anchor) * 5)) + 0.5;
                ctx.beginPath(); ctx.moveTo(xS, y2); ctx.lineTo(xE, y2); ctx.stroke();
            }
        }
    },

    drawLabels: function(ctx, xStart, yBase, labels, config) {
        if (!labels) return;
        var yP = yBase + 40 + 80 + 40 + 25; 
        ctx.fillStyle = config.color || "#666";
        ctx.font = "bold 13px Arial, sans-serif";
        ctx.textAlign = "center"; ctx.textBaseline = "top";
        for (var i = 0; i < labels.length; i++) {
            if (labels[i]) ctx.fillText(labels[i], xStart + (i * 45) + 6, yP);
        }
    },

    _fill: function(ctx, x, y, char, size, color) {
        ctx.fillStyle = color || "black";
        ctx.font = size + "px Bravura";
        ctx.textBaseline = "middle";
        ctx.fillText(char, x, y);
    }
};



/**
 * PIANORAMA - RenderEngine.js
 * Drawing orchestrator, connects System and Notation.
 */
window.RenderEngine = {
    drawSystem: function(ctx, xStart, xEnd, yBase, config) {
        var cfg = window.RenderConfig;
        if (!cfg || !window.RenderSystem) {
            console.error("RenderEngine: RenderConfig ou RenderSystem não encontrados.");
            return xStart;
        }

        var secondStaffY = yBase + 40 + cfg.staffGap;
        
        // Desenha as pautas usando o System
        window.RenderSystem.drawStaff(ctx, xStart, xEnd, yBase, {
            key: config.key,
            effectiveKey: config.effectiveKey,
            accidentalMode: config.accidentalMode,
            time: config.time,
            color: config.color,
            clef: "treble"
        });

        window.RenderSystem.drawStaff(ctx, xStart, xEnd, secondStaffY, {
            key: config.key,
            effectiveKey: config.effectiveKey,
            accidentalMode: config.accidentalMode,
            time: config.time,
            color: config.color,
            clef: "bass"
        });

        // Desenha a chave lateral (Brace)
        window.RenderSystem._drawBrace(ctx, xStart, yBase, secondStaffY, config.color);

        // Linha inicial do sistema
        ctx.lineWidth = 1; 
        ctx.strokeStyle = config.color || "#000";
        var xBar = Math.floor(xStart) + 0.5;
        ctx.beginPath(); 
        ctx.moveTo(xBar, yBase); 
        ctx.lineTo(xBar, secondStaffY + 40); 
        ctx.stroke();

        this._drawFinalBarline(ctx, xEnd, yBase, secondStaffY, config.color);

        return xStart + cfg.NOTE_X_START; 
    },

    drawNote: function(ctx, x, yBase, noteObj, config) {
        if (window.RenderNotation) {
            window.RenderNotation.drawNote(ctx, x, yBase, noteObj, config);
        }
    },

    drawLabels: function(ctx, xStart, yBase, labels, config) {
        if (window.RenderNotation) {
            window.RenderNotation.drawLabels(ctx, xStart, yBase, labels, config);
        }
    },

    _drawFinalBarline: function(ctx, x, yTop, yBottomBase, color) {
        var xBar = Math.floor(x) + 0.5;
        ctx.strokeStyle = color || "#000";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(xBar - 6, yTop); ctx.lineTo(xBar - 6, yBottomBase + 40); ctx.stroke();
        ctx.lineWidth = 3.5;
        ctx.beginPath(); ctx.moveTo(xBar, yTop); ctx.lineTo(xBar, yBottomBase + 40); ctx.stroke();
    }
};



/**
 * PIANORAMA - LayerProcessors.js
 * Provides the building blocks for AtlasEngine.
 */
window.LayerProcessors = {
    /**
     * Gera os dados básicos de uma escala.
     */
    generateScaleData(key, type, octaveTreble = "4", octaveBass = "2") {
        return {
            treble: ScaleGenerator.generateScale(key + octaveTreble, type),
            bass: ScaleGenerator.generateScale(key + octaveBass, type)
        };
    },

    /**
     * Gera o Campo Harmônico para um array de notas existente.
     * Útil para mapear tanto a principal quanto a relativa de forma contínua.
     */
    generateChordLayer(noteArray, chordType = "maj", grammarKey = "C") {
        return noteArray.map(n => {
            if (!n) return null; // Respeita as pausas do fluxo linear
            return ChordGenerator.generateChord(
                n.letter + (n.accidental || "") + n.octave, 
                chordType, 
                grammarKey
            );
        });
    }
};



/**
 * PIANORAMA - ScaleGenerator.js
 * Interval Intelligence, correctly skips letters in non-heptatonic scales (Pentas).
 */
window.ScaleGenerator = {
    generateScale: function(rootWithOctave, type, effectiveSignature) {
        var match = rootWithOctave.match(/^([A-Ga-g][#b]?|[A-Ga-g])(\d)$/);
        if (!match) return [];

        var rootKeyFull = match[1];
        var rootLetterBase = rootKeyFull.charAt(0).toUpperCase();
        var startOctave = parseInt(match[2]);
        
        var letters = ["C", "D", "E", "F", "G", "A", "B"];
        var currentLetterIdx = letters.indexOf(rootLetterBase);

        // Define o contexto de armadura
        window.ContextTranslator.setContext(rootKeyFull, effectiveSignature);

        var intervals = window.TheoryEngine.getScaleFormula(type);
        var baseMidi = this._getMidi(rootKeyFull, startOctave);

        var lastInterval = 0;

        return intervals.map(function(interval, index) {
            if (index > 0) {
                var semitonesSinceLast = interval - lastInterval;
                
                // LÓGICA DE SALTO DE LETRA:
                // Se o intervalo entre as notas for de 3 semitões ou mais (terça menor/maior),
                // pulamos 2 posições no alfabeto (ex: C -> E).
                // Se for 1 ou 2 semitões (segunda), pulamos apenas 1 posição (ex: C -> D).
                if (semitonesSinceLast >= 3) {
                    currentLetterIdx += 2;
                } else {
                    currentLetterIdx += 1;
                }
            }
            
            lastInterval = interval;
            var targetLetter = letters[currentLetterIdx % 7];
            
            return window.ContextTranslator.translate(baseMidi + interval, targetLetter);
        });
    },

    _getMidi: function(key, octave) {
        var notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
        var searchKey = key.toUpperCase().replace('DB','C#').replace('EB','D#').replace('GB','F#').replace('AB','G#').replace('BB','A#');
        var noteIndex = notes.indexOf(searchKey);
        return (octave + 1) * 12 + (noteIndex === -1 ? 0 : noteIndex);
    }
};



/**
 * PIANORAMA - ChordGenerator.js
 * 
 */
window.ChordGenerator = {
    generateChord: function(rootWithOctave, formulaKey, contextKey) {
        var context = contextKey || "C";
        var match = rootWithOctave.match(/^([A-Ga-g][#b]?|[A-Ga-g])(\d)$/);
        if (!match) return null;

        var rootKey = match[1];
        var startOctave = parseInt(match[2]);
        
        // 1. Normalização Enarmônica para busca (Eb -> D#)
        var searchKey = rootKey.toUpperCase()
                               .replace('DB','C#').replace('EB','D#')
                               .replace('GB','F#').replace('AB','G#')
                               .replace('BB','A#');

        // 2. MIDI da Fundamental
        var pitchRef = window.PIANORAMA_DATA.config.pitch_reference;
        var rootIndex = pitchRef.indexOf(searchKey);
        if (rootIndex === -1) rootIndex = 0;
        
        var baseMidi = (startOctave + 1) * 12 + rootIndex;

        // 3. Pega a fórmula
        var intervals = window.TheoryEngine.getChordFormula(formulaKey);
        
        // 4. Configura o Tradutor e gera a pilha
        window.ContextTranslator.setContext(context);
        return intervals.map(function(interval) {
            return window.ContextTranslator.translate(baseMidi + interval);
        });
    },

    applyInversion: function(chord, level) {
        // Trava de segurança para evitar o erro "invertedChord is null"
        if (!chord || !Array.isArray(chord) || chord.length === 0) return null;
        if (!level || level === 0) return chord;

        let invertedChord = JSON.parse(JSON.stringify(chord));
        let actualLevel = level % invertedChord.length;
        if (actualLevel === 0) return invertedChord;

        for (let i = 0; i < actualLevel; i++) {
            let firstNote = invertedChord.shift();
            firstNote.octave = parseInt(firstNote.octave) + 1;
            if (firstNote.midi) firstNote.midi += 12;

            if (window.ContextTranslator && typeof window.ContextTranslator._calculateAbsoluteY === 'function') {
                firstNote.absoluteY = window.ContextTranslator._calculateAbsoluteY(firstNote.letter, firstNote.octave);
            }
            invertedChord.push(firstNote);
        }
        return invertedChord.sort((a, b) => a.midi - b.midi);
    }
};



/**
 * PIANORAMA - AtlasEngine.js
 * 
 */
window.AtlasEngine = {
    processCardData: function(config) {
        var layers = [];
        var baseKey = config.key || "C";
        var parts = (config.id || "scale:major").split(":");
        var category = parts[0];
        var type = parts[1];

        var effectiveKey = window.TheoryEngine.getEffectiveSignature(baseKey, type);
        var mainFlow = { treble: [], bass: [] };

        try {
            if (category === "scale") {
                if (config.layerRelative === true || config.layerRelative === "true") {
                    mainFlow = window.SequenceBuilder.createModelX2(baseKey, type);
                } else {
                    mainFlow.treble = window.ScaleGenerator.generateScale(baseKey + "4", type, effectiveKey);
                    mainFlow.bass = window.ScaleGenerator.generateScale(baseKey + "2", type, effectiveKey);
                }
            }

            layers.push({ id: "main", colorVar: "--pianorama-notation-color", treble: mainFlow.treble, bass: mainFlow.bass });

            // Localize a parte de mapeamento de acordes e adicione a proteção if(chord)
            if (config.layerChords === true || config.layerChords === "true") {
                var chordTreble = mainFlow.treble.map(function(note, index) {
                    if (!note) return null;
                    var theory = window.TheoryEngine.getDegreeName(index, type); 
                    var chord = window.ChordGenerator.generateChord(note.letter + (note.accidental || "") + note.octave, theory.type, effectiveKey);
        
                    // Proteção: Só aplica inversão se o acorde for gerado com sucesso
                    return chord ? window.ChordGenerator.applyInversion(chord, config.inversion || 0) : null;
                });
                layers.push({ id: "chords", colorVar: "--pianorama-notation-chords-color", treble: chordTreble, bass: [], isStack: true });
            }

            if (config.layerDegrees === true || config.layerDegrees === "true") {
                layers.push({
                    id: "degrees",
                    type: "text", 
                    colorVar: "--pianorama-notation-color",
                    data: mainFlow.treble.map(function(note, index) {
                        var theory = window.TheoryEngine.getDegreeName(index, type);
                        return theory.degree; 
                    })
                });
            }
        } catch (e) {
            console.error("AtlasEngine: Erro.", e);
        }

        return { layers: layers, key: baseKey, effectiveKey: effectiveKey, time: config.time || "4/4" };
    }
};



/**
 * PIANORAMA - UIManager.js
 * 
 */
window.UIManager = {
    _attempts: 0,
    renderMainSelect: function(selector) {
        var self = this;
        var select = document.querySelector(selector);
        
        // Verifica se os dados teóricos já carregaram
        var hasData = window.SCALES && window.SCALES.library;

        if (!select || !hasData) {
            if (this._attempts < 10) {
                this._attempts++;
                setTimeout(function() { self.renderMainSelect(selector); }, 200);
            } else {
                console.error("UIManager: Falha crítica. Verifique se o seletor '" + selector + "' existe no HTML e se Scales.js carregou.");
            }
            return;
        }

        var catalog = window.TheoryEngine.getMenuCatalog();
        
        // Limpa e popula de forma segura para iPad
        while (select.firstChild) { select.removeChild(select.firstChild); }

        for (var i = 0; i < catalog.length; i++) {
            var opt = document.createElement('option');
            opt.value = catalog[i].id;
            opt.textContent = catalog[i].name;
            select.appendChild(opt);
        }

        select.onchange = function(e) {
            if (window.App && window.App.handleSelection) {
                window.App.handleSelection(e.target.value);
            }
        };
        
        console.log("UIManager: Menu populado com sucesso (" + selector + ")");
    }
};



/**
 * PIANORAMA - ControlManager.js (v1.2)
 * Connect the toolbar exclusively to the App mode.
 */
window.ControlManager = {
    init: function() {
        var self = this;
        
        // 1. Elementos da Toolbar
        var pitchSelect = document.querySelector('.pianorama__select--pitch');
        var scaleSelect = document.querySelector('.pianorama__select--scales');
        var invSelect   = document.querySelector('.pianorama__chords .pianorama__select');
        
        // 2. O Alvo (Apenas o que for "App", não os "Cards")
        var mainApp = document.querySelector('.pianorama__app--main');
        var secondaryApp = document.querySelector('.pianorama__app--secondary');
        
        if (!mainApp) return;

        // Listener: Troca de Tom (Key)
        if (pitchSelect) {
            pitchSelect.addEventListener('change', function(e) {
                var newKey = e.target.value;
                mainApp.dataset.key = newKey;
                if (secondaryApp) secondaryApp.dataset.key = newKey;
                
                self.updateDescription(newKey);
                self.refresh([mainApp, secondaryApp]);
            });
        }

        // Listener: Troca de Inversão
        if (invSelect) {
            invSelect.addEventListener('change', function(e) {
                var val = e.target.value;
                // Mapeia o valor do select (first, second...) para o motor (1, 2...)
                var invMap = { "first": 1, "second": 2, "third": 3, "fourth": 4, "fifth": 5 };
                mainApp.dataset.inversion = invMap[val] || 0;
                
                self.refresh([mainApp]);
            });
        }

        // Listener: Botões de Feature (REL, DEG, HFL)
        this.bindFeatureButtons(mainApp);
    },

    bindFeatureButtons: function(target) {
        var self = this;
        var buttons = document.querySelectorAll('.pianorama__btn[data-feature]');
        
        buttons.forEach(function(btn) {
            btn.addEventListener('click', function() {
                var feature = btn.dataset.feature;
                var isActive = btn.classList.toggle('is-active');

                // Mapeia o botão para o atributo do dataset do AtlasEngine
                switch(feature) {
                    case 'relative': 
                        target.dataset.layerRelative = isActive; 
                        break;
                    case 'harmonic-field': 
                        target.dataset.layerChords = isActive; 
                        break;
                    case 'degrees-functions': 
                        target.dataset.layerDegrees = isActive; 
                        break;
                }

                self.refresh([target]);
            });
        });
    },

    updateDescription: function(key) {
        var desc = document.querySelector('.pianorama__app--description');
        if (desc) desc.textContent = "Escala de " + key;
    },

    refresh: async function(elements) {
        if (!window.App) return;
        for (var i = 0; i < elements.length; i++) {
            if (elements[i]) {
                await window.App.setupCard(elements[i]);
                window.App.drawCard(elements[i], false);
            }
        }
    }
};



/**
 * PIANORAMA - Ui.js
 * Global interface interactions management.
 */

window.setupToggleButtons = function() {
    document.addEventListener('click', function(event) {
        // O .closest é ótimo, mas se o iPad for MUITO antigo (iOS < 9), 
        // ele pode precisar de um polyfill. No Air 1 costuma rodar ok.
        var target = event.target.closest('.pianorama__btn'); 
        
        if (target) {
            target.classList.toggle('is-selected');
        }
    });
};



/**
 * Main.js
 * 
 */

window.App = {
    registry: new Map(),
    currentPlayingCard: null,
    currentPlayToken: null,

    init: async function() {
        console.log("App: Iniciando v19.0...");
        
        try {
            if (document.fonts) await document.fonts.ready;
            
            // 1. Popular Menus dinâmicos
            if (window.UIManager && typeof window.UIManager.renderMainSelect === 'function') {
                window.UIManager.renderMainSelect('.pianorama__select--scales');
            }

            // 2. Ligar Eventos de UI
            this.bindEvents();

            // 3. Renderização Inicial
            setTimeout(() => {
                this.handleSelection();
            }, 300);

        } catch (e) {
            console.error("App: Erro na inicialização:", e);
        }

        window.addEventListener('resize', () => this.handleResize());
    },

    /**
     * Captura valores dos menus e atualiza os datasets dos elementos
     */
    handleSelection: async function() {
        const keySelect = document.querySelector('.pianorama__select--key');
        const scaleSelect = document.querySelector('.pianorama__select--scales');
        
        if (!keySelect) return;

        const newKey = keySelect.value;
        const rawId = scaleSelect ? scaleSelect.value : "scale:major";

        console.log(`App: Sincronizando -> [${newKey}] [${rawId}]`);

        // Atualiza todos os cards e o app principal
        const targets = document.querySelectorAll('.pianorama__card, .pianorama__app--main, .pianorama__app--secondary');
        targets.forEach(card => {
            card.dataset.key = newKey;
            // Apenas o app principal segue o menu de escalas, cards didáticos são fixos
            if (card.classList.contains('pianorama__app--main')) {
                card.dataset.id = rawId;
            }
            card.classList.remove('is-ready');
        });

        this.registry.clear();
        this.refreshAll();
    },

    refreshAll: function() {
        const targets = document.querySelectorAll('.pianorama__card, .pianorama__app--main, .pianorama__app--secondary');
        targets.forEach(el => this.setupCard(el));
    },

    /**
     * Configura um card e renderiza seu canvas.
     * @param {HTMLElement} card 
     */
    setupCard: async function(card) {
        const canvas = card.querySelector('canvas');
        if (!canvas) return;

        const config = {
            key: card.dataset.key || "C",
            id: card.dataset.id || "scale:major",
            time: card.dataset.time || "4/4",
            // accidentalMode define: 'signature' (Pro), 'both' (Beginner), 'notes' (Apenas notas)
            accidentalMode: card.dataset.accidental || "both", 
            layerRelative: card.dataset.layerRelative === "true",
            layerChords: card.dataset.layerChords === "true",
            layerDegrees: card.dataset.layerDegrees === "true",
            inversion: parseInt(card.dataset.inversion || 0)
        };

        if (!window.RenderEngine || !window.RenderSystem) {
            console.warn("App: Motores de renderização ainda não disponíveis. Tentando novamente...");
            setTimeout(() => this.setupCard(card), 100);
            return;
        }

        if (window.AtlasEngine) {
            try {
                // O AtlasEngine agora devolve a armadura calculada (effectiveKey)
                const dataStore = window.AtlasEngine.processCardData(config);
                
                // Ajuste de DPI para nitidez no Canvas
                const dpr = window.devicePixelRatio || 1;
                const rect = card.getBoundingClientRect();
                canvas.width = rect.width * dpr;
                canvas.height = 280 * dpr;
                canvas.style.width = rect.width + "px";
                canvas.style.height = "280px";
                
                const ctx = canvas.getContext('2d');
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                
                // Registra os dados processados, incluindo a armadura efetiva
                this.registry.set(card, { 
                    layers: dataStore.layers, 
                    config: config,
                    effectiveKey: dataStore.effectiveKey // Crucial para o RenderSystem
                });

                this.drawCard(card);

                // Preload de áudio
                const folder = config.id.includes('field') ? 'chords' : 'scales';
                const fileSet = this.collectFiles(dataStore.layers);
                window.AudioEngine.preloadFiles(folder, fileSet).then(() => {
                    const data = this.registry.get(card);
                    if (data) {
                        data.isAudioLoaded = true;
                        card.classList.add('is-ready');
                    }
                });
            } catch (err) {
                console.error("App: Erro no setup do card:", err);
            }
        }

        card.onclick = () => window.App.playCard(card);
    },

    /**
     * Executa o desenho técnico no Canvas
     */
    drawCard: function(card) {
        const data = this.registry.get(card);
        const canvas = card.querySelector('canvas');
        if (!data || !canvas || !window.RenderEngine) return;

        const ctx = canvas.getContext('2d');
        const style = getComputedStyle(card);
        const sysColor = style.getPropertyValue('--pianorama-notation-color').trim() || "#000";

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Desenha o sistema (Claves, Armadura e Fórmula de Compasso)
        // Passamos effectiveKey para o RenderSystem desenhar a armadura correta
        const noteStartX = window.RenderEngine.drawSystem(ctx, 20, parseInt(canvas.style.width) - 15, 65, {
            key: data.config.key,
            effectiveKey: data.effectiveKey, 
            accidentalMode: data.config.accidentalMode,
            time: data.config.time,
            color: sysColor
        });

        // Desenha as camadas (Notas, Acordes, Texto)
        data.layers.forEach(layer => {
            const layerColor = style.getPropertyValue(layer.colorVar).trim() || sysColor;

            if (layer.type === "text") {
                window.RenderEngine.drawLabels(ctx, noteStartX, 65, layer.data, { color: layerColor });
            } else {
                const yTreble = 65;
                const lineSp = window.RenderConfig.lineSp || 10;
                const staffGap = window.RenderConfig.staffGap || 80;
                const yBass = yTreble + staffGap + (4 * lineSp);
                
                const treble = layer.treble || [];
                const bass = layer.bass || [];
                const len = Math.max(treble.length, bass.length);

                for (let i = 0; i < len; i++) {
                    let x = noteStartX + (i * 45);
                    if (x > parseInt(canvas.style.width) - 20) break;

                    if (treble[i]) {
                        window.RenderEngine.drawNote(ctx, x, yTreble, treble[i], {
                            color: layerColor, 
                            clef: "treble", 
                            accidentalMode: data.config.accidentalMode // 'signature' oculta acidentes na pauta
                        });
                    }
                    if (bass[i]) {
                        window.RenderEngine.drawNote(ctx, x, yBass, bass[i], {
                            color: layerColor, 
                            clef: "bass", 
                            accidentalMode: data.config.accidentalMode
                        });
                    }
                }
            }
        });
    },

    bindEvents: function() {
        document.body.addEventListener('change', (e) => {
            if (e.target.classList.contains('pianorama__select--key') ||
                e.target.classList.contains('pianorama__select--scales')) {
                this.handleSelection();
            }
        });
    },

    collectFiles: function(layers) {
        const fileSet = [];
        layers.forEach(l => {
            if (l.type === "text") return;
            const all = (l.treble || []).concat(l.bass || []);
            all.forEach(slot => {
                if (!slot) return;
                [].concat(slot).forEach(n => {
                    if (n && n.fileName) {
                        // Normaliza para o formato do banco (sempre Bemoís onde houver alteração)
                        let cleanName = n.fileName.replace('.mp3', '');
                        let normalized = window.ContextTranslator._normalizeNoteName(cleanName) + ".mp3";
                        if (!fileSet.includes(normalized)) fileSet.push(normalized);
                    }
                });
            });
        });
        return fileSet;
    },

    playCard: async function(card) {
        const data = this.registry.get(card);
        if (!data || !data.isAudioLoaded) return;

        if (this.currentPlayingCard === card) {
            this.stopAudio();
            return;
        }

        if (this.currentPlayingCard) this.stopAudio();
        await new Promise(r => setTimeout(r, 50));

        const playToken = Math.random(); 
        this.currentPlayToken = playToken;
        this.currentPlayingCard = card;
        card.classList.add('is-playing');

        window.AudioEngine.init();

        const bpm = (window.PIANORAMA_CONFIG && window.PIANORAMA_CONFIG.playback) ? window.PIANORAMA_CONFIG.playback.bpm : 80;
        const delay = (60 / bpm) * 1000; 

        const playableLayers = data.layers.filter(l => l.type !== "text");
        let maxSteps = 0;
        playableLayers.forEach(l => maxSteps = Math.max(maxSteps, (l.treble || []).length));

        for (let i = 0; i < maxSteps; i++) {
            if (this.currentPlayingCard !== card || this.currentPlayToken !== playToken) return;
        
            playableLayers.forEach(layer => {
                const t = layer.treble ? layer.treble[i] : null;
                const b = layer.bass ? layer.bass[i] : null;
                [t, b].forEach(slot => {
                    if (!slot) return;
                    [].concat(slot).forEach(n => {
                        if (n && n.fileName) {
                            const folder = (data.config.id.indexOf('field') > -1) ? 'chords' : 'scales';
                            window.AudioEngine.playFile(folder, n.fileName);
                        }
                    });
                });
            });
            await new Promise(r => setTimeout(r, delay));
        }
        if (this.currentPlayToken === playToken) this.stopAudio();
    },

    stopAudio: function() {
        if (this.currentPlayingCard) {
            this.currentPlayingCard.classList.remove('is-playing');
        }
        this.currentPlayingCard = null;
        this.currentPlayToken = null;
    },

    handleResize: function() {
        this.handleSelection();
    }
};

window.addEventListener('appReady', () => window.App.init());