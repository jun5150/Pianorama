/**
 * PIANORAMA - RenderSystem.js
 */
window.RenderSystem = {
    drawStaff: function(ctx, xStart, xEnd, yBase, config) {
        if (!ctx || typeof ctx.beginPath !== 'function') return;
        var cfg = window.RenderConfig;
        var color = config.color || "#000";
        
        ctx.lineWidth = 1; 
        ctx.strokeStyle = color;
        for (var i = 0; i < 5; i++) {
            var y = yBase + (i * cfg.lineSp);
            ctx.beginPath();
            ctx.moveTo(xStart, y);
            ctx.lineTo(xEnd, y);
            ctx.stroke();
        }

        var clefGlyph = (config.clef === "bass") ? '\uE062' : '\uE050';
        var clefOffset = (config.clef === "bass") ? cfg.lineSp : 3 * cfg.lineSp;
        this._fill(ctx, xStart + cfg.X_CLEF, yBase + clefOffset, clefGlyph, cfg.clefSize, color);

        if (config.accidentalMode !== "notes") {
            this._drawKeySignature(ctx, xStart + cfg.X_KEY_SIG, yBase, config.clef, config.key, color);
        }
        if (config.time) {
            this._drawTimeSignature(ctx, xStart + cfg.X_TIME_SIG, yBase, config.time, color);
        }
    },

    _drawTimeSignature: function(ctx, x, yBase, timeStr, color) {
        var cfg = window.RenderConfig;
        var p = timeStr.split("/");
        if (p.length !== 2) return;
        this._fill(ctx, x, yBase + cfg.lineSp, cfg.TIME_GLYPHS[p[0]] || p[0], cfg.timeSize, color);
        this._fill(ctx, x, yBase + (3 * cfg.lineSp), cfg.TIME_GLYPHS[p[1]] || p[1], cfg.timeSize, color);
    },

    _drawKeySignature: function(ctx, x, yBase, clef, key, color) {
        var cfg = window.RenderConfig;
        var sig = cfg.KEY_MAP[key] || [];
        if (sig.length === 0) return;
        var isSharp = ["G", "D", "A", "E", "B", "F#", "C#"].indexOf(key) !== -1;
        var glyph = isSharp ? '\uE262' : '\uE260';
        var pattern = isSharp 
            ? (clef === "treble" ? [0, 3, -1, 2, 5, 1, 4] : [-2, 1, -3, 0, 3, -1, 2]) 
            : (clef === "treble" ? [4, 1, 5, 2, 6, 3, 7] : [2, -1, 3, 0, 4, 1, 5]);

        for (var i = 0; i < sig.length; i++) {
            var yP = yBase + (2 * cfg.lineSp) - (pattern[i] * (cfg.lineSp / 2));
            this._fill(ctx, x + (i * 12), yP, glyph, cfg.accSize, color);
        }
    },

    _drawBrace: function(ctx, x, yTop, yBottom, color) {
        var cfg = window.RenderConfig;
        var totalBottom = yBottom + (4 * cfg.lineSp);
        this._fill(ctx, x - 18, (yTop + totalBottom) / 2, '\uE000', cfg.braceSize, color);
    },

    _fill: function(ctx, x, y, char, size, color) {
        ctx.fillStyle = color || "black";
        ctx.font = size + "px Bravura";
        ctx.textBaseline = "middle";
        ctx.fillText(char, x, y);
    }
};