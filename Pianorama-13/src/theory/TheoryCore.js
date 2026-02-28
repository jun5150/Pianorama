/**
 * PIANORAMA - TheoryCore.js
 * Matemática básica de intervalos e fórmulas.
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