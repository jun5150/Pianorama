/**
 * PIANORAMA - ScaleGenerator.js (v12.5)
 */
window.ScaleGenerator = {
    generateScale: function(rootWithOctave, type) {
        if (!rootWithOctave || typeof rootWithOctave !== 'string') return [];
        
        var match = rootWithOctave.match(/^([A-Ga-g][#b]?|[A-Ga-g])(\d)$/);
        if (!match) return [];

        // CORREÇÃO: Pegando os grupos específicos do Regex
        var rootKey = match; 
        var startOctave = parseInt(match);
        
        window.ContextTranslator.setContext(rootKey);

        var intervals = window.TheoryEngine.getScaleFormula(type);
        var baseMidi = this._getMidi(rootKey, startOctave);

        return intervals.map(function(interval, index) {
            var midi = baseMidi + interval;
            
            // 1. O Speller decide o nome correto (Ex: Eb4)
            var spelledNoteName = window.TheorySpeller.spell(rootKey, index, midi);
            
            // 2. O Translator gera o objeto para o Render e Audio
            return window.ContextTranslator.translate(midi, spelledNoteName);
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
        return (octave + 1) * 12 + noteIndex;
    }
};