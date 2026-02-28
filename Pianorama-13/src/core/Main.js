/**
 * PIANORAMA - Main.js (v13.7)
 * Foco: Sincronia de Layout e Correção de Oitavas
 */

window.App = {
    registry: new Map(),
    currentPlayingCard: null,

    init: async function() {
        var self = this;
        
        // 1. ESPERA CRÍTICA: Aguarda fontes e layout estabilizarem
        if (document.fonts) await document.fonts.ready;
        await new Promise(function(r) { window.requestAnimationFrame(r); });
        await new Promise(function(r) { setTimeout(r, 300); });

        // 2. Inicialização Teórica
        var keySelect = document.querySelector('.pianorama__select--pitch');
        var initialKey = keySelect ? keySelect.value : "C";
        if (window.ContextTranslator) window.ContextTranslator.init(initialKey);
        if (window.UIManager) window.UIManager.renderMainSelect('.pianorama__select--scales');
        
        // Inicializa o ControlManager para ouvir os botões da Toolbar
        if (window.ControlManager) window.ControlManager.init();

        // 3. Renderiza TUDO: Cards e Apps Principais
        this.refreshAll();

        window.addEventListener('resize', function() { self.handleResize(); });
    },

    refreshAll: function() {
        var self = this;
        // Pega tanto os cards individuais quanto o container principal do App
        var targets = document.querySelectorAll('.pianorama__card, .pianorama__app--main, .pianorama__app--secondary');
        targets.forEach(function(el) {
            self.setupCard(el);
        });
    },

    setupCard: function(card) {
        var canvas = card.querySelector('canvas');
        if (!canvas) return;

        // Extrai dados do HTML
        var config = {
            key: card.dataset.key || "C",
            id: card.dataset.id || "scale:major",
            layerRelative: card.dataset.layerRelative === "true",
            layerChords: card.dataset.layerChords === "true",
            layerDegrees: card.dataset.layerDegrees === "true",
            inversion: parseInt(card.dataset.inversion || 0)
        };

        if (window.AtlasEngine) {
            var renderData = window.AtlasEngine.processCardData(config);
            this.registry.set(card, renderData);
            
            // Força o tamanho do canvas baseado no elemento pai real no momento
            canvas.width = card.offsetWidth || 800; 
            canvas.height = 250; 
            
            this.drawCard(card, false);
        }

        // Click para Áudio
        card.onclick = function() {
            if (window.AudioEngine) window.AudioEngine.init();
            window.App.playCard(card);
        };
    },

    drawCard: function(card, isHovered) {
        var data = this.registry.get(card);
        var canvas = card.querySelector('canvas');
        if (data && canvas && window.RenderEngine.drawSystem) {
            window.RenderEngine.drawSystem(canvas, data, isHovered);
        }
    },

    playCard: async function(card) {
        var data = this.registry.get(card);
        if (!data || this.currentPlayingCard === card) return;

        this.stopAudio();
        this.currentPlayingCard = card;
        card.classList.add('is-playing');

        var delay = window.PIANORAMA_CONFIG.playback.baseDelay || 400;
        var layers = data.layers;

        // Loop de tempo (i = passo na escala/sequência)
        var maxSteps = 0;
        layers.forEach(function(l) { if (l.treble) maxSteps = Math.max(maxSteps, l.treble.length); });

        for (var i = 0; i < maxSteps; i++) {
            if (this.currentPlayingCard !== card) break;
            
            layers.forEach(function(layer) {
                if (layer.type === "text") return;

                // Toca simultaneamente Treble e Bass da camada
                [layer.treble, layer.bass].forEach(function(staff) {
                    if (staff && staff[i]) {
                        var notes = Array.isArray(staff[i]) ? staff[i] : [staff[i]];
                        notes.forEach(function(n) {
                            if (n && n.fileName) {
                                // Envia apenas o nome da nota (ex: "C4") para o AudioEngine
                                window.AudioEngine.playFile(n.fileName);
                            }
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