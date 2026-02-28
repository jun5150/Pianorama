/**
 * PIANORAMA - RenderEngine.js (v2.2)
 */

window.RenderEngine = {
    drawStaff: function(ctx, xStart, xEnd, yBase, config) {
        if (window.RenderSystem && window.RenderSystem.drawStaff) {
            // GARANTIA: RenderSystem exige a propriedade 'key' para a armadura
            var finalConfig = {
                ...config,
                key: config.key || config.keySignature || "C",
                color: config.color || "#000"
            };
            window.RenderSystem.drawStaff(ctx, xStart, xEnd, yBase, finalConfig);
        }
    },

    drawSystem: function(ctx, xStart, xEnd, yBase, config) {
        var cfg = window.RenderConfig;
        var secondStaffY = yBase + 40 + cfg.staffGap;
        
        this.drawStaff(ctx, xStart, xEnd, yBase, { ...config, clef: "treble" });
        this.drawStaff(ctx, xStart, xEnd, secondStaffY, { ...config, clef: "bass" });
        
        if (window.RenderSystem && window.RenderSystem._drawBrace) {
            window.RenderSystem._drawBrace(ctx, xStart, yBase, secondStaffY, config.color);
        }

        ctx.lineWidth = 1; ctx.strokeStyle = config.color || "#000";
        var xBar = Math.floor(xStart) + 0.5;
        ctx.beginPath(); ctx.moveTo(xBar, yBase); ctx.lineTo(xBar, secondStaffY + 40); ctx.stroke();

        this._drawFinalBarline(ctx, xEnd, yBase, secondStaffY, config.color);
        return xStart + cfg.NOTE_X_START; 
    },

    drawNote: function(ctx, x, yBase, noteObj, config) {
        if (window.RenderNotation && window.RenderNotation.drawNote) {
            window.RenderNotation.drawNote(ctx, x, yBase, noteObj, config);
        }
    },

    drawLabels: function(ctx, xStart, yBase, labels, config) {
        if (window.RenderNotation && window.RenderNotation.drawLabels) {
            window.RenderNotation.drawLabels(ctx, xStart, yBase, labels, config);
        }
    },

    _drawFinalBarline: function(ctx, x, yTop, yBottomBase, color) {
        var xBar = Math.floor(x) + 0.5;
        ctx.lineWidth = 1; ctx.strokeStyle = color || "#000";
        ctx.beginPath(); ctx.moveTo(xBar, yTop); ctx.lineTo(xBar, yBottomBase + 40); ctx.stroke();
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(xBar + 4, yTop); ctx.lineTo(xBar + 4, yBottomBase + 40); ctx.stroke();
    }
};