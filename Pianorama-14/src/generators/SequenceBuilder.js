/**
 * PIANORAMA - SequenceBuilder.js (v12.8)
 */
window.SequenceBuilder = {
    createModelX2: function(baseKey, type) {
        var scaleType = type || "major";
        var cleanKey = String(baseKey); // Força conversão para string

        var mainTreble = window.ScaleGenerator.generateScale(cleanKey + "4", scaleType);
        var mainBass = window.ScaleGenerator.generateScale(cleanKey + "2", scaleType);

        var relKey = window.TheoryEngine.getRelativeKey(cleanKey, scaleType);
        var relType = window.TheoryEngine.getRelativeScaleType(scaleType);

        var targetOctave = "4"; 
        if (cleanKey === "C" && relKey === "A") targetOctave = "4";

        var relTreble = window.ScaleGenerator.generateScale(relKey + targetOctave, relType);
        if (!relTreble || relTreble.length === 0) {
            relTreble = window.ScaleGenerator.generateScale(relKey + "3", relType);
        }

        var relBass = window.ScaleGenerator.generateScale(relKey + "2", relType);

        if (mainTreble && mainTreble.length > 0) {
            var pause = [null];
            return {
                treble: mainTreble.concat(pause, relTreble || []),
                bass: mainBass.concat(pause, relBass || [])
            };
        }

        return { treble: mainTreble, bass: mainBass };
    }
};