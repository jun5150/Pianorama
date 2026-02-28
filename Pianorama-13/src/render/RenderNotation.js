/**
 * PIANORAMA - RenderNotation.js (v10.4)
 * Ajuste: Traços ultra-finos (0.5px offset) e otimização de linhas suplementares.
 */

window.RenderNotation = {
    drawNote: function(ctx, x, yBase, noteObj, config) {
        if (!ctx || !noteObj) return;
        
        // Se for um acorde (Array), tratamos as linhas suplementares uma única vez
        if (Array.isArray(noteObj)) {
            var self = this;
            var minAbsY = 100, maxAbsY = 0;
            noteObj.forEach(function(n) {
                minAbsY = Math.min(minAbsY, n.absoluteY);
                maxAbsY = Math.max(maxAbsY, n.absoluteY);
            });
            
            // Desenha as linhas suplementares baseadas na nota mais alta/baixa do acorde
            this._drawLedgers(ctx, x, yBase, minAbsY, maxAbsY, config.clef, config.color);

            // Desenha as cabeças de nota
            noteObj.forEach(function(s) { 
                self._drawNoteHead(ctx, x, yBase, s, config);
            });
            return;
        }

        // Se for nota simples
        this._drawLedgers(ctx, x, yBase, noteObj.absoluteY, noteObj.absoluteY, config.clef, config.color);
        this._drawNoteHead(ctx, x, yBase, noteObj, config);
    },

    _drawNoteHead: function(ctx, x, yBase, noteObj, config) {
        var cfg = window.RenderConfig;
        var step = cfg.lineSp / 2;
        var anchor = (config.clef === "bass") ? 18 : 30; 
        var visualBase = yBase + (4 * cfg.lineSp);
        var yPos = visualBase - ((noteObj.absoluteY - anchor) * step);

        this._drawStem(ctx, x, yPos, noteObj.absoluteY, config.clef, config.color);
        this._fill(ctx, x, yPos, '\uE0A4', cfg.fontSize, config.color);

        if (noteObj.accidental && config.accidentalMode !== "signature") {
            this._fill(ctx, x - 16, yPos, noteObj.glyph, cfg.accSize, config.color);
        }
    },

    _drawStem: function(ctx, x, yH, absY, clef, color) {
        var cfg = window.RenderConfig;
        ctx.lineWidth = 1.2; 
        ctx.strokeStyle = color || "#000";
        var isDown = absY >= (clef === "bass" ? 22 : 34); 
        ctx.beginPath();
        // Arredondamos o X para evitar o traço grosso
        var xLine = Math.floor(x) + 0.5;
        if (isDown) { 
            ctx.moveTo(xLine + 1, yH + 4); ctx.lineTo(xLine + 1, yH + cfg.stemHeight + 4); 
        } else { 
            ctx.moveTo(xLine + 12, yH - 4); ctx.lineTo(xLine + 12, yH - (cfg.stemHeight + 4)); 
        }
        ctx.stroke();
    },

    _drawLedgers: function(ctx, x, yBase, minAbsY, maxAbsY, clef, color) {
        var cfg = window.RenderConfig;
        ctx.lineWidth = 1;
        ctx.strokeStyle = color || "#000";
        var anchor = (clef === "bass") ? 18 : 30;
        var visualBase = yBase + (4 * cfg.lineSp);
        var step = cfg.lineSp / 2;
        var xStart = Math.floor(x - 6) + 0.5;
        var xEnd = Math.floor(x + 19) + 0.5;

        // Linhas abaixo da pauta (como o C4 na clave de sol)
        if (minAbsY <= anchor - 2) {
            for (var i = anchor - 2; i >= minAbsY; i -= 2) {
                var yL = Math.floor(visualBase - ((i - anchor) * step)) + 0.5;
                ctx.beginPath(); ctx.moveTo(xStart, yL); ctx.lineTo(xEnd, yL); ctx.stroke();
            }
        }
        // Linhas acima da pauta
        if (maxAbsY >= anchor + 12) {
            for (var j = anchor + 12; j <= maxAbsY; j += 2) {
                var yL2 = Math.floor(visualBase - ((j - anchor) * step)) + 0.5;
                ctx.beginPath(); ctx.moveTo(xStart, yL2); ctx.lineTo(xEnd, yL2); ctx.stroke();
            }
        }
    },

    drawLabels: function(ctx, xStart, yBase, labels, config) {
        if (!labels) return;
        var cfg = window.RenderConfig;
        var totalBottom = yBase + (4 * cfg.lineSp) + cfg.staffGap + (4 * cfg.lineSp);
        var yP = totalBottom + 25; 
        ctx.fillStyle = config.color || "#666";
        ctx.font = "bold 13px Arial, sans-serif";
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