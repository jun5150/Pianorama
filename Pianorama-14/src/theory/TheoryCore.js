/**
 * PIANORAMA - TheoryCore.js (v13.6)
 * Matemática básica de intervalos e fórmulas.
 */
window.TheoryEngine = window.TheoryEngine || {};

(function(TE) {
    TE.getAccidentalType = function(key) {
        if (!key) return "sharp";
        var k = key.charAt(0).toUpperCase() + key.slice(1);
        var flats = ["F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb", "c", "f", "bb", "eb", "ab", "db", "gb"];
        return (flats.indexOf(k) !== -1) ? "flat" : "sharp";
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

    TE.getInterval = function(root, interval) {
        const notesSharp = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
        const notesFlat  = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
        const semitonesMap = { "m2":1, "M2":2, "m3":3, "M3":4, "P4":5, "P5":7, "m6":8, "M6":9, "m7":10, "M7":11 };
        const st = semitonesMap[interval] || 0;
        let idx = notesSharp.indexOf(root);
        if (idx === -1) idx = notesFlat.indexOf(root);
        if (idx === -1) return root;
        let targetIdx = (idx + st) % 12;
        return (TE.getAccidentalType(root) === "flat") ? notesFlat[targetIdx] : notesSharp[targetIdx];
    };

    // --- FUNÇÕES QUE FALTAVAM E CAUSAVAM O CRASH ---
    TE.getRelativeKey = function(key, type) {
        if (!key) return "C";
        var isMajor = !type || type.indexOf('major') !== -1 || type === 'ionian';
        if (isMajor) {
            return (window.THEORY_MAPS && window.THEORY_MAPS.relative_map) ? window.THEORY_MAPS.relative_map[key] || key : key;
        } else {
            var map = (window.THEORY_MAPS) ? window.THEORY_MAPS.relative_map : {};
            for (var k in map) { if (map[k] === key) return k; }
        }
        return key;
    };

    TE.getRelativeScaleType = function(type) {
        if (!type || type.indexOf('major') !== -1) return 'minor_natural';
        return 'major';
    };

})(window.TheoryEngine);