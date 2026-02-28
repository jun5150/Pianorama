/**
 * PIANORAMA - AtlasEngine.js (v13.1)
 * Orquestrador Total: Agora distribuindo tarefas.
 */
window.AtlasEngine = {
    processCardData: function(config) {
        var layers = [];
        var baseKey = config.key || "C";
        var timeSig = config.time || "4/4";
        var inversion = config.inversion || 0;

        var parts = (config.id || "scale:major").split(":");
        var category = parts[0];
        var type = parts[1];

        var mainFlow = { treble: [], bass: [] };

        // 1. Delega a geração da melodia/base para ScaleGenerator ou SequenceBuilder
        try {
            if (category === "scale") {
                if (config.layerRelative === "true" || config.layerRelative === true) {
                    mainFlow = window.SequenceBuilder.createModelX2(baseKey, type);
                } else {
                    mainFlow.treble = window.ScaleGenerator.generateScale(baseKey + "4", type);
                    mainFlow.bass = window.ScaleGenerator.generateScale(baseKey + "2", type);
                }
            }

            // Camada Principal
            layers.push({
                id: "main",
                colorVar: "--pianorama-notation-color",
                treble: mainFlow.treble,
                bass: mainFlow.bass
            });

            // 2. Delega a geração de acordes para o seu ChordGenerator
            if (config.layerChords === "true" || config.layerChords === true) {
                var self = this;
                var chordTreble = mainFlow.treble.map(function(note) {
                    if (!note) return null;
                    
                    // Aqui mora a inteligência: gera o acorde e já aplica a inversão
                    var chord = window.ChordGenerator.generateChord(
                        note.letter + (note.accidental || "") + note.octave, 
                        "maj", // TODO: No futuro, pegar o tipo real (maj, min, dim...) do TheoryEngine
                        baseKey
                    );

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

            // 3. Camada de Graus/Labels (Novo!)
            if (config.layerDegrees === "true" || config.layerDegrees === true) {
                layers.push({
                    id: "degrees",
                    type: "text", // O RenderEngine deve estar pronto para ignorar desenho de nota aqui
                    colorVar: "--pianorama-notation-color",
                    data: mainFlow.treble.map(function(note, index) {
                        // Pergunta ao TheoryEngine qual o nome do grau
                        return window.TheoryEngine.getDegreeName(index).degree; 
                    })
                });
            }

        } catch (e) {
            console.error("AtlasEngine: Falha na fragmentação.", e);
        }

        return { layers: layers, key: baseKey, time: timeSig };
    }
};