/**
 * PIANORAMA - TheoryAnalyzer.js (v19.0)
 */
window.TheoryEngine = window.TheoryEngine || {};

(function(TE) {
    
    /**
     * Identifica a tonalidade relativa para desenhar a Armadura de Clave.
     * Exemplo: Dó Menor (scaleId: minor) -> retorna Mib (Eb)
     */
    TE.getRelativeKeyForSignature = function(key, scaleId) {
        if (!scaleId) return key;
        var id = scaleId.replace('scale:', '');
        
        // Mapeia quanto saltar da tônica para achar a armadura de clave Maior correspondente
        var relativeMap = {
            'major': 'P1',
            'minor': 'm3', 'minor_natural': 'm3', 'aeolian': 'm3',
            'dorian': 'm7',    // Re Dorian -> Clave de Do Maior
            'phrygian': 'm6',  // Mi Phrygian -> Clave de Do Maior
            'lydian': 'P4',    // Fa Lydian -> Clave de Do Maior
            'mixolydian': 'P5',// Sol Mixolydian -> Clave de Do Maior
            'locrian': 'm2',   // Si Locrian -> Clave de Do Maior
            'minor_harmonic': 'P1', // Geralmente usa-se a clave da tônica ou relativa
            'minor_melodic': 'P1'
        };

        var interval = relativeMap[id];
        if (!interval || !TE.getInterval) return key;
        
        return TE.getInterval(key, interval);
    };

    TE.getDegreeName = function(index, scaleType) {
        var degrees = ["I", "II", "III", "IV", "V", "VI", "VII"];
        var label = degrees[index] || "?";
        return { degree: label, type: "maj" };
    };

    /**
     * Desativamos a função antiga fixNoteLanguage.
     * O ContextTranslator agora resolve isso de forma mais inteligente.
     */
    TE.fixNoteLanguage = function(noteObj) {
        return noteObj; 
    };

})(window.TheoryEngine);