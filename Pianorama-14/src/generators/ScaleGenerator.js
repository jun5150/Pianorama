/**
 * PIANORAMA - ScaleGenerator.js (v14.0)
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

        return intervals.map(function(semitones, index) {
            var midi = baseMidi + semitones;
            // Força o uso da letra correta do alfabeto diatônico
            var targetLetter = (intervals.length === 7) ? letters[(startLetterIndex + index) % 7] : null;
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