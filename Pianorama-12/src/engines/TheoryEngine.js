/**
 * PIANORAMA - TheoryEngine.js (v12.9.1)
 * O Cérebro: Agora com varredura dinâmica e suporte ao Atlas v13.
 */

window.TheoryEngine = {
    /**
     * Gera o catálogo varrendo as bibliotecas vivas.
     */
    getMenuCatalog: function() {
        var catalog = [];
        if (window.SCALES && window.SCALES.library) {
            var lib = window.SCALES.library;
            for (var cat in lib) {
                if (!lib.hasOwnProperty(cat)) continue;
                for (var key in lib[cat]) {
                    if (!lib[cat].hasOwnProperty(key)) continue;
                    var item = lib[cat][key];
                    var label = (typeof item === 'object' && item.name) ? item.name : 
                                key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
                    catalog.push({ id: "scale:" + key, name: "Escala: " + label });
                }
            }
        }
        if (window.CHORDS && window.CHORDS.harmonic_fields) {
            for (var fKey in window.CHORDS.harmonic_fields) {
                if (window.CHORDS.harmonic_fields.hasOwnProperty(fKey)) {
                    var fLabel = fKey.charAt(0).toUpperCase() + fKey.slice(1).replace(/_/g, ' ');
                    catalog.push({ id: "field:" + fKey, name: "Campo: " + fLabel });
                }
            }
        }
        return catalog;
    },

    getAccidentalType: function(key) {
        if (!window.THEORY_MAPS) return "sharp";
        var flats = window.THEORY_MAPS.enharmonics.preferred_keys.flats;
        return (flats.indexOf(key) !== -1) ? "flat" : "sharp";
    },

    getRelativeKey: function(key, type) {
        var scaleType = type || "major";
        if (!window.THEORY_MAPS) return key;
        var map = window.THEORY_MAPS.relative_map;
        if (scaleType === "major" || scaleType === "ionian") return map[key] || key;
        for (var majorKey in map) {
            if (map.hasOwnProperty(majorKey) && map[majorKey] === key) return majorKey;
        }
        return key;
    },

    getRelativeScaleType: function(currentType) {
        var majorTypes = ["major", "ionian"];
        return (majorTypes.indexOf(currentType) !== -1) ? "minor_natural" : "major";
    },

    getScaleFormula: function(type) {
        if (!window.SCALES || !window.SCALES.library) return [];
        // Se type vier de um split (array), pega a primeira posição
        var pureType = Array.isArray(type) ? type : type;
    
        var lib = window.SCALES.library;
        for (var cat in lib) {
            if (lib[cat][pureType]) {
                return lib[cat][pureType].intervals || lib[cat][pureType];
            }
        }
        return [];
    },

    getChordFormula: function(type) {
        if (!window.CHORDS || !window.CHORDS.formulas) return [];
        var f = window.CHORDS.formulas;
        return f.triads[type] || f.sevenths[type] || f.extensions[type] || [];
    },

    /**
     * Identifica o grau romano e a qualidade técnica do acorde.
     * @param {number} index - Índice da nota na escala (0-6).
     * @param {string} scaleType - Tipo da escala para busca no campo harmônico.
     */
    getDegreeName: function(index, scaleType) {
        const degrees = ["I", "II", "III", "IV", "V", "VI", "VII"];
        var label = degrees[index] || "?";
        var type = "maj"; // Default para o ChordGenerator

        // 1. Tenta localizar o campo harmônico (Ex: window.CHORDS.harmonic_fields['minor_natural'])
        var field = (window.CHORDS && window.CHORDS.harmonic_fields) ? 
                    (window.CHORDS.harmonic_fields[scaleType] || window.CHORDS.harmonic_fields["major"]) : 
                    null;

        if (field && field.triads) {
            var suffix = field.triads[index] || "";
            
            // 2. Constrói o Label visual (ex: "IIm")
            label = label + suffix;

            // 3. Traduz o sufixo para o "dialeto" do ChordGenerator
            if (suffix === "m") type = "min";
            else if (suffix === "dim" || suffix === "°") type = "dim";
            else if (suffix === "aug" || suffix === "+") type = "aug";
        }

        return {
            degree: label, 
            type: type     
        };
    }
};