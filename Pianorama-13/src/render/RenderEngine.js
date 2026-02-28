/**
 * PIANORAMA - RenderEngine.js (v10.3)
 */
window.RenderEngine = {
    get CONFIG() { return window.RenderConfig; },

    drawSystem: function(ctx, xStart, xEnd, yBase, config) {
        if (!ctx || typeof ctx.beginPath !== 'function') {
            console.error("RenderEngine: Contexto inválido enviado para drawSystem");
            return xStart + 195;
        }

        var cfg = window.RenderConfig;
        config = config || {};
        var color = config.color || "#000";
        var secondStaffY = yBase + (4 * cfg.lineSp) + cfg.staffGap;

        // Desenha os pentagramas (Clave de Sol e Fá)
        window.RenderSystem.drawStaff(ctx, xStart, xEnd, yBase, {
            clef: "treble", 
            key: config.key, 
            time: config.time, 
            accidentalMode: config.accidentalMode, 
            color: color 
        });

        window.RenderSystem.drawStaff(ctx, xStart, xEnd, secondStaffY, {
            clef: "bass", 
            key: config.key, 
            time: config.time, 
            accidentalMode: config.accidentalMode, 
            color: color 
        });
        
        window.RenderSystem._drawBrace(ctx, xStart, yBase, secondStaffY, color);

        // Barra inicial
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(xStart, yBase - 0.5);
        ctx.lineTo(xStart, secondStaffY + (4 * cfg.lineSp) + 0.5);
        ctx.stroke();

        this._drawFinalBarline(ctx, xEnd, yBase, secondStaffY, color);

        return xStart + cfg.X_NOTE_START; 
    },

    drawNote: function(ctx, x, yBase, noteObj, config) {
        window.RenderNotation.drawNote(ctx, x, yBase, noteObj, config);
    },

    drawLabels: function(ctx, xStart, yBase, labels, config) {
        window.RenderNotation.drawLabels(ctx, xStart, yBase, labels, config);
    },

    _drawFinalBarline: function(ctx, x, yTop, yBottomBase, color) {
        var cfg = window.RenderConfig;
        var yBottom = yBottomBase + (4 * cfg.lineSp);
        ctx.strokeStyle = color || "#000";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x - 6, yTop - 0.5); ctx.lineTo(x - 6, yBottom + 0.5); ctx.stroke();
        ctx.lineWidth = 3.5;
        ctx.beginPath(); ctx.moveTo(x, yTop - 0.5); ctx.lineTo(x, yBottom + 0.5); ctx.stroke();
    }
};