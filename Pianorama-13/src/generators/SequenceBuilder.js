/**
 * PIANORAMA - SequenceBuilder.js (v12.7)
 * Especializado em construir o fluxo linear de notas com inteligência de oitava.
 * Versão robusta: Sem ES6, proteção contra dados nulos.
 */

window.SequenceBuilder = {
    /**
     * Modelo x2: Escala Principal + Pausa + Escala Relativa.
     */
    createModelX2: function(baseKey, type) {
        var scaleType = type || "major"; // Fallback para o tipo
        
        // 1. Escala Principal (Tônica na 4 e Baixo na 2)
        // Usamos var para compatibilidade total com motores antigos
        var mainTreble = window.ScaleGenerator.generateScale(baseKey + "4", scaleType);
        var mainBass = window.ScaleGenerator.generateScale(baseKey + "2", scaleType);

        // 2. Busca a relativa através do TheoryEngine robusto
        var relKey = window.TheoryEngine.getRelativeKey(baseKey, scaleType);
        var relType = window.TheoryEngine.getRelativeScaleType(scaleType);

        // --- INTELIGÊNCIA DE OITAVA (A CURA) ---
        // Padrão: Escala relativa na oitava 4 para visibilidade ideal na pauta
        var targetOctave = "4"; 
        
        // Ex: Se for C maior, a relativa A menor deve soar em A4 para não ficar "escondida"
        if (baseKey === "C" && relKey === "A") {
            targetOctave = "4";
        }

        var relTreble = window.ScaleGenerator.generateScale(relKey + targetOctave, relType);
        
        // Se a escala na oitava 4 falhar (ex: falta de amostras no AudioData), tenta a oitava 3
        if (!relTreble || relTreble.length === 0) {
            relTreble = window.ScaleGenerator.generateScale(relKey + "3", relType);
        }

        var relBass = window.ScaleGenerator.generateScale(relKey + "2", relType);

        // 3. Fusão com tratamento de pausas (null)
        // O concat é excelente e universal para juntar os arrays
        if (relTreble && relTreble.length > 0) {
            var pause = [null]; // Representa o silêncio visual e sonoro entre escalas
            
            return {
                treble: mainTreble.concat(pause, relTreble),
                bass: mainBass.concat(pause, relBass)
            };
        }

        // Caso a relativa falhe por algum motivo, retorna apenas a principal para não travar a UI
        return { 
            treble: mainTreble || [], 
            bass: mainBass || [] 
        };
    }
};