/**
 * PIANORAMA - RenderEngine.js (v13.1)
 * Orquestrador de desenho que conecta o System e a Notation.
 */

window.RenderEngine = {
    drawSystem: function(ctx, xStart, xEnd, yBase, config) {
        var cfg = window.RenderConfig;
        if (!cfg || !window.RenderSystem) {
            console.error("RenderEngine: RenderConfig ou RenderSystem não encontrados.");
            return xStart;
        }

        var secondStaffY = yBase + 40 + cfg.staffGap;
        
        // Desenha as pautas usando o System
        window.RenderSystem.drawStaff(ctx, xStart, xEnd, yBase, {
            key: config.key,
            effectiveKey: config.effectiveKey,
            accidentalMode: config.accidentalMode,
            time: config.time,
            color: config.color,
            clef: "treble"
        });

        window.RenderSystem.drawStaff(ctx, xStart, xEnd, secondStaffY, {
            key: config.key,
            effectiveKey: config.effectiveKey,
            accidentalMode: config.accidentalMode,
            time: config.time,
            color: config.color,
            clef: "bass"
        });

        // Desenha a chave lateral (Brace)
        window.RenderSystem._drawBrace(ctx, xStart, yBase, secondStaffY, config.color);

        // Linha inicial do sistema
        ctx.lineWidth = 1; 
        ctx.strokeStyle = config.color || "#000";
        var xBar = Math.floor(xStart) + 0.5;
        ctx.beginPath(); 
        ctx.moveTo(xBar, yBase); 
        ctx.lineTo(xBar, secondStaffY + 40); 
        ctx.stroke();

        this._drawFinalBarline(ctx, xEnd, yBase, secondStaffY, config.color);

        return xStart + cfg.NOTE_X_START; 
    },

    drawNote: function(ctx, x, yBase, noteObj, config) {
        if (window.RenderNotation) {
            window.RenderNotation.drawNote(ctx, x, yBase, noteObj, config);
        }
    },

    drawLabels: function(ctx, xStart, yBase, labels, config) {
        if (window.RenderNotation) {
            window.RenderNotation.drawLabels(ctx, xStart, yBase, labels, config);
        }
    },

    _drawFinalBarline: function(ctx, x, yTop, yBottomBase, color) {
        var xBar = Math.floor(x) + 0.5;
        ctx.strokeStyle = color || "#000";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(xBar - 6, yTop); ctx.lineTo(xBar - 6, yBottomBase + 40); ctx.stroke();
        ctx.lineWidth = 3.5;
        ctx.beginPath(); ctx.moveTo(xBar, yTop); ctx.lineTo(xBar, yBottomBase + 40); ctx.stroke();
    }
};