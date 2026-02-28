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

    /**
     * NOVA FUNÇÃO: Calcula a nota de destino a partir de um intervalo.
     * Necessária para converter "C menor" em armadura de "Eb".
     */
    TE.getInterval = function(root, interval) {
        const notesSharp = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
        const notesFlat  = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
        
        const semitonesMap = { "m2": 1, "M2": 2, "m3": 3, "M3": 4, "P4": 5, "P5": 7, "m6": 8, "M6": 9, "m7": 10, "M7": 11 };
        const st = semitonesMap[interval] || 0;
        
        let idx = notesSharp.indexOf(root);
        if (idx === -1) idx = notesFlat.indexOf(root);
        if (idx === -1) return root;

        let targetIdx = (idx + st) % 12;
        let useFlats = TE.getAccidentalType(root) === "flat" || ["m3", "m2", "P4"].includes(interval);
        
        return useFlats ? notesFlat[targetIdx] : notesSharp[targetIdx];
    };
})(window.TheoryEngine);