/**
 * PIANORAMA - Main.js (v14.0)
 * Hub de orquestração - Estabilização de Menus e Tonalidades.
 */

window.App = {
    registry: new Map(),
    currentPlayingCard: null,

    init: async function() {
        var self = this;
        
        // 1. ESPERA CRÍTICA: Fontes e estabilização de Layout
        if (document.fonts) await document.fonts.ready;
        await new Promise(r => window.requestAnimationFrame(r));
        await new Promise(r => setTimeout(r, 300));

        // 2. Popular Menus via UIManager
        try {
            if (window.UIManager && typeof window.UIManager.renderMainSelect === 'function') {
                // Popula o <select> de escalas
                window.UIManager.renderMainSelect('.pianorama__select--scales');
            }
        } catch (e) {
            console.warn("App: Erro ao popular menu de escalas:", e);
        }

        // 3. Inicialização do Contexto de Teoria baseado no valor atual do Select
        var keySelect = document.querySelector('.pianorama__select--pitch');
        var initialKey = keySelect ? keySelect.value : "C";
        if (window.ContextTranslator) window.ContextTranslator.init(initialKey);
        
        // 4. Renderizar todos os cards presentes no HTML
        this.refreshAll();

        // 5. Ativar Escuta de Eventos (Menus e Toolbar)
        this.bindEvents();

        if (window.ControlManager) window.ControlManager.init();

        window.addEventListener('resize', function() { self.handleResize(); });
        console.log("App: Sistema de interatividade v14.0 pronto.");
    },

    /**
     * Re-escaneia o DOM e configura os cards.
     */
    refreshAll: function() {
        var self = this;
        var targets = document.querySelectorAll('.pianorama__card, .pianorama__app--main, .pianorama__app--secondary');
        targets.forEach(function(el) {
            self.setupCard(el);
        });
    },

    /**
     * Configura um card específico, processa dados e carrega áudio.
     */
    setupCard: async function(card) {
        var canvas = card.querySelector('canvas');
        if (!canvas) return;

        // Monta o objeto de configuração lendo o dataset atualizado do elemento
        var config = {
            key: card.dataset.key || "C",
            id: card.dataset.id || "scale:major",
            time: card.dataset.time || "4/4",
            accidentalMode: card.dataset.accidental || "both",
            layerRelative: card.dataset.layerRelative === "true",
            layerChords: card.dataset.layerChords === "true",
            layerDegrees: card.dataset.layerDegrees === "true",
            inversion: parseInt(card.dataset.inversion || 0),
            // Define a pasta de áudio baseado no ID (scales ou chords)
            folder: (card.dataset.id && card.dataset.id.indexOf('field') > -1) ? 'chords' : 'scales'
        };

        if (window.AtlasEngine) {
            // O AtlasEngine processa a teoria e gera as camadas de desenho
            var dataStore = window.AtlasEngine.processCardData(config);
            this.registry.set(card, { layers: dataStore.layers, config: config, isAudioLoaded: false });
            
            // Ajuste de dimensões do Canvas
            canvas.width = card.offsetWidth || 800; 
            canvas.height = 280; 
            
            // Desenha a parte visual imediatamente (mesmo sem áudio)
            this.drawCard(card, false);

            // Gerencia o carregamento dos arquivos de áudio
            var fileSet = this.collectFiles(dataStore.layers);
            var self = this;
            window.AudioEngine.preloadFiles(config.folder, fileSet).then(function() {
                var data = self.registry.get(card);
                if (data) {
                    data.isAudioLoaded = true;
                    card.classList.add('is-ready'); // Libera o cursor:pointer e clique
                }
            });
        }

        // Atribui o evento de clique para tocar
        card.onclick = function() {
            window.App.playCard(card);
        };
    },

    /**
     * Desenha as camadas no Canvas usando o RenderEngine modular.
     */
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

        // 1. Desenha Pautas, Claves e Armadura (LARGURA FIXA v9.7+)
        var noteStartX = window.RenderEngine.drawSystem(ctx, marginX, canvas.width - 15, yBaseTreble, {
            key: data.config.key,
            accidentalMode: data.config.accidentalMode,
            time: data.config.time,
            color: sysColor
        });

        // 2. Itera sobre as camadas de dados (Notas ou Texto)
        data.layers.forEach(function(layer) {
            var layerColor = style.getPropertyValue(layer.colorVar).trim() || sysColor;
            var activeColor = isHovered ? hoverColor : layerColor;

            if (layer.type === "text") {
                // Desenha Graus (I, II, III...)
                window.RenderEngine.drawLabels(ctx, noteStartX, yBaseTreble, layer.data, { color: activeColor });
            } else {
                // Desenha Notas Musicais
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

    /**
     * Captura mudanças nos menus e propaga para os cards.
     */
    handleSelection: async function() {
        var self = this;
        var keySelect = document.querySelector('.pianorama__select--pitch');
        var scaleSelect = document.querySelector('.pianorama__select--scales');
        
        if (!keySelect || !scaleSelect) return;

        var selectedKey = keySelect.value;
        var selectedScale = scaleSelect.value;

        console.log("App: Atualizando para", selectedKey, selectedScale);

        // Atualiza o tradutor de teoria para a nova tonalidade
        if (window.ContextTranslator) window.ContextTranslator.setContext(selectedKey);

        // Atualiza o dataset de TODOS os cards para refletir a nova tonalidade e escala
        var targets = document.querySelectorAll('.pianorama__card, .pianorama__app--main, .pianorama__app--secondary');
        
        for (let card of targets) {
            card.dataset.key = selectedKey;
            
            // Apenas o card principal costuma mudar de escala pelo menu
            if (card.classList.contains('pianorama__app--main')) {
                card.dataset.id = selectedScale;
            }
            
            // Re-configura e desenha
            await self.setupCard(card);
        }
    },

    bindEvents: function() {
        var self = this;

        // Listener para o seletor de Tonalidade (C, D, Eb...)
        var keySelect = document.querySelector('.pianorama__select--pitch');
        if (keySelect) {
            keySelect.addEventListener('change', function() { self.handleSelection(); });
        }

        // Listener para o seletor de Escalas (Maior, Menor...)
        var scaleSelect = document.querySelector('.pianorama__select--scales');
        if (scaleSelect) {
            scaleSelect.addEventListener('change', function() { self.handleSelection(); });
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

// Inicia o App quando o loader disparar o evento de prontidão
window.addEventListener('appReady', function() {
    window.App.init();
});