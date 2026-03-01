/**
 * PIANORAMA - ChordGenerator.js (v13.0)
 */

window.ChordGenerator = {
    generateChord: function(rootWithOctave, formulaKey, contextKey) {
        var context = contextKey || "C";
        var match = rootWithOctave.match(/^([A-Ga-g][#b]?|[A-Ga-g])(\d)$/);
        if (!match) return null;

        var rootKey = match[1];
        var startOctave = parseInt(match[2]);
        
        // 1. Normalização Enarmônica para busca (Eb -> D#)
        var searchKey = rootKey.toUpperCase()
                               .replace('DB','C#').replace('EB','D#')
                               .replace('GB','F#').replace('AB','G#')
                               .replace('BB','A#');

        // 2. MIDI da Fundamental
        var pitchRef = window.PIANORAMA_DATA.config.pitch_reference;
        var rootIndex = pitchRef.indexOf(searchKey);
        if (rootIndex === -1) rootIndex = 0;
        
        var baseMidi = (startOctave + 1) * 12 + rootIndex;

        // 3. Pega a fórmula
        var intervals = window.TheoryEngine.getChordFormula(formulaKey);
        
        // 4. Configura o Tradutor e gera a pilha
        window.ContextTranslator.setContext(context);
        return intervals.map(function(interval) {
            return window.ContextTranslator.translate(baseMidi + interval);
        });
    },

    applyInversion: function(chord, level) {
        // Trava de segurança para evitar o erro "invertedChord is null"
        if (!chord || !Array.isArray(chord) || chord.length === 0) return null;
        if (!level || level === 0) return chord;

        let invertedChord = JSON.parse(JSON.stringify(chord));
        let actualLevel = level % invertedChord.length;
        if (actualLevel === 0) return invertedChord;

        for (let i = 0; i < actualLevel; i++) {
            let firstNote = invertedChord.shift();
            firstNote.octave = parseInt(firstNote.octave) + 1;
            if (firstNote.midi) firstNote.midi += 12;

            if (window.ContextTranslator && typeof window.ContextTranslator._calculateAbsoluteY === 'function') {
                firstNote.absoluteY = window.ContextTranslator._calculateAbsoluteY(firstNote.letter, firstNote.octave);
            }
            invertedChord.push(firstNote);
        }
        return invertedChord.sort((a, b) => a.midi - b.midi);
    }
};