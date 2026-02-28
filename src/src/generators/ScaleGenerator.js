/**
 * PIANORAMA - ScaleGenerator.js (v12.2)
 */

window.ScaleGenerator = {
    /**
     * Gera uma sequência de notas baseada no tom e tipo.
     */
    generateScale: function(rootWithOctave, type) {
        // 1. Decompõe a fundamental
        var match = rootWithOctave.match(/^([A-Ga-g][#b]?|[A-Ga-g])(\d)$/);
        if (!match) return [];

        var rootKey = match[1];
        var startOctave = parseInt(match[2]);
        
        // 2. Busca o MIDI
        var pitchRef = window.PIANORAMA_DATA.config.pitch_reference;
        var rootIndex = pitchRef.indexOf(rootKey.includes('#') || rootKey.includes('b') ? rootKey : rootKey.toUpperCase());
        var baseMidi = (startOctave + 1) * 12 + rootIndex;

        // 3. Pega a "receita"
        var intervals = window.TheoryEngine.getScaleFormula(type);
        
        // 4. Prepara o Tradutor Global (Em vez de 'new')
        // Configuramos o tom da escala uma única vez antes de começar o loop
        window.ContextTranslator.setContext(rootKey);

        // 5. Mapeia os intervalos (Usando function tradicional para o iPad)
        return intervals.map(function(interval) {
            var currentMidi = baseMidi + interval;
            // Usamos o objeto global diretamente
            return window.ContextTranslator.translate(currentMidi);
        });
    }
};