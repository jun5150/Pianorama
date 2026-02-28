/**
 * PIANORAMA - RenderEngine.js (v9.1)
 * Renderizador de partituras para Canvas 2D.
 * Foco: Resiliência em navegadores legados e performance offline.
 */

window.RenderEngine = {
    CONFIG: {
        lineSp: 10,
        fontSize: 45,
        accSize: 32,
        clefSize: 40,
        braceSize: 160,
        staffGap: 80,
        stemHeight: 32,
        timeSize: 42 
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
        var accidentalMode = config.accidentalMode || "both";
        var gap = this.CONFIG.staffGap;
        var secondStaffY = yBase + (4 * this.CONFIG.lineSp) + gap;
        var totalBottom = secondStaffY + (4 * this.CONFIG.lineSp);
        
        ctx.strokeStyle = color;
        ctx.fillStyle = color;

        // Desenha Clave de Sol
        var trebleConf = { clef: "treble", key: config.key, time: config.time, accidentalMode: accidentalMode, color: color };
        this.drawStaffContext(ctx, xStart, xEnd, yBase, trebleConf);
        
        // Desenha Clave de Fá
        var bassConf = { clef: "bass", key: config.key, time: config.time, accidentalMode: accidentalMode, color: color };
        this.drawStaffContext(ctx, xStart, xEnd, secondStaffY, bassConf);
        
        this._drawBrace(ctx, xStart, yBase, secondStaffY, color);

        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(xStart, yBase - 0.5);
        ctx.lineTo(xStart, totalBottom + 0.5);
        ctx.stroke();

        this._drawFinalBarline(ctx, xEnd, yBase, totalBottom, color);

        var sigCount = (accidentalMode === "notes") ? 0 : (this.KEY_MAP[config.key] ? this.KEY_MAP[config.key].length : 0);
        var nextX = xStart + 45; 
        nextX += (sigCount * 12);

        if (config.time) {
            nextX += 45; // Espaço para a fórmula de compasso
        }

        return nextX + 20; 
    },

    drawStaffContext: function(ctx, xStart, xEnd, yBase, config) {
        var clef = config.clef || "treble";
        var key = config.key || "C";
        var time = config.time;
        var accidentalMode = config.accidentalMode || "both";
        var color = config.color || "#000";
        
        ctx.lineWidth = 1; 
        ctx.strokeStyle = color;
        for (var i = 0; i < 5; i++) {
            var y = yBase + (i * this.CONFIG.lineSp);
            ctx.beginPath(); 
            ctx.moveTo(xStart, y); 
            ctx.lineTo(xEnd, y); 
            ctx.stroke();
        }

        var clefGlyph = (clef === "bass") ? '\uE062' : '\uE050';
        var clefOffset = (clef === "bass") ? 1 * this.CONFIG.lineSp : 3 * this.CONFIG.lineSp;
        this._fillGlyph(ctx, xStart + 10, yBase + clefOffset, clefGlyph, this.CONFIG.clefSize, color);

        if (accidentalMode !== "notes") {
            this._drawKeySignature(ctx, xStart + 45, yBase, clef, key, color);
        }

        if (time) {
            var sigCount = (accidentalMode === "notes") ? 0 : (this.KEY_MAP[key] ? this.KEY_MAP[key].length : 0);
            var timeX = xStart + 45 + (sigCount * 12) + 10;
            this._drawTimeSignature(ctx, timeX, yBase, time, color);
        }
    },

    drawNote: function(ctx, x, yBase, noteObj, config) {
        if (!noteObj || typeof noteObj.absoluteY === 'undefined') return; // TRAVA DE SEGURANÇA

        if (Array.isArray(noteObj)) {
            var self = this;
            noteObj.forEach(function(singleNote) {
                self.drawNote(ctx, x, yBase, singleNote, config);
            });
            return;
        }

        var clef = config.clef || "treble";
        var accidentalMode = config.accidentalMode || "both";
        var color = config.color || "#000";
        var stepHeight = this.CONFIG.lineSp / 2;
        var anchorAbsY = (clef === "bass") ? 18 : 30; 
        var visualBaseY = yBase + (4 * this.CONFIG.lineSp);
        var yPosHead = visualBaseY - ((noteObj.absoluteY - anchorAbsY) * stepHeight);

        this._drawLedgers(ctx, x, yBase, noteObj.absoluteY, clef, color);
        this._drawStem(ctx, x, yPosHead, noteObj.absoluteY, clef, color);
        this._fillGlyph(ctx, x, yPosHead, '\uE0A4', this.CONFIG.fontSize, color);

        if (noteObj.accidental) {
            if (accidentalMode !== "signature") {
                this._fillGlyph(ctx, x - 15, yPosHead, noteObj.glyph, this.CONFIG.accSize, color);
            }
        }
    },

    _drawFinalBarline: function(ctx, x, yTop, yBottom, color) {
        ctx.strokeStyle = color;
        var yT = yTop - 0.5;
        var yB = yBottom + 0.5;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x - 6, yT); ctx.lineTo(x - 6, yB); ctx.stroke();
        ctx.lineWidth = 3.5;
        ctx.beginPath(); ctx.moveTo(x, yT); ctx.lineTo(x, yB); ctx.stroke();
    },

    _drawTimeSignature: function(ctx, x, yBase, timeStr, color) {
        var parts = timeStr.split("/");
        if (parts.length !== 2) return;
    
        // Alinhamento exato para Bravura com baseline 'middle'
        var yTop = yBase + (1 * this.CONFIG.lineSp);    // 2ª linha
        var yBottom = yBase + (3 * this.CONFIG.lineSp); // 4ª linha
    
        this._fillGlyph(ctx, x, yTop, this.TIME_GLYPHS[parts[0]] || parts[0], this.CONFIG.timeSize, color);
        this._fillGlyph(ctx, x, yBottom, this.TIME_GLYPHS[parts[1]] || parts[1], this.CONFIG.timeSize, color);
    },

    _drawKeySignature: function(ctx, x, yBase, clef, key, color) {
        var sig = this.KEY_MAP[key] || [];
        if (sig.length === 0) return;

        var isSharp = ["G", "D", "A", "E", "B", "F#", "C#"].indexOf(key) !== -1;
        var glyph = isSharp ? '\uE262' : '\uE260';

        var pattern = isSharp
            ? (clef === "treble" ? [0, 3, -1, 2, 5, 1, 4] : [-2, 1, -3, 0, 3, -1, 2])
            : (clef === "treble" ? [4, 1, 5, 2, 6, 3, 7] : [2, -1, 3, 0, 4, 1, 5]);

        for (var i = 0; i < sig.length; i++) {
            // Centraliza o acidente na linha/espaço correta
            var yPos = yBase + (2 * this.CONFIG.lineSp) - (pattern[i] * (this.CONFIG.lineSp / 2));
            this._fillGlyph(ctx, x + (i * 12), yPos, glyph, this.CONFIG.accSize, color);
        }
    },

    _drawStem: function(ctx, x, yHead, absY, clef, color) {
        ctx.lineWidth = 1.3; ctx.strokeStyle = color;
        var isDown = absY >= (clef === "bass" ? 22 : 34); 
        var h = (clef === "bass") ? this.CONFIG.stemHeight + 5 : this.CONFIG.stemHeight;
        ctx.beginPath();
        if (isDown) { 
            ctx.moveTo(x + 1, yHead + 4); ctx.lineTo(x + 1, yHead + h + 4); 
        } else { 
            ctx.moveTo(x + 13, yHead - 4); ctx.lineTo(x + 13, yHead - (h + 4)); 
        }
        ctx.stroke();
    },

    _drawLedgers: function(ctx, x, yBase, absY, clef, color) {
        ctx.lineWidth = 1; ctx.strokeStyle = color;
        var stepHeight = this.CONFIG.lineSp / 2;
        var anchorAbsY = (clef === "bass") ? 18 : 30;
        var visualBaseY = yBase + (4 * this.CONFIG.lineSp);
        
        var drawLedgerLine = function(val) {
            var yL = visualBaseY - ((val - anchorAbsY) * stepHeight);
            ctx.beginPath(); 
            ctx.moveTo(x - 6, yL); 
            ctx.lineTo(x + 18, yL); 
            ctx.stroke();
        };

        if (absY <= anchorAbsY - 2) {
            for (var i = anchorAbsY - 2; i >= absY; i -= 2) drawLedgerLine(i);
        }
        if (absY >= anchorAbsY + 12) {
            for (var j = anchorAbsY + 12; j <= absY; j += 2) drawLedgerLine(j);
        }
    },

    _drawBrace: function(ctx, x, yTop, yBottom, color) {
        var totalBottom = yBottom + (4 * this.CONFIG.lineSp);
        this._fillGlyph(ctx, x - 18, ((yTop + totalBottom) / 2) + 80, '\uE000', this.CONFIG.braceSize, color);
    },

