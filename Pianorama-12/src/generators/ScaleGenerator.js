/**
 * PIANORAMA - ScaleGenerator.js (v12.2)
 */

window.ScaleGenerator = {
    generateScale: function(rootWithOctave, type) {
        var match = rootWithOctave.match(/^([A-Ga-g][#b]?|[A-Ga-g])(\d)$/);
        if (!match) return [];

        var rootKey = match; // PEGA A LETRA (Ex: "C#")
        var startOctave = parseInt(match); // PEGA A OITAVA (Ex: "4")
        
        window.ContextTranslator.setContext(rootKey);

        var intervals = window.TheoryEngine.getScaleFormula(type);
        var baseMidi = this._getMidi(rootKey, startOctave);

        return intervals.map(function(interval) {
            return window.ContextTranslator.translate(baseMidi + interval);
        });
    },

    _getMidi: function(key, octave) {
        if (typeof key !== 'string') return 60; // Proteção extra
        var notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
        var searchKey = key.toUpperCase()
                           .replace('DB','C#').replace('EB','D#')
                           .replace('GB','F#').replace('AB','G#')
                           .replace('BB','A#');
        return (octave + 1) * 12 + notes.indexOf(searchKey);
    }
};