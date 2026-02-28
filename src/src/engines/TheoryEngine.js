/**
 * PIANORAMA - TheoryEngine.js (v12.9)
 * O Cérebro: Agora com varredura dinâmica total.
 */

window.TheoryEngine = {
    /**
     * Gera o catálogo varrendo as bibliotecas vivas.
     * Não há nomes hardcoded aqui.
     */
    getMenuCatalog: function() {
        var catalog = [];
        // 1. Escalas
        if (window.SCALES && window.SCALES.library) {
            var lib = window.SCALES.library;
            for (var cat in lib) {
                if (!lib.hasOwnProperty(cat)) continue;
                for (var key in lib[cat]) {
                    if (!lib[cat].hasOwnProperty(key)) continue;
                
                    var item = lib[cat][key];
                    // Tenta pegar o .name (Diatonic), se não houver, formata a chave (Modes)
                    var label = (typeof item === 'object' && item.name) ? item.name : 
                                key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
                
                    catalog.push({ id: "scale:" + key, name: "Escala: " + label });
                }
            }
        }
        // 2. Campos Harmônicos
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

    /**
     * O restante dos métodos permanece para manter a lógica musical...
     */
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
        var lib = window.SCALES.library;
        // Busca em qualquer gaveta da biblioteca
        for (var cat in lib) {
            if (lib[cat][type]) {
                return lib[cat][type].intervals || lib[cat][type];
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
     * Identifica o grau romano e a qualidade do acorde.
     * @param {number} index - O índice na escala (0 a 6).
     * @param {string} scaleType - Ex: 'major', 'minor_natural'.
     */
    getDegreeName: function(index, scaleType) {
        // 1. Nomes dos graus romanos
        const degrees = ["I", "II", "III", "IV", "V", "VI", "VII"];
    
        // 2. Tenta buscar na sua biblioteca CHORDS.harmonic_fields
        // Se não achar o scaleType (ex: 'ionian'), tenta um fallback para 'major'
        var field = (window.CHORDS && window.CHORDS.harmonic_fields) ? 
                    (window.CHORDS.harmonic_fields[scaleType] || window.CHORDS.harmonic_fields["major"]) : 
                    null;

        return {
            degree: degrees[index] || "?",
            // Pega o tipo (maj, min, dim) do campo harmônico; se não houver campo, assume 'maj'
            type: (field && field.triads) ? field.triads[index] : "maj"
        };
    }
};