/**
     * Renderiza labels de texto (Graus, Funções, Nomes) sincronizados com as notas.
     */
    drawLabels: function(ctx, xStart, yBase, labelsArray, config) {
        if (!labelsArray || !labelsArray.length) return;
        
        var color = config.color || "#666"; // Labels costumam ser mais suaves
        var fontSize = config.fontSize || 14;
        var noteSpacing = 45; // Deve bater com o Main.js
        
        // Posicionamento: 20px abaixo do final do sistema (segundo pentagrama)
        var gap = this.CONFIG.staffGap;
        var totalBottom = yBase + (4 * this.CONFIG.lineSp) + gap + (4 * this.CONFIG.lineSp);
        var yPos = totalBottom + 25; 

        ctx.fillStyle = color;
        ctx.font = "bold " + fontSize + "px Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";

        for (var i = 0; i < labelsArray.length; i++) {
            if (!labelsArray[i]) continue;
            var x = xStart + (i * noteSpacing);
            
            // Desenha o Grau (Ex: "iii7", "V/V", "I")
            ctx.fillText(labelsArray[i], x + 6, yPos);
        }
    },

    /**
     * Auxiliar para desenhar cifras (Chord Symbols) acima do pentagrama.
     */
    drawChordSymbols: function(ctx, xStart, yBase, symbolsArray) {
        var yPos = yBase - 30; // Acima da Clave de Sol
        ctx.fillStyle = "#000";
        ctx.font = "italic bold 16px serif";
        ctx.textAlign = "center";

        for (var i = 0; i < symbolsArray.length; i++) {
            if (!symbolsArray[i]) continue;
            var x = xStart + (i * 45);
            ctx.fillText(symbolsArray[i], x + 6, yPos);
        }
    },

    _fillGlyph: function(ctx, x, y, char, size, color) {
        ctx.fillStyle = color || "black";
        ctx.font = size + "px Bravura";
        ctx.textBaseline = "middle";
        ctx.fillText(char, x, y);
    }
};