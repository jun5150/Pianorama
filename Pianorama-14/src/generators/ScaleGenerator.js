/**
 * PIANORAMA - ScaleGenerator.js
 */
window.ScaleGenerator = {
    generateScale: function(rootWithOctave, type) {
        var match = rootWithOctave.match(/^([A-Ga-g][#b]?|[A-Ga-g])(\d)$/);
        if (!match) return [];

        var rootKey = match[1];
        var startOctave = parseInt(match[2]);
        var letters = ["C", "D", "E", "F", "G", "A", "B"];
        var startLetterIndex = letters.indexOf(rootKey.charAt(0).toUpperCase());

        window.ContextTranslator.setContext(rootKey);
        var intervals = window.TheoryEngine.getScaleFormula(type) || [];
        var baseMidi = this._getMidi(rootKey, startOctave);
        var isDiatonic = (intervals.length === 7);

        return intervals.map(function(semitones, index) {
            var midi = baseMidi + semitones;
            // Se a escala tem 7 notas (como C Minor), força a sequência de letras
            var targetLetter = isDiatonic ? letters[(startLetterIndex + index) % 7] : null;
            return window.ContextTranslator.translate(midi, targetLetter);
        });
    },

    _getMidi: function(key, octave) {
        var notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
        var k = key.toUpperCase().replace('DB','C#').replace('EB','D#').replace('GB','F#').replace('AB','G#').replace('BB','A#');
        var idx = notes.indexOf(k);
        return (parseInt(octave) + 1) * 12 + (idx === -1 ? 0 : idx);
    }
};