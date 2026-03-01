/**
 * PIANORAMA - AtlasEngine.js (v14.0)
 * Orquestrador: Agora calcula a armadura efetiva (Ex: C + Menor = Eb Major Sig).
 */
window.AtlasEngine = {
    processCardData: function(config) {
        var layers = [];
        var baseKey = config.key || "C";
        var parts = (config.id || "scale:major").split(":");
        var category = parts[0];
        var type = parts[1];

        // 1. CÁLCULO DA ARMADURA EFETIVA
        // Se for C Menor, effectiveKey será "Eb" (para desenhar 3 bemóis)
        var effectiveKey = window.TheoryEngine.getEffectiveSignature(baseKey, type);

        var mainFlow = { treble: [], bass: [] };

        try {
            // 2. GERAÇÃO DA ESCALA (Agora enviando a armadura efetiva)
            if (category === "scale") {
                if (config.layerRelative === true || config.layerRelative === "true") {
                    mainFlow = window.SequenceBuilder.createModelX2(baseKey, type);
                } else {
                    mainFlow.treble = window.ScaleGenerator.generateScale(baseKey + "4", type, effectiveKey);
                    mainFlow.bass = window.ScaleGenerator.generateScale(baseKey + "2", type, effectiveKey);
                }
            }

            // Camada Principal
            layers.push({
                id: "main",
                colorVar: "--pianorama-notation-color",
                treble: mainFlow.treble,
                bass: mainFlow.bass
            });

            // 3. CAMADA DE ACORDES
            if (config.layerChords === true || config.layerChords === "true") {
                var chordTreble = mainFlow.treble.map(function(note, index) {
                    if (!note) return null;
                    var theory = window.TheoryEngine.getDegreeName(index, type); 
                    var chord = window.ChordGenerator.generateChord(
                        note.letter + (note.accidental || "") + note.octave, 
                        theory.type, 
                        effectiveKey // Acordes também respeitam a armadura efetiva
                    );
                    return window.ChordGenerator.applyInversion(chord, config.inversion || 0);
                });

                layers.push({ id: "chords", colorVar: "--pianorama-notation-chords-color", treble: chordTreble, bass: [], isStack: true });
            }

            // 4. CAMADA DE GRAUS
            if (config.layerDegrees === true || config.layerDegrees === "true") {
                layers.push({
                    id: "degrees",
                    type: "text", 
                    colorVar: "--pianorama-notation-color",
                    data: mainFlow.treble.map(function(note, index) {
                        var theory = window.TheoryEngine.getDegreeName(index, type);
                        return theory.degree; 
                    })
                });
            }

        } catch (e) {
            console.error("AtlasEngine: Falha no processamento.", e);
        }

        // Retornamos a effectiveKey para que o RenderSystem saiba o que desenhar na clave
        return { 
            layers: layers, 
            key: baseKey, 
            effectiveKey: effectiveKey, 
            time: config.time || "4/4" 
        };
    }
};