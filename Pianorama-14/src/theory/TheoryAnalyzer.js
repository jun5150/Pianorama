/**
 * PIANORAMA - TheoryAnalyzer.js (v14.0)
 */
window.TheoryEngine = window.TheoryEngine || {};

(function(TE) {
    // Nova função: Calcula a armadura real baseada na nota e no tipo de escala
    TE.getEffectiveSignature = function(key, scaleType) {
        if (!scaleType || scaleType.indexOf("major") !== -1 || scaleType === "ionian") {
            return key; // Tonalidade direta
        }
        
        // Se for menor natural ou modo eólio, a armadura é a da Relativa Maior
        if (scaleType.indexOf("minor_natural") !== -1 || scaleType === "aeolian") {
            return TE.getRelativeKey(key, "major");
        }

        // Para outros modos ou escalas, poderíamos expandir a lógica aqui.
        // Por padrão, retorna a própria chave se não houver regra específica.
        return key;
    };

    TE.getDegreeName = function(index, scaleType) {
        var degrees = ["I", "II", "III", "IV", "V", "VI", "VII"];
        var label = degrees[index] || "?";
        var type = "maj"; 

        var field = (window.CHORDS && window.CHORDS.harmonic_fields) ? 
                    (window.CHORDS.harmonic_fields[scaleType] || window.CHORDS.harmonic_fields["major"]) : 
                    null;

        if (field) {
            var suffix = (field.triads && field.triads[index]) ? field.triads[index] : "";
            label = label + suffix;
            if (suffix === "m") type = "min";
            else if (suffix === "dim" || suffix === "°") type = "dim";
            else if (suffix === "aug" || suffix === "+") type = "aug";
        }
        return { degree: label, type: type };
    };

    TE.getRelativeKey = function(key, targetType) {
        if (!window.PIANORAMA_DATA || !window.PIANORAMA_DATA.relative_map) return key;
        // Se queremos a relativa maior de uma nota menor
        if (targetType === "major") {
            // Inverte a busca no mapa de relativas
            for (var major in window.PIANORAMA_DATA.relative_map) {
                if (window.PIANORAMA_DATA.relative_map[major] === key) return major;
            }
        }
        return window.PIANORAMA_DATA.relative_map[key] || key;
    };

    TE.getRelativeScaleType = function(type) {
        if (type === "major") return "minor_natural";
        if (type === "minor_natural") return "major";
        return type;
    };
})(window.TheoryEngine);