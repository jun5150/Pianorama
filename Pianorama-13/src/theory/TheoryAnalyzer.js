/**
 * PIANORAMA - TheoryAnalyzer.js
 * Identificação de funções, graus e tonalidades relativas.
 */
window.TheoryEngine = window.TheoryEngine || {};

(function(TE) {
    TE.getDegreeName = function(index, scaleType) {
        var degrees = ["I", "II", "III", "IV", "V", "VI", "VII"];
        var label = degrees[index] || "?";
        var type = "maj"; 

        var field = (window.CHORDS && window.CHORDS.harmonic_fields) ? 
                    (window.CHORDS.harmonic_fields[scaleType] || window.CHORDS.harmonic_fields["major"]) : 
                    null;

        if (field) {
            var suffix = (field.triads && field.triads[index]) ? field.triads[index] : "";
            label = label + suffix;
            if (suffix === "m") type = "min";
            else if (suffix === "dim" || suffix === "°") type = "dim";
            else if (suffix === "aug" || suffix === "+") type = "aug";
        }

        return { degree: label, type: type };
    };

    TE.getRelativeKey = function(key, type) {
        if (!window.PIANORAMA_DATA || !window.PIANORAMA_DATA.relative_map) return key;
        return window.PIANORAMA_DATA.relative_map[key] || key;
    };

    TE.getRelativeScaleType = function(type) {
        if (type === "major") return "minor_natural";
        if (type === "minor_natural") return "major";
        return type;
    };
})(window.TheoryEngine);