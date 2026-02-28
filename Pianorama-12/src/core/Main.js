/**
 * PIANORAMA - main.js (v13.1)
 * Hub de orquestração com suporte a Laboratório e ControlManager.
 */

window.App = {
    registry: new Map(),
    currentPlayingCard: null,

    init: async function() {
        var self = this;
        console.log("App: Iniciando modo Laboratório...");

        if (window.setupToggleButtons) window.setupToggleButtons();
        if (document.fonts && document.fonts.ready) await document.fonts.ready;
        
        await new Promise(function(r) { setTimeout(r, 400); });

        try {
            if (window.UIManager && typeof window.UIManager.renderMainSelect === 'function') {
                window.UIManager.renderMainSelect('.pianorama__select--scales');
            }
        } catch (e) {
            console.warn("App: Erro ao popular menu:", e);
        }

        var cards = document.querySelectorAll('.pianorama__card, .pianorama__app--main, .pianorama__app--secondary');
        
        for (var i = 0; i < cards.length; i++) {
            await this.setupCard(cards[i]);
            (function(index) { // aqui recebemos o valor como 'index'
                setTimeout(function() {
                    if (cards[index]) self.drawCard(cards[index], false);
                }, index * 60);
            })(i);
        }

        this.bindEvents(cards);
        
        // --- ATIVAÇÃO DO LABORATÓRIO ---
        if (window.ControlManager) {
            window.ControlManager.init();
        }

        window.addEventListener('resize', function() { self.handleResize(); });
        console.log("App: Sistema pronto.");
    },

    setupCard: async function(card) {
        var canvas = card.querySelector('.pianorama__canvas, .pianorama__app--canvas');
        if (!canvas) return;

        var config = {
            id: card.dataset.id || "scale:major",
            key: card.dataset.key || "C",
            time: card.dataset.time || "4/4",
            folder: card.dataset.folder || "scales",
            accidentalMode: card.dataset.accidental || "both",
            layerRelative: card.dataset.layerRelative === "true",
            layerChords: card.dataset.layerChords === "true",
            layerDegrees: card.dataset.layerDegrees === "true",
            inversion: parseInt(card.dataset.inversion) || 0,
            height: 280 
        };

        canvas.width = card.offsetWidth;
        canvas.height = config.height;

        if (!window.AtlasEngine) return;

        var dataStore = window.AtlasEngine.processCardData(config);
        
        this.registry.set(card, {
            layers: dataStore.layers,
            config: config,
            isAudioLoaded: false
        });

        var fileSet = this.collectFiles(dataStore.layers);
        var self = this;
        window.AudioEngine.preloadFiles(config.folder, fileSet).then(function() {
            var data = self.registry.get(card);
            if (data) {
                data.isAudioLoaded = true;
                card.classList.add('is-ready');
            }
        });
    },

    drawCard: function(card, isHover) {
        var data = this.registry.get(card);
        if (!data || !data.layers || !window.RenderEngine) return;

        var canvas = card.querySelector('.pianorama__canvas, .pianorama__app--canvas');
        var ctx = canvas.getContext('2d');
        var style = getComputedStyle(card);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        var yBaseTreble = 65; 
        var marginX = 20;
        var sysColor = style.getPropertyValue('--pianorama-notation-color').trim() || "#000";

        var noteStartX = window.RenderEngine.drawSystem(ctx, marginX, canvas.width - 5, yBaseTreble, {
            key: data.config.key,
            accidentalMode: data.config.accidentalMode,
            time: data.config.time,
            color: sysColor
        });

        var yBaseBass = yBaseTreble + 120;
        var noteSpacing = 45;
        var hoverColor = style.getPropertyValue('--pianorama-hover-color').trim() || "#3b82f6";

        for (var j = 0; j < data.layers.length; j++) {
            var layer = data.layers[j];
            var layerColor = style.getPropertyValue(layer.colorVar).trim() || sysColor;
            var activeColor = isHover ? hoverColor : layerColor;

            if (layer.type === "text") {
                window.RenderEngine.drawLabels(ctx, noteStartX, yBaseTreble, layer.data, {
                    color: layerColor
                });
                continue;
            }

            for (var i = 0; i < layer.treble.length; i++) {
                var x = noteStartX + (i * noteSpacing);
                if (x > canvas.width - 20) break;
                
                if (layer.treble[i]) {
                    window.RenderEngine.drawNote(ctx, x, yBaseTreble, layer.treble[i], {
                        color: activeColor, clef: "treble", accidentalMode: data.config.accidentalMode
                    });
                }
                if (layer.bass[i]) {
                    window.RenderEngine.drawNote(ctx, x, yBaseBass, layer.bass[i], {
                        color: activeColor, clef: "bass", accidentalMode: data.config.accidentalMode
                    });
                }
            }
        }
    },

    handleSelection: async function(lessonId) {
        if (!lessonId) return;
        var mainCard = document.querySelector('.pianorama__app--main');
        if (!mainCard) return;

        mainCard.dataset.id = lessonId; 
    
        // CORREÇÃO AQUI: parts pega a categoria ("field" ou "scale")
        var parts = lessonId.split(':');
        var category = parts; 
    
        // Define a pasta correta: "field" -> "chords" | "scale" -> "scales"
        mainCard.dataset.folder = (category === 'field') ? 'chords' : 'scales';

        // Garante que o tradutor saiba o tom ANTES de processar
        if (window.ContextTranslator) {
            window.ContextTranslator.setContext(mainCard.dataset.key || "C");
        }

        await this.setupCard(mainCard);
        this.drawCard(mainCard, false);
    },

    collectFiles: function(layers) {
        var fileSet = [];
        layers.forEach(function(l) {
            if (l.type === "text") return;
            var notes = (l.treble || []).concat(l.bass || []);
            notes.forEach(function(slot) {
                if (!slot) return;
                [].concat(slot).forEach(function(n) {
                    if (n && n.fileName && fileSet.indexOf(n.fileName) === -1) {
                        fileSet.push(n.fileName);
                    }
                });
            });
        });
        return fileSet;
    },

    bindEvents: function(cards) {
        var self = this;
        for (var k = 0; k < cards.length; k++) {
            (function(c) {
                c.addEventListener('click', function() { self.handleCardClick(c); });
            })(cards[k]);
        }
    },

    handleCardClick: async function(card) {
        var data = this.registry.get(card);
        if (!data || !data.isAudioLoaded) return;
        window.AudioEngine.init();
        if (this.currentPlayingCard === card) { this.stopAudio(); return; }
        if (this.currentPlayingCard) this.stopAudio();

        this.currentPlayingCard = card;
        card.classList.add('is-playing');

        var bpm = (window.PIANORAMA_CONFIG && window.PIANORAMA_CONFIG.playback) ? window.PIANORAMA_CONFIG.playback.bpm : 80;
        var delay = (60 / bpm) * 1000; 

        var layers = data.layers.filter(function(l) { return l.type !== "text"; });
        var maxLen = 0;
        layers.forEach(function(l) { maxLen = Math.max(maxLen, l.treble.length, l.bass.length); });

        for (var i = 0; i < maxLen; i++) {
            if (this.currentPlayingCard !== card) break;
            for (var j = 0; j < layers.length; j++) {
                var layer = layers[j];
                [layer.treble[i], layer.bass[i]].forEach(function(slot) {
                    if (slot) [].concat(slot).forEach(function(n) {
                        if (n && n.fileName) window.AudioEngine.playFile(data.config.folder, n.fileName);
                    });
                });
            }
            await new Promise(function(r) { setTimeout(r, delay); });
        }
        if (this.currentPlayingCard === card) this.stopAudio();
    },

    stopAudio: function() {
        if (this.currentPlayingCard) {
            this.currentPlayingCard.classList.remove('is-playing');
            this.currentPlayingCard = null;
        }
    },

    handleResize: function() {
        var self = this;
        this.registry.forEach(function(data, card) {
            var canvas = card.querySelector('.pianorama__canvas, .pianorama__app--canvas');
            if (canvas) {
                canvas.width = card.offsetWidth;
                self.drawCard(card, false);
            }
        });
    }
};

window.addEventListener('load', function() { App.init(); });