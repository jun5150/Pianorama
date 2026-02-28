/**
 * PIANORAMA - AtlasEngine.js (v13.2)
 * Orquestrador Total: Agora distribuindo tarefas de forma inteligente.
 */
window.AtlasEngine = {
    processCardData: function(config) {
        var layers = [];
        var baseKey = config.key || "C";
        var timeSig = config.time || "4/4";
        var inversion = config.inversion || 0;

        var parts = (config.id || "scale:major").split(":");
        var category = parts;
        var type = parts;

        var mainFlow = { treble: [], bass: [] };

        try {
            // 1. Geração da Melodia/Base (Delegado)
            if (category === "scale") {
                if (config.layerRelative === "true" || config.layerRelative === true) {
                    mainFlow = window.SequenceBuilder.createModelX2(baseKey, type);
                } else {
                    mainFlow.treble = window.ScaleGenerator.generateScale(baseKey + "4", type);
                    mainFlow.bass = window.ScaleGenerator.generateScale(baseKey + "2", type);
                }
            }

            // Camada Principal (Melodia)
            layers.push({
                id: "main",
                colorVar: "--pianorama-notation-color",
                treble: mainFlow.treble,
                bass: mainFlow.bass
            });

            // 2. Camada de Acordes (Delegado ao ChordGenerator + Inteligência do TheoryEngine)
            if (config.layerChords === "true" || config.layerChords === true) {
                var chordTreble = mainFlow.treble.map(function(note, index) {
                    if (!note) return null;
                    
                    // Consulta a "personalidade" do acorde para este grau da escala
                    var theory = window.TheoryEngine.getDegreeName(index, type); 
                    
                    var chord = window.ChordGenerator.generateChord(
                        note.letter + (note.accidental || "") + note.octave, 
                        theory.type, // 'min', 'maj', 'dim', etc.
                        baseKey
                    );

                    // Aplica a inversão (0=fundamental, 1=1ª inv...)
                    return window.ChordGenerator.applyInversion(chord, inversion);
                });

                layers.push({
                    id: "chords",
                    colorVar: "--pianorama-chord-color",
                    treble: chordTreble,
                    bass: [],
                    isStack: true
                });
            }

            // 3. Camada de Graus/Labels (Novo: Texto Dinâmico)
            if (config.layerDegrees === "true" || config.layerDegrees === true) {
                layers.push({
                    id: "degrees",
                    type: "text", 
                    colorVar: "--pianorama-notation-color",
                    data: mainFlow.treble.map(function(note, index) {
                        // O TheoryEngine v12.9.1 já retorna o grau formatado (ex: "IIm", "V", "VII°")
                        var theory = window.TheoryEngine.getDegreeName(index, type);
                        return theory.degree; 
                    })
                });
            }

        } catch (e) {
            console.error("AtlasEngine: Falha na fragmentação.", e);
        }

        return { layers: layers, key: baseKey, time: timeSig };
    }
};