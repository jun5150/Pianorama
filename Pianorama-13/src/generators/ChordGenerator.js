/**
 * PIANORAMA - ChordGenerator.js (v12.3)
 */

window.ChordGenerator = {
    /**
     * Gera um acorde completo.
     */
    generateChord: function(rootWithOctave, formulaKey, contextKey) {
        var context = contextKey || "C";
        var match = rootWithOctave.match(/^([A-Ga-g][#b]?|[A-Ga-g])(\d)$/);
        if (!match) return null;

        var rootKey = match[1];
        var startOctave = parseInt(match[2]);
        
        // 1. MIDI da Fundamental
        var pitchRef = window.PIANORAMA_DATA.config.pitch_reference;
        var rootIndex = pitchRef.indexOf(rootKey.includes('#') || rootKey.includes('b') ? rootKey : rootKey.toUpperCase());
        var baseMidi = (startOctave + 1) * 12 + rootIndex;

        // 2. Pega a fórmula
        var intervals = window.TheoryEngine.getChordFormula(formulaKey);
        
        // 3. Configura o Tradutor Global para o contexto da tonalidade
        window.ContextTranslator.setContext(context);

        // 4. Gera a pilha de notas (Corrigido o ReferenceError aqui)
        return intervals.map(function(interval) {
            var currentMidi = baseMidi + interval;
            // Chamada direta ao objeto global
            return window.ContextTranslator.translate(currentMidi);
        });
    },

    /**
     * Aplica uma inversão a um array de notas de acorde
     */
    applyInversion: function(chord, level) {
        if (!level || level === 0) return chord;
        let invertedChord = JSON.parse(JSON.stringify(chord));

        let actualLevel = level % invertedChord.length;
        if (actualLevel === 0) return invertedChord;

        for (let i = 0; i < actualLevel; i++) {
            let firstNote = invertedChord.shift();
            firstNote.octave = parseInt(firstNote.octave) + 1;
        
            if (firstNote.midi) firstNote.midi += 12;

            // --- BLINDAGEM AQUI ---
            // Só tenta calcular se o módulo e a função existirem
            if (window.ContextTranslator && typeof window.ContextTranslator.getAbsoluteY === 'function') {
                firstNote.absoluteY = window.ContextTranslator.getAbsoluteY(firstNote);
            } else {
                // Se não existir, deleta para o RenderEngine recalcular no desenho
                delete firstNote.absoluteY; 
            }
        
            invertedChord.push(firstNote);
        }
        return invertedChord.sort((a, b) => a.midi - b.midi);
    }
};