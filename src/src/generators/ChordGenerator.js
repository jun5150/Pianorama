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
    applyInversion: function(notes, inv) {
            if (!notes || notes.length <= 1) return notes;
        
            var inverted = notes.slice();
            // Converte strings para números se necessário
            var count = 0;
            if (typeof inv === "number") count = inv;
            else if (inv === "1st") count = 1;
            else if (inv === "2nd") count = 2;
            else if (inv === "3rd") count = 3;

            for (var i = 0; i < count; i++) {
                var note = inverted.shift();
                var newMidi = note.midi + 12; 
                // Usa o ContextTranslator para garantir que a nota suba no pentagrama (absoluteY)
                inverted.push(window.ContextTranslator.translate(newMidi, note.letter));
            }

            return inverted;
        }
};