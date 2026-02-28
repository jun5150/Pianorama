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

            // 2. Camada de Acordes
            if (config.layerChords === "true" || config.layerChords === true) {
                var chordTreble = mainFlow.treble.map(function(note, index) {
                    if (!note) return null;
        
                    // NOVIDADE: Pergunta ao TheoryEngine qual o tipo de acorde para este grau
                    var theory = window.TheoryEngine.getDegreeName(index, type); 
        
                    var chord = window.ChordGenerator.generateChord(
                        note.letter + (note.accidental || "") + note.octave, 
                        theory.type, // 'min', 'maj', 'dim' vindo do campo harmônico real
                        baseKey
                    );

                    // Aplica a inversão escolhida no Laboratório
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

            // 3. Camada de Graus/Labels
            if (config.layerDegrees === "true" || config.layerDegrees === true) {
                layers.push({
                    id: "degrees",
                    type: "text", 
                    colorVar: "--pianorama-notation-color",
                    data: mainFlow.treble.map(function(note, index) {
                        // Pega o objeto completo {degree: "II", type: "min"}
                        var theory = window.TheoryEngine.getDegreeName(index, type);
                        // Formata o label: ex "I", "IIm", "V7"
                        var label = theory.degree + (theory.type === "min" ? "m" : theory.type === "dim" ? "°" : "");
                        return label;
                    })
                });
            }

        } catch (e) {
            console.error("AtlasEngine: Falha na fragmentação.", e);
        }

        return { layers: layers, key: baseKey, time: timeSig };
    }
};
