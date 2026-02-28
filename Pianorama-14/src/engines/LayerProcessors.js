/**
 * PIANORAMA - LayerProcessors.js (v9.0)
 * Especializado: Fornece os blocos de construção para o AtlasEngine.
 * Removida lógica de preenchimento (null) e offsets.
 */

window.LayerProcessors = {
    /**
     * Gera os dados básicos de uma escala.
     */
    generateScaleData(key, type, octaveTreble = "4", octaveBass = "2") {
        return {
            treble: ScaleGenerator.generateScale(key + octaveTreble, type),
            bass: ScaleGenerator.generateScale(key + octaveBass, type)
        };
    },

    /**
     * Gera o Campo Harmônico para um array de notas existente.
     * Útil para mapear tanto a principal quanto a relativa de forma contínua.
     */
    generateChordLayer(noteArray, chordType = "maj", grammarKey = "C") {
        return noteArray.map(n => {
            if (!n) return null; // Respeita as pausas do fluxo linear
            return ChordGenerator.generateChord(
                n.letter + (n.accidental || "") + n.octave, 
                chordType, 
                grammarKey
            );
        });
    }
};