/**
 * PIANORAMA - ScaleGenerator.js (v13.5)
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

        var intervals = window.TheoryEngine.getScaleFormula(type);
        var baseMidi = this._getMidi(rootKey, startOctave);

        // Se a escala tem 7 notas (Maior, Menor, Modos), usamos a sequência rígida A-B-C...
        var isDiatonic = (intervals.length === 7);

        return intervals.map(function(semitones, index) {
            var midi = baseMidi + semitones;
            var targetLetter = null;

            if (isDiatonic) {
                // Força a próxima letra do alfabeto: C -> D -> E -> F...
                targetLetter = letters[(startLetterIndex + index) % 7];
            } else {
                // Para escalas não-diatônicas (Penta), saltamos as letras baseados nos semitons
                var letterOffset = 0;
                if (semitones <= 2) letterOffset = 1;
                else if (semitones <= 4) letterOffset = 2;
                else if (semitones <= 6) letterOffset = 3;
                else if (semitones <= 7) letterOffset = 4;
                else if (semitones <= 9) letterOffset = 5;
                else if (semitones <= 11) letterOffset = 6;
                targetLetter = letters[(startLetterIndex + letterOffset) % 7];
            }

            return window.ContextTranslator.translate(midi, targetLetter);
        });
    },

    _getMidi: function(key, octave) {
        var notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
        var k = key.toUpperCase()
                   .replace('DB','C#').replace('EB','D#')
                   .replace('GB','F#').replace('AB','G#')
                   .replace('BB','A#');
        var idx = notes.indexOf(k);
        return (parseInt(octave) + 1) * 12 + (idx === -1 ? 0 : idx);
    }
};