/**
 * PIANORAMA - RenderEngine.js (v10.1)
 */
window.RenderEngine = {
    get CONFIG() { return window.RenderConfig; },

    drawSystem: function(ctx, xStart, xEnd, yBase, config) {
        config = config || {};
        var cfg = window.RenderConfig;
        var color = config.color || "#000";
        var gap = cfg.staffGap;
        var secondStaffY = yBase + (4 * cfg.lineSp) + gap;
        var totalBottom = secondStaffY + (4 * cfg.lineSp);
        
        ctx.strokeStyle = color;
        ctx.fillStyle = color;

        // Criamos cópias dos configs para cada pentagrama
        var trebleCfg = JSON.parse(JSON.stringify(config));
        trebleCfg.clef = "treble";
        
        var bassCfg = JSON.parse(JSON.stringify(config));
        bassCfg.clef = "bass";

        window.RenderSystem.drawStaff(ctx, xStart, xEnd, yBase, trebleCfg);
        window.RenderSystem.drawStaff(ctx, xStart, xEnd, secondStaffY, bassCfg);
        
        window.RenderSystem._drawBrace(ctx, xStart, yBase, secondStaffY, color);

        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(xStart, yBase - 0.5);
        ctx.lineTo(xStart, totalBottom + 0.5);
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
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x - 6, yTop - 0.5); ctx.lineTo(x - 6, yBottom + 0.5); ctx.stroke();
        ctx.lineWidth = 3.5;
        ctx.beginPath(); ctx.moveTo(x, yTop - 0.5); ctx.lineTo(x, yBottom + 0.5); ctx.stroke();
    }
};
