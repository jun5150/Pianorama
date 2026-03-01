/**
 * PIANORAMA - ScaleGenerator.js (v13.0)
 */
window.ScaleGenerator = {
    generateScale: function(rootWithOctave, type, effectiveSignature) {
        var match = rootWithOctave.match(/^([A-Ga-g][#b]?|[A-Ga-g])(\d)$/);
        if (!match) return [];

        var rootKeyFull = match[1];
        var rootLetterBase = rootKeyFull.charAt(0).toUpperCase();
        var startOctave = parseInt(match[2]);
        
        var letters = ["C", "D", "E", "F", "G", "A", "B"];
        var startIdx = letters.indexOf(rootLetterBase);

        // Passamos a armadura efetiva para o tradutor
        window.ContextTranslator.setContext(rootKeyFull, effectiveSignature);

        var intervals = window.TheoryEngine.getScaleFormula(type);
        var baseMidi = this._getMidi(rootKeyFull, startOctave);

        return intervals.map(function(interval, index) {
            var targetLetter = letters[(startIdx + index) % 7];
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