/**
 * PIANORAMA - ScaleGenerator.js (v12.3.1)
 */

window.ScaleGenerator = {
    generateScale: function(rootWithOctave, type) {
        var match = rootWithOctave.match(/^([A-Ga-g][#b]?|[A-Ga-g])(\d)$/);
        if (!match) return [];

        // --- AQUI ESTAVA O ERRO REPETIDO ---
        var rootKey = match[1];
        var startOctave = parseInt(match[2]);
        
        window.ContextTranslator.setContext(rootKey);

        var intervals = window.TheoryEngine.getScaleFormula(type);
        var baseMidi = this._getMidi(rootKey, startOctave);

        return intervals.map(function(interval) {
            return window.ContextTranslator.translate(baseMidi + interval);
        });
    },

    _getMidi: function(key, octave) {
        if (typeof key !== 'string') return 60; 
        var notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
        
        var searchKey = key.toUpperCase()
                           .replace('DB','C#').replace('EB','D#')
                           .replace('GB','F#').replace('AB','G#')
                           .replace('BB','A#');
                           
        var noteIndex = notes.indexOf(searchKey);
        if (noteIndex === -1) noteIndex = 0;

        // O cálculo agora receberá o número da oitava real (ex: 4) em vez de um objeto array
        return (octave + 1) * 12 + noteIndex;
    }
};