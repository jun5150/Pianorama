/**
 * PIANORAMA - AtlasEngine.js (v14.0)
 */
window.AtlasEngine = {
    processCardData: function(config) {
        var layers = [];
        var baseKey = config.key || "C";
        var parts = (config.id || "scale:major").split(":");
        var category = parts[0];
        var type = parts[1];

        var effectiveKey = window.TheoryEngine.getEffectiveSignature(baseKey, type);
        var mainFlow = { treble: [], bass: [] };

        try {
            if (category === "scale") {
                if (config.layerRelative === true || config.layerRelative === "true") {
                    mainFlow = window.SequenceBuilder.createModelX2(baseKey, type);
                } else {
                    mainFlow.treble = window.ScaleGenerator.generateScale(baseKey + "4", type, effectiveKey);
                    mainFlow.bass = window.ScaleGenerator.generateScale(baseKey + "2", type, effectiveKey);
                }
            }

            layers.push({ id: "main", colorVar: "--pianorama-notation-color", treble: mainFlow.treble, bass: mainFlow.bass });

            if (config.layerChords === true || config.layerChords === "true") {
                var chordTreble = mainFlow.treble.map(function(note, index) {
                    if (!note) return null;
                    var theory = window.TheoryEngine.getDegreeName(index, type); 
                    var chord = window.ChordGenerator.generateChord(note.letter + (note.accidental || "") + note.octave, theory.type, effectiveKey);
                    return window.ChordGenerator.applyInversion(chord, config.inversion || 0);
                });
                layers.push({ id: "chords", colorVar: "--pianorama-notation-chords-color", treble: chordTreble, bass: [], isStack: true });
            }

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
            console.error("AtlasEngine: Erro.", e);
        }

        return { layers: layers, key: baseKey, effectiveKey: effectiveKey, time: config.time || "4/4" };
    }
};