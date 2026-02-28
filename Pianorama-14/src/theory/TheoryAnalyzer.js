/**
 * PIANORAMA - TheoryAnalyzer.js (v19.0)
 */
window.TheoryEngine = window.TheoryEngine || {};

(function(TE) {
    
    TE.getRelativeKeyForSignature = function(key, scaleId) {
        if (!scaleId) return key;
        var id = scaleId.replace('scale:', '');
        var relativeMap = {
            'major': 'P1', 'minor': 'm3', 'minor_natural': 'm3', 'aeolian': 'm3',
            'dorian': 'm7', 'phrygian': 'm6', 'lydian': 'P4', 'mixolydian': 'P5', 'locrian': 'm2'
        };
        var interval = relativeMap[id];
        if (!interval || !TE.getInterval) return key;
        return TE.getInterval(key, interval);
    };

    TE.getDegreeName = function(index, scaleType) {
        var degrees = ["I", "II", "III", "IV", "V", "VI", "VII"];
        return { degree: degrees[index] || "?", type: "maj" };
    };

    TE.fixNoteLanguage = function(noteObj) {
        return noteObj; // Desativado: Delegado ao ContextTranslator via targetLetter
    };

})(window.TheoryEngine);