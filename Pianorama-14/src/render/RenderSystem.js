/**
 * PIANORAMA - RenderSystem.js (v13.2)
 */
window.RenderSystem = {
    drawStaff: function(ctx, xStart, xEnd, yBase, config) {
        var cfg = window.RenderConfig;
        ctx.lineWidth = 1; 
        ctx.strokeStyle = config.color || "#000";
        for (var i = 0; i < 5; i++) {
            var y = Math.floor(yBase + (i * cfg.lineSp)) + 0.5;
            ctx.beginPath(); ctx.moveTo(xStart, y); ctx.lineTo(xEnd, y); ctx.stroke();
        }
        var clefGlyph = (config.clef === "bass") ? '\uE062' : '\uE050';
        var clefOffset = (config.clef === "bass") ? cfg.lineSp : 3 * cfg.lineSp;
        this._fill(ctx, xStart + 10, yBase + clefOffset, clefGlyph, cfg.clefSize, config.color);

        if (config.accidentalMode !== "notes") {
            var keyToDraw = config.effectiveKey || config.key || "C";
            this._drawKeySignature(ctx, xStart + 45, yBase, config.clef, keyToDraw, config.color);
        }
        if (config.time) {
            this._drawTimeSignature(ctx, xStart + 145, yBase, config.time, config.color);
        }
    },

    _drawKeySignature: function(ctx, x, yBase, clef, key, color) {
        var cfg = window.RenderConfig;
        var sig = cfg.KEY_MAP[key] || [];
        var isSharp = ["G", "D", "A", "E", "B", "F#", "C#", "G#", "D#", "A#"].indexOf(key) !== -1;
        var glyph = isSharp ? '\uE262' : '\uE260';
        
        // CALIBRAÇÃO ERUDITA: Subimos 2 unidades (10px) em relação à versão anterior
        var pattern = isSharp 
            ? (clef === "treble" ? [8, 5, 9, 6, 3, 7, 4] : [6, 3, 7, 4, 1, 5, 2]) 
            : (clef === "treble" ? [4, 7, 3, 6, 2, 5, 1] : [2, 5, 1, 4, 0, 3, -1]);

        for (var i = 0; i < sig.length; i++) {
            var yP = yBase + 40 - (pattern[i] * 5); 
            this._fill(ctx, x + (i * 12), yP, glyph, cfg.accSize, color);
        }
    },

    _drawBrace: function(ctx, x, yTop, yBottomBase, color) {
        var cfg = window.RenderConfig;
        var totalBottom = yBottomBase + 40;
        var targetY = ((yTop + totalBottom) / 2) + cfg.BRACE_Y_OFFSET;
        this._fill(ctx, x + cfg.BRACE_X_OFFSET, targetY, '\uE000', cfg.braceSize, color);
    },

    _drawTimeSignature: function(ctx, x, yBase, timeStr, color) {
        var cfg = window.RenderConfig;
        var p = timeStr.split("/");
        this._fill(ctx, x, yBase + 10, cfg.TIME_GLYPHS[p[0]] || p[0], cfg.timeSize, color);
        this._fill(ctx, x, yBase + 30, cfg.TIME_GLYPHS[p[1]] || p[1], cfg.timeSize, color);
    },

    _fill: function(ctx, x, y, char, size, color) {
        ctx.fillStyle = color || "black";
        ctx.font = size + "px Bravura";
        ctx.textBaseline = "middle";
        ctx.fillText(char, x, y);
    }
};