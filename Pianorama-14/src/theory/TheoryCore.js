/**
 * PIANORAMA - TheoryCore.js
 */
window.TheoryEngine = window.TheoryEngine || {};

(function(TE) {
    TE.getAccidentalType = function(key) {
        if (!key) return "sharp";
        var k = key.replace('m', '');
        var flats = ["F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb"];
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

    // RESOLVE O CRASH: Funções chamadas pelo SequenceBuilder
    TE.getRelativeKey = function(key, type) {
        var isMajor = !type || type.indexOf('major') !== -1;
        if (isMajor) {
            return (window.THEORY_MAPS && window.THEORY_MAPS.relative_map) ? window.THEORY_MAPS.relative_map[key] || key : key;
        } else {
            var map = (window.THEORY_MAPS) ? window.THEORY_MAPS.relative_map : {};
            for (var k in map) { if (map[k] === key) return k; }
        }
        return key;
    };

    TE.getRelativeScaleType = function(type) {
        return (type && type.indexOf('major') !== -1) ? 'minor_natural' : 'major';
    };

    TE.getInterval = function(root, interval) {
        var notesSharp = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
        var notesFlat  = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
        var semitonesMap = { "m2":1, "M2":2, "m3":3, "M3":4, "P4":5, "P5":7, "m6":8, "M6":9, "m7":10, "M7":11 };
        var st = semitonesMap[interval] || 0;
        var idx = notesSharp.indexOf(root);
        if (idx === -1) idx = notesFlat.indexOf(root);
        if (idx === -1) return root;
        var targetIdx = (idx + st) % 12;
        return (TE.getAccidentalType(root) === "flat") ? notesFlat[targetIdx] : notesSharp[targetIdx];
    };
})(window.TheoryEngine);