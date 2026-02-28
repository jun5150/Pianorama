/**
 * PIANORAMA - RenderEngine.js (v9.7)
 * LARGURA 100% FIXA E CORRIGIDA.
 */

window.RenderEngine = {
    CONFIG: {
        lineSp: 10,
        fontSize: 45,
        accSize: 32,
        clefSize: 40,
        staffGap: 80,
        stemHeight: 32,
        timeSize: 42,
        braceSize: 160,
        X_CLEF: 10,         // Onde a clave começa
        X_KEY_SIG: 45,      // Onde a armadura começa (reserva espaço para até 7 acidentes)
        X_TIME_SIG: 145,    // Onde o tempo começa (fixo, após o espaço da armadura)
        X_NOTE_START: 195   // Onde a primeira nota SEMPRE começa
    },

    TIME_GLYPHS: {
        "0": "\uE080", "1": "\uE081", "2": "\uE082", "3": "\uE083", "4": "\uE084",
        "5": "\uE085", "6": "\uE086", "7": "\uE087", "8": "\uE088", "9": "\uE089"
    },

    KEY_MAP: {
        "C": [], "G": ["F"], "D": ["F", "C"], "A": ["F", "C", "G"], "E": ["F", "C", "G", "D"], 
        "B": ["F", "C", "G", "D", "A"], "F#": ["F", "C", "G", "D", "A", "E"], "C#": ["F", "C", "G", "D", "A", "E", "B"],
        "F": ["B"], "Bb": ["B", "E"], "Eb": ["B", "E", "A"], "Ab": ["B", "E", "A", "D"], 
        "Db": ["B", "E", "A", "D", "G"], "Gb": ["B", "E", "A", "D", "G", "C"], "Cb": ["B", "E", "A", "D", "G", "C", "F"]
    },

    drawSystem: function(ctx, xStart, xEnd, yBase, config) {
        var color = config.color || "#000";
        var gap = this.CONFIG.staffGap;
        var secondStaffY = yBase + (4 * this.CONFIG.lineSp) + gap;
        var totalBottom = secondStaffY + (4 * this.CONFIG.lineSp);
        
        ctx.strokeStyle = color;
        ctx.fillStyle = color;

        // Renderiza os contextos (Claves, Armaduras e Tempos em locais fixos)
        this.drawStaffContext(ctx, xStart, xEnd, yBase, { ...config, clef: "treble" });
        this.drawStaffContext(ctx, xStart, xEnd, secondStaffY, { ...config, clef: "bass" });
        
        this._drawBrace(ctx, xStart, yBase, secondStaffY, color);

        // Barra de sistema inicial
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(xStart, yBase - 0.5);
        ctx.lineTo(xStart, totalBottom + 0.5);
        ctx.stroke();

        this._drawFinalBarline(ctx, xEnd, yBase, secondStaffY, color);

        // TRAVA TOTAL: Retorna o ponto fixo onde as notas devem começar
        return xStart + this.CONFIG.X_NOTE_START; 
    },

    drawStaffContext: function(ctx, xStart, xEnd, yBase, config) {
        var color = config.color || "#000";
        
        // Desenha as 5 linhas
        ctx.lineWidth = 1; 
        ctx.strokeStyle = color;
        for (var i = 0; i < 5; i++) {
            var y = yBase + (i * this.CONFIG.lineSp);
            ctx.beginPath(); ctx.moveTo(xStart, y); ctx.lineTo(xEnd, y); ctx.stroke();
        }

        // 1. Clave
        var clefGlyph = (config.clef === "bass") ? '\uE062' : '\uE050';
        var clefOffset = (config.clef === "bass") ? 1 * this.CONFIG.lineSp : 3 * this.CONFIG.lineSp;
        this._fillGlyph(ctx, xStart + this.CONFIG.X_CLEF, yBase + clefOffset, clefGlyph, this.CONFIG.clefSize, color);

        // 2. Armadura (Sempre começa no pixel 45, independente de quantos acidentes tenha)
        if (config.accidentalMode !== "notes") {
            this._drawKeySignature(ctx, xStart + this.CONFIG.X_KEY_SIG, yBase, config.clef, config.key, color);
        }

        // 3. Fórmula de Compasso (Sempre começa no pixel 145)
        if (config.time) {
            this._drawTimeSignature(ctx, xStart + this.CONFIG.X_TIME_SIG, yBase, config.time, color);
        }
    },

    _drawTimeSignature: function(ctx, x, yBase, timeStr, color) {
        var p = timeStr.split("/");
        if (p.length !== 2) return;
        // CORREÇÃO: p[0] e p[1] para acessar os glifos corretamente
        this._fillGlyph(ctx, x, yBase + this.CONFIG.lineSp, this.TIME_GLYPHS[p[0]] || p[0], this.CONFIG.timeSize, color);
        this._fillGlyph(ctx, x, yBase + (3 * this.CONFIG.lineSp), this.TIME_GLYPHS[p[1]] || p[1], this.CONFIG.timeSize, color);
    },

    _drawKeySignature: function(ctx, x, yBase, clef, key, color) {
        var sig = this.KEY_MAP[key] || [];
        if (sig.length === 0) return;
        var isSharp = ["G", "D", "A", "E", "B", "F#", "C#"].indexOf(key) !== -1;
        var glyph = isSharp ? '\uE262' : '\uE260';
        
        // CORREÇÃO: Ternário corrigido para o padrão de bemóis na clave de sol
        var pattern = isSharp 
            ? (clef === "treble" ? [0, 3, -1, 2, 5, 1, 4] : [-2, 1, -3, 0, 3, -1, 2]) 
            : (clef === "treble" ? [4, 1, 5, 2, 6, 3, 7] : [2, -1, 3, 0, 4, 1, 5]);

        for (var i = 0; i < sig.length; i++) {
            var yP = yBase + (2 * this.CONFIG.lineSp) - (pattern[i] * (this.CONFIG.lineSp / 2));
            this._fillGlyph(ctx, x + (i * 12), yP, glyph, this.CONFIG.accSize, color);
        }
    },

    // ... (restante das funções _drawStem, _drawLedgers, etc permanecem como na sua v9.6)

    _fillGlyph: function(ctx, x, y, char, size, color) {
        ctx.fillStyle = color || "black";
        ctx.font = size + "px Bravura";
        ctx.textBaseline = "middle";
        ctx.fillText(char, x, y);
    },

    drawNote: function(ctx, x, yBase, noteObj, config) {
        if (!noteObj) return;

        if (Array.isArray(noteObj)) {
            var self = this;
            noteObj.forEach(function(s) { self.drawNote(ctx, x, yBase, s, config); });
            return;
        }

        var clef = config.clef || "treble";
        var step = this.CONFIG.lineSp / 2;
        var anchor = (clef === "bass") ? 18 : 30; 
        var visualBase = yBase + (4 * this.CONFIG.lineSp);
        var yPos = visualBase - ((noteObj.absoluteY - anchor) * step);

        this._drawLedgers(ctx, x, yBase, noteObj.absoluteY, clef, config.color);
        this._drawStem(ctx, x, yPos, noteObj.absoluteY, clef, config.color);
        this._fillGlyph(ctx, x, yPos, '\uE0A4', this.CONFIG.fontSize, config.color);

        if (noteObj.accidental && config.accidentalMode !== "signature") {
            this._fillGlyph(ctx, x - 15, yPos, noteObj.glyph, this.CONFIG.accSize, config.color);
        }
    },

    _drawLedgers: function(ctx, x, yBase, absY, clef, color) {
        ctx.lineWidth = 1; ctx.strokeStyle = color || "#000";
        var anchor = (clef === "bass") ? 18 : 30;
        var visualBase = yBase + (4 * this.CONFIG.lineSp);
        var step = this.CONFIG.lineSp / 2;

        if (absY <= anchor - 2) {
            for (var i = anchor - 2; i >= absY; i -= 2) {
                var yL = visualBase - ((i - anchor) * step);
                ctx.beginPath(); ctx.moveTo(x - 6, yL); ctx.lineTo(x + 18, yL); ctx.stroke();
            }
        }
        if (absY >= anchor + 12) {
            for (var j = anchor + 12; j <= absY; j += 2) {
                var yL2 = visualBase - ((j - anchor) * step);
                ctx.beginPath(); ctx.moveTo(x - 6, yL2); ctx.lineTo(x + 18, yL2); ctx.stroke();
            }
        }
    },

    _drawFinalBarline: function(ctx, x, yTop, yBottom, color) {
        ctx.strokeStyle = color;
        // O ponto final deve ser exatamente a 5ª linha do pentagrama de baixo
        var exactBottom = yBottom + (4 * this.CONFIG.lineSp); 
    
        // Barra fina (interna)
        ctx.lineWidth = 1;
        ctx.beginPath(); 
        ctx.moveTo(x - 6, yTop); 
        ctx.lineTo(x - 6, exactBottom); 
        ctx.stroke();

        // Barra grossa (final)
        ctx.lineWidth = 3.5;
        ctx.beginPath(); 
        ctx.moveTo(x, yTop); 
        ctx.lineTo(x, exactBottom); 
        ctx.stroke();
    },

    _drawBrace: function(ctx, x, yTop, yBottom, color) {
        // totalBottom é a 5ª linha do pentagrama inferior
        var totalBottom = yBottom + (4 * this.CONFIG.lineSp);
    
        // POSIÇÃO X: Atualmente está em x - 18. 
        // Diminua (ex: -25) para afastar da clave ou aumente (ex: -10) para aproximar.
        var posX = x - 18;

        // POSIÇÃO Y: O ponto central exato entre os dois pentagramas.
        // Se a chave parecer "subida" ou "descida" demais, some ou subtraia um pequeno valor aqui.
        var posY = ((yTop + totalBottom) / 2) + 80;

        this._fillGlyph(ctx, posX, posY, '\uE000', this.CONFIG.braceSize, color);
    },

    _drawStem: function(ctx, x, yH, absY, clef, color) {
        ctx.lineWidth = 1.3; ctx.strokeStyle = color || "#000";
        var isDown = absY >= (clef === "bass" ? 22 : 34); 
        var h = this.CONFIG.stemHeight;
        ctx.beginPath();
        if (isDown) { ctx.moveTo(x + 1, yH + 4); ctx.lineTo(x + 1, yH + h + 4); } 
        else { ctx.moveTo(x + 13, yH - 4); ctx.lineTo(x + 13, yH - (h + 4)); }
        ctx.stroke();
    },

    drawLabels: function(ctx, xStart, yBase, labels, config) {
        if (!labels) return;
        var totalBottom = yBase + (4 * this.CONFIG.lineSp) + this.CONFIG.staffGap + (4 * this.CONFIG.lineSp);
        var yP = totalBottom + 25; 
        ctx.fillStyle = config.color || "#666";
        ctx.font = "bold 14px Arial"; ctx.textAlign = "center";
        for (var i = 0; i < labels.length; i++) {
            if (labels[i]) ctx.fillText(labels[i], xStart + (i * 45) + 6, yP);
        }
    },

    drawChordSymbols: function(ctx, xStart, yBase, symbols) {
        ctx.fillStyle = "#000"; ctx.font = "italic bold 16px serif"; ctx.textAlign = "center";
        for (var i = 0; i < symbols.length; i++) {
            if (symbols[i]) ctx.fillText(symbols[i], xStart + (i * 45) + 6, yBase - 30);
        }
    }
};