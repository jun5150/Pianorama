/**
 * PIANORAMA - RenderEngine.js
 */

window.RenderEngine = {
    drawSystem: function(ctx, xStart, xEnd, yBase, config) {
        var cfg = window.RenderConfig;
        var secondStaffY = yBase + 40 + cfg.staffGap;
        
        window.RenderSystem.drawStaff(ctx, xStart, xEnd, yBase, { ...config, clef: "treble" });
        window.RenderSystem.drawStaff(ctx, xStart, xEnd, secondStaffY, { ...config, clef: "bass" });
        window.RenderSystem._drawBrace(ctx, xStart, yBase, secondStaffY, config.color);

        ctx.lineWidth = 1; ctx.strokeStyle = config.color || "#000";
        var xBar = Math.floor(xStart) + 0.5;
        ctx.beginPath(); ctx.moveTo(xBar, yBase); ctx.lineTo(xBar, secondStaffY + 40); ctx.stroke();

        this._drawFinalBarline(ctx, xEnd, yBase, secondStaffY, config.color);
        return xStart + cfg.NOTE_X_START; 
    },

    drawNote: function(ctx, x, yBase, noteObj, config) {
        window.RenderNotation.drawNote(ctx, x, yBase, noteObj, config);
    },

    drawLabels: function(ctx, xStart, yBase, labels, config) {
        window.RenderNotation.drawLabels(ctx, xStart, yBase, labels, config);
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