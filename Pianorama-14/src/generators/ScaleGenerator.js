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
        var startLetterChar = rootKey.charAt(0).toUpperCase();
        var startLetterIndex = letters.indexOf(startLetterChar);

        if (window.ContextTranslator) window.ContextTranslator.setContext(rootKey);

        var intervals = window.TheoryEngine.getScaleFormula(type) || [];
        var baseMidi = this._getMidi(rootKey, startOctave);
        var isDiatonic = (intervals.length === 7);

        return intervals.map(function(semitones, index) {
            var midi = baseMidi + semitones;
            var targetLetter = null;

            if (isDiatonic) {
                targetLetter = letters[(startLetterIndex + index) % 7];
            } else {
                var offset = 0;
                if (semitones <= 2) offset = 1;
                else if (semitones <= 4) offset = 2;
                else if (semitones <= 6) offset = 3;
                else if (semitones <= 7) offset = 4;
                else if (semitones <= 9) offset = 5;
                else if (semitones <= 11) offset = 6;
                targetLetter = letters[(startLetterIndex + offset) % 7];
            }

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