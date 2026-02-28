/**
 * PIANORAMA - Main.js (v13.9)
 * Hub de orquestração - Foco em Interatividade e Sincronia.
 */

window.App = {
    registry: new Map(),
    currentPlayingCard: null,

    init: async function() {
        var self = this;
        
        // 1. ESPERA CRÍTICA: Fontes e estabilização
        if (document.fonts) await document.fonts.ready;
        await new Promise(r => window.requestAnimationFrame(r));
        await new Promise(r => setTimeout(r, 300));

        // 2. Inicialização do Contexto de Teoria
        var keySelect = document.querySelector('.pianorama__select--pitch');
        var initialKey = keySelect ? keySelect.value : "C";
        if (window.ContextTranslator) window.ContextTranslator.init(initialKey);
        
        // 3. Popular Menus
        try {
            if (window.UIManager && typeof window.UIManager.renderMainSelect === 'function') {
                window.UIManager.renderMainSelect('.pianorama__select--scales');
            }
        } catch (e) {
            console.warn("App: Erro ao popular menu:", e);
        }

        // 4. Renderizar Cards Iniciais
        this.refreshAll();

        // 5. Ligar Eventos (Clicks e Selects)
        this.bindEvents();

        if (window.ControlManager) window.ControlManager.init();

        window.addEventListener('resize', function() { self.handleResize(); });
        console.log("App: Sistema de interatividade pronto.");
    },

    refreshAll: function() {
        var self = this;
        var targets = document.querySelectorAll('.pianorama__card, .pianorama__app--main, .pianorama__app--secondary');
        targets.forEach(function(el) {
            self.setupCard(el);
        });
    },

    setupCard: async function(card) {
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
            inversion: parseInt(card.dataset.inversion || 0),
            folder: (card.dataset.id && card.dataset.id.indexOf('field') > -1) ? 'chords' : 'scales'
        };

        if (window.AtlasEngine) {
            var dataStore = window.AtlasEngine.processCardData(config);
            this.registry.set(card, { layers: dataStore.layers, config: config, isAudioLoaded: false });
            
            canvas.width = card.offsetWidth || 800; 
            canvas.height = 280; 
            
            // Desenha a parte visual imediatamente
            this.drawCard(card, false);

            // Preload de Áudio e Liberação do Cursor
            var fileSet = this.collectFiles(dataStore.layers);
            var self = this;
            window.AudioEngine.preloadFiles(config.folder, fileSet).then(function() {
                var data = self.registry.get(card);
                if (data) {
                    data.isAudioLoaded = true;
                    card.classList.add('is-ready'); // ISSO LIBERA O POINTER-EVENTS NO CSS
                }
            });
        }

        // Evento de Click
        card.onclick = function() {
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

        var yBaseTreble = 65; 
        var marginX = 20;
        var sysColor = style.getPropertyValue('--pianorama-notation-color').trim() || "#000";
        var hoverColor = style.getPropertyValue('--pianorama-hover-color').trim() || "#3b82f6";
        var noteSpacing = 45;

        // Desenha o Sistema
        var noteStartX = window.RenderEngine.drawSystem(ctx, marginX, canvas.width - 15, yBaseTreble, {
            key: data.config.key,
            accidentalMode: data.config.accidentalMode,
            time: data.config.time,
            color: sysColor
        });

        // Desenha as Camadas
        data.layers.forEach(function(layer) {
            var layerColor = style.getPropertyValue(layer.colorVar).trim() || sysColor;
            var activeColor = isHovered ? hoverColor : layerColor;

            if (layer.type === "text") {
                window.RenderEngine.drawLabels(ctx, noteStartX, yBaseTreble, layer.data, { color: activeColor });
            } else {
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

    handleSelection: async function() {
        var mainCard = document.querySelector('.pianorama__app--main');
        var keySelect = document.querySelector('.pianorama__select--pitch');
        var scaleSelect = document.querySelector('.pianorama__select--scales');
        
        if (!mainCard || !keySelect || !scaleSelect) return;

        var selectedKey = keySelect.value;
        var selectedScale = scaleSelect.value;

        // Atualiza o tradutor
        if (window.ContextTranslator) window.ContextTranslator.setContext(selectedKey);

        // Sincroniza o dataset do HTML
        mainCard.dataset.key = selectedKey;
        mainCard.dataset.id = selectedScale;

        // Re-setup do card
        await this.setupCard(mainCard);
    },

    collectFiles: function(layers) {
        var fileSet = [];
        var enharmonics = { "Db": "C#", "Eb": "D#", "Gb": "F#", "Ab": "G#", "Bb": "A#" };

        layers.forEach(function(l) {
            if (l.type === "text") return;
            var allNotes = (l.treble || []).concat(l.bass || []);

            allNotes.forEach(function(slot) {
                if (!slot) return;
                var notes = Array.isArray(slot) ? slot : [slot];
                notes.forEach(function(n) {
                    if (n && n.fileName) {
                        var name = n.fileName;
                        for (var key in enharmonics) { name = name.replace(key, enharmonics[key]); }
                        if (fileSet.indexOf(name) === -1) fileSet.push(name);
                    }
                });
            });
        });
        return fileSet;
    },

    bindEvents: function() {
        var self = this;

        // 1. Monitorar Select de Tonalidade
        var keySelect = document.querySelector('.pianorama__select--pitch');
        if (keySelect) {
            keySelect.onchange = function() { self.handleSelection(); };
        }

        // 2. Monitorar Select de Escalas
        var scaleSelect = document.querySelector('.pianorama__select--scales');
        if (scaleSelect) {
            scaleSelect.onchange = function() { self.handleSelection(); };
        }
    },

    playCard: async function(card) {
        var data = this.registry.get(card);
        if (!data || !data.isAudioLoaded) return;
        if (this.currentPlayingCard === card) { this.stopAudio(); return; }

        this.stopAudio();
        window.AudioEngine.init();
        this.currentPlayingCard = card;
        card.classList.add('is-playing');

        var bpm = (window.PIANORAMA_CONFIG && window.PIANORAMA_CONFIG.playback) ? window.PIANORAMA_CONFIG.playback.bpm : 80;
        var delay = (60 / bpm) * 1000; 

        var playableLayers = data.layers.filter(l => l.type !== "text");
        var maxSteps = 0;
        playableLayers.forEach(l => maxSteps = Math.max(maxSteps, l.treble.length));

        for (var i = 0; i < maxSteps; i++) {
            if (this.currentPlayingCard !== card) break;
            
            playableLayers.forEach(layer => {
                [layer.treble[i], (layer.bass ? layer.bass[i] : null)].forEach(slot => {
                    if (!slot) return;
                    var notes = Array.isArray(slot) ? slot : [slot];
                    notes.forEach(n => {
                        if (n && n.fileName) window.AudioEngine.playFile(data.config.folder, n.fileName);
                    });
                });
            });
            await new Promise(r => setTimeout(r, delay));
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
        this.refreshAll();
    }
};

window.addEventListener('appReady', function() {
    window.App.init();
});