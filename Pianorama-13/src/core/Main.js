/**
 * PIANORAMA - Main.js (v13.8)
 * Sincronizado com RenderEngine Modular
 */

window.App = {
    registry: new Map(),
    currentPlayingCard: null,

    init: async function() {
        var self = this;
        if (document.fonts) await document.fonts.ready;
        await new Promise(function(r) { window.requestAnimationFrame(r); });
        await new Promise(function(r) { setTimeout(r, 300); });

        var keySelect = document.querySelector('.pianorama__select--pitch');
        var initialKey = keySelect ? keySelect.value : "C";
        if (window.ContextTranslator) window.ContextTranslator.init(initialKey);
        if (window.UIManager) window.UIManager.renderMainSelect('.pianorama__select--scales');
        if (window.ControlManager) window.ControlManager.init();

        this.refreshAll();
        window.addEventListener('resize', function() { self.handleResize(); });
    },

    refreshAll: function() {
        var self = this;
        var targets = document.querySelectorAll('.pianorama__card, .pianorama__app--main, .pianorama__app--secondary');
        targets.forEach(function(el) { self.setupCard(el); });
    },

    setupCard: function(card) {
        var canvas = card.querySelector('canvas');
        if (!canvas) return;

        var config = {
            key: card.dataset.key || "C",
            id: card.dataset.id || "scale:major",
            time: card.dataset.time || "4/4",
            accidentalMode: card.dataset.accidental || "both",
            layerRelative: card.dataset.layerRelative === "true",
            layerChords: card.dataset.layerChords === "true",
            layerDegrees: card.dataset.layerDegrees === "true",
            inversion: parseInt(card.dataset.inversion || 0)
        };

        if (window.AtlasEngine) {
            var dataStore = window.AtlasEngine.processCardData(config);
            // Guardamos os dados e a config no registro
            this.registry.set(card, { layers: dataStore.layers, config: config });
            
            canvas.width = card.offsetWidth || 800; 
            canvas.height = 280; 
            
            this.drawCard(card, false);
        }

        card.onclick = function() {
            if (window.AudioEngine) window.AudioEngine.init();
            window.App.playCard(card);
        };
    },

    drawCard: function(card, isHovered) {
        var data = this.registry.get(card);
        if (!data || !window.RenderEngine) return;

        var canvas = card.querySelector('canvas');
        var ctx = canvas.getContext('2d');
        var style = getComputedStyle(card);
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Coordenadas base
        var yBaseTreble = 65; 
        var marginX = 20;
        var sysColor = style.getPropertyValue('--pianorama-notation-color').trim() || "#000";
        var hoverColor = style.getPropertyValue('--pianorama-hover-color').trim() || "#3b82f6";
        var noteSpacing = 45;

        // 1. Desenha o Sistema e pega o X fixo de início das notas
        var noteStartX = window.RenderEngine.drawSystem(ctx, marginX, canvas.width - 15, yBaseTreble, {
            key: data.config.key,
            accidentalMode: data.config.accidentalMode,
            time: data.config.time,
            color: sysColor
        });

        // 2. Loop pelas camadas (Layers)
        data.layers.forEach(function(layer) {
            var layerColor = style.getPropertyValue(layer.colorVar).trim() || sysColor;
            var activeColor = isHovered ? hoverColor : layerColor;

            if (layer.type === "text") {
                window.RenderEngine.drawLabels(ctx, noteStartX, yBaseTreble, layer.data, {
                    color: activeColor
                });
            } else {
                // Desenha notas (Treble e Bass)
                var yBaseBass = yBaseTreble + window.RenderConfig.staffGap + (4 * window.RenderConfig.lineSp);
                
                for (var i = 0; i < (layer.treble || []).length; i++) {
                    var x = noteStartX + (i * noteSpacing);
                    if (x > canvas.width - 20) break;

                    if (layer.treble[i]) {
                        window.RenderEngine.drawNote(ctx, x, yBaseTreble, layer.treble[i], {
                            color: activeColor, clef: "treble", accidentalMode: data.config.accidentalMode
                        });
                    }
                    if (layer.bass && layer.bass[i]) {
                        window.RenderEngine.drawNote(ctx, x, yBaseBass, layer.bass[i], {
                            color: activeColor, clef: "bass", accidentalMode: data.config.accidentalMode
                        });
                    }
                }
            }
        });
    },

    playCard: async function(card) {
        var data = this.registry.get(card);
        if (!data || this.currentPlayingCard === card) return;

        this.stopAudio();
        this.currentPlayingCard = card;
        card.classList.add('is-playing');

        var delay = (window.PIANORAMA_CONFIG && window.PIANORAMA_CONFIG.playback) ? window.PIANORAMA_CONFIG.playback.baseDelay : 400;
        
        // i = tempo da nota
        var maxSteps = 0;
        data.layers.forEach(function(l) { if (l.treble) maxSteps = Math.max(maxSteps, l.treble.length); });

        for (var i = 0; i < maxSteps; i++) {
            if (this.currentPlayingCard !== card) break;
            
            data.layers.forEach(function(layer) {
                if (layer.type === "text") return;
                [layer.treble, layer.bass].forEach(function(staff) {
                    if (staff && staff[i]) {
                        var notes = Array.isArray(staff[i]) ? staff[i] : [staff[i]];
                        notes.forEach(function(n) {
                            if (n && n.fileName) window.AudioEngine.playFile(n.fileName);
                        });
                    }
                });
            });
            await new Promise(function(r) { setTimeout(r, delay); });
        }
        this.stopAudio();
    },

    stopAudio: function() {
        if (this.currentPlayingCard) {
            this.currentPlayingCard.classList.remove('is-playing');
            this.currentPlayingCard = null;
        }
    },

    handleResize: function() {
        this.refreshAll();
    }
};

window.addEventListener('appReady', function() {
    window.App.init();
});
