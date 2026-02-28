/**
 * PIANORAMA - RenderNotation.js
 */
window.RenderNotation = {
    drawNote: function(ctx, x, yBase, noteObj, config) {
        config = config || {}; 
        if (!noteObj) return;
        if (Array.isArray(noteObj)) {
            var self = this;
            noteObj.forEach(function(s) { self.drawNote(ctx, x, yBase, s, config); });
            return;
        }

        var cfg = window.RenderConfig;
        var color = config.color || "#000";
        var clef = config.clef || "treble";
        var step = cfg.lineSp / 2;
        var anchor = (clef === "bass") ? 18 : 30; 
        var visualBase = yBase + (4 * cfg.lineSp);
        var yPos = visualBase - ((noteObj.absoluteY - anchor) * step);

        this._drawLedgers(ctx, x, yBase, noteObj.absoluteY, clef, color);
        this._drawStem(ctx, x, yPos, noteObj.absoluteY, clef, color);
        this._fill(ctx, x, yPos, '\uE0A4', cfg.fontSize, color);

        if (noteObj.accidental && config.accidentalMode !== "signature") {
            this._fill(ctx, x - 15, yPos, noteObj.glyph, cfg.accSize, color);
        }
    },

    _drawStem: function(ctx, x, yH, absY, clef, color) {
        var cfg = window.RenderConfig;
        ctx.lineWidth = 1.3; 
        ctx.strokeStyle = color || "#000";
        var isDown = absY >= (clef === "bass" ? 22 : 34); 
        ctx.beginPath();
        if (isDown) { 
            ctx.moveTo(x + 1, yH + 4); ctx.lineTo(x + 1, yH + cfg.stemHeight + 4); 
        } else { 
            ctx.moveTo(x + 13, yH - 4); ctx.lineTo(x + 13, yH - (cfg.stemHeight + 4)); 
        }
        ctx.stroke();
    },

    _drawLedgers: function(ctx, x, yBase, absY, clef, color) {
        var cfg = window.RenderConfig;
        var anchor = (clef === "bass") ? 18 : 30;
        var vBase = yBase + (4 * cfg.lineSp);
        var step = cfg.lineSp / 2;

        if (absY <= anchor - 2) {
            for (var i = anchor - 2; i >= absY; i -= 2) {
                var yL = vBase - ((i - anchor) * step);
                ctx.beginPath(); ctx.moveTo(x - 6, yL); ctx.lineTo(x + 18, yL); ctx.stroke();
            }
        }
        if (absY >= anchor + 12) {
            for (var j = anchor + 12; j <= absY; j += 2) {
                var yL2 = vBase - ((j - anchor) * step);
                ctx.beginPath(); ctx.moveTo(x - 6, yL2); ctx.lineTo(x + 18, yL2); ctx.stroke();
            }
        }
    },

    drawLabels: function(ctx, xStart, yBase, labels, config) {
        config = config || {};
        var cfg = window.RenderConfig;
        if (!labels) return;
        var totalBottom = yBase + (4 * cfg.lineSp) + cfg.staffGap + (4 * cfg.lineSp);
        var yP = totalBottom + 25; 
        ctx.fillStyle = config.color || "#666";
        ctx.font = "bold 14px Arial, sans-serif"; 
        ctx.textAlign = "center"; 
        ctx.textBaseline = "top";
        for (var i = 0; i < labels.length; i++) {
            if (labels[i]) ctx.fillText(labels[i], xStart + (i * 45) + 6, yP);
        }
    },

    _fill: function(ctx, x, y, char, size, color) {
        ctx.fillStyle = color || "black";
        ctx.font = size + "px Bravura";
        ctx.textBaseline = "middle";
        ctx.fillText(char, x, y);
    }
};