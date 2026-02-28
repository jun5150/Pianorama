/**
 * PIANORAMA - RenderNotation.js
 */

window.RenderNotation = {
    drawNote: function(ctx, x, yBase, noteObj, config) {
        if (!noteObj) return;
        var self = this;
        var clef = config.clef || "treble";
        
        if (Array.isArray(noteObj)) {
            var min = 100, max = 0;
            noteObj.forEach(n => { min = Math.min(min, n.absoluteY); max = Math.max(max, n.absoluteY); });
            this._drawLedgers(ctx, x, yBase, min, max, clef, config.color);
            noteObj.forEach(n => this._drawNoteHead(ctx, x, yBase, n, config));
        } else {
            this._drawLedgers(ctx, x, yBase, noteObj.absoluteY, noteObj.absoluteY, clef, config.color);
            this._drawNoteHead(ctx, x, yBase, noteObj, config);
        }
    },

    _drawNoteHead: function(ctx, x, yBase, noteObj, config) {
        var anchor = (config.clef === "bass") ? 18 : 30; 
        var yPos = (yBase + 40) - ((noteObj.absoluteY - anchor) * 5);
        this._drawStem(ctx, x, yPos, noteObj.absoluteY, config.clef, config.color);
        this._fill(ctx, x, yPos, '\uE0A4', 45, config.color);
        if (noteObj.accidental && config.accidentalMode !== "signature") {
            this._fill(ctx, x - 16, yPos, noteObj.glyph, 32, config.color);
        }
    },

    _drawStem: function(ctx, x, yH, absY, clef, color) {
        ctx.lineWidth = 1.2; ctx.strokeStyle = color || "#000";
        var isDown = absY >= (clef === "bass" ? 22 : 34); 
        var xL = Math.floor(x) + 0.5;
        ctx.beginPath();
        if (isDown) { ctx.moveTo(xL + 1, yH + 4); ctx.lineTo(xL + 1, yH + 36); } 
        else { ctx.moveTo(xL + 12, yH - 4); ctx.lineTo(xL + 12, yH - 36); }
        ctx.stroke();
    },

    _drawLedgers: function(ctx, x, yBase, min, max, clef, color) {
        ctx.lineWidth = 1; ctx.strokeStyle = color || "#000";
        var anchor = (clef === "bass") ? 18 : 30;
        var vBase = yBase + 40;
        var xS = Math.floor(x - 6) + 0.5;
        var xE = Math.floor(x + 19) + 0.5;

        if (min <= anchor - 2) {
            for (var i = anchor - 2; i >= min; i -= 2) {
                var y = Math.floor(vBase - ((i - anchor) * 5)) + 0.5;
                ctx.beginPath(); ctx.moveTo(xS, y); ctx.lineTo(xE, y); ctx.stroke();
            }
        }
        if (max >= anchor + 12) {
            for (var j = anchor + 12; j <= max; j += 2) {
                var y2 = Math.floor(vBase - ((j - anchor) * 5)) + 0.5;
                ctx.beginPath(); ctx.moveTo(xS, y2); ctx.lineTo(xE, y2); ctx.stroke();
            }
        }
    },

    drawLabels: function(ctx, xStart, yBase, labels, config) {
        if (!labels) return;
        var yP = yBase + 40 + 80 + 40 + 25; 
        ctx.fillStyle = config.color || "#666";
        ctx.font = "bold 13px Arial, sans-serif";
        ctx.textAlign = "center"; ctx.textBaseline = "top";
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