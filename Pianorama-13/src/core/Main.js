/**
 * PIANORAMA - Main.js (v18.1)
 * Foco: Nitidez de traço (DPR), Sincronia de Menus e Playback Robusto.
 */

window.App = {
    registry: new Map(),
    currentPlayingCard: null,
    currentPlayToken: null,

    init: async function() {
        console.log("App: Iniciando v18.1...");
        
        try {
            if (document.fonts) await document.fonts.ready;
            
            // 1. Popular Menus
            if (window.UIManager && typeof window.UIManager.renderMainSelect === 'function') {
                window.UIManager.renderMainSelect('.pianorama__select--scales');
            }

            // 2. Ligar Eventos
            this.bindEvents();

            // 3. Renderização Inicial
            // Pequeno delay para o DOM respirar após o UIManager
            setTimeout(() => {
                this.handleSelection();
            }, 300);

        } catch (e) {
            console.error("App: Erro na inicialização:", e);
        }

        window.addEventListener('resize', () => this.handleResize());
    },

    /**
     * Captura valores dos menus e atualiza o estado global
     */
    handleSelection: async function() {
        const keySelect = document.querySelector('.pianorama__select--pitch') || 
                          document.querySelector('.pianorama__select--key');
        const scaleSelect = document.querySelector('.pianorama__select--scales');
        
        if (!keySelect) return;

        const newKey = keySelect.value;
        const rawId = scaleSelect ? scaleSelect.value : "major";
        const newScaleId = rawId.includes(':') ? rawId : "scale:" + rawId;

        console.log(`App: Sincronizando -> [${newKey}] [${newScaleId}]`);

        if (window.ContextTranslator) {
            window.ContextTranslator.setContext(newKey);
        }

        const targets = document.querySelectorAll('.pianorama__card, .pianorama__app--main, .pianorama__app--secondary');
        targets.forEach(card => {
            card.dataset.key = newKey;
            if (card.classList.contains('pianorama__app--main')) {
                card.dataset.id = newScaleId;
            }
            card.classList.remove('is-ready');
        });

        this.registry.clear();
        this.refreshAll();
    },

    refreshAll: function() {
        const targets = document.querySelectorAll('.pianorama__card, .pianorama__app--main, .pianorama__app--secondary');
        targets.forEach(el => this.setupCard(el));
    },

    setupCard: async function(card) {
        const canvas = card.querySelector('canvas');
        if (!canvas) return;

        const config = {
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
            try {
                const dataStore = window.AtlasEngine.processCardData(config);
                
                // --- AJUSTE DE NITIDEZ (Anti-aliasing para traços finos) ---
                const dpr = window.devicePixelRatio || 1;
                const rect = card.getBoundingClientRect();
                
                // Ajusta o tamanho interno (pixels reais)
                canvas.width = rect.width * dpr;
                canvas.height = 280 * dpr;
                
                // Ajusta o tamanho visual (CSS)
                canvas.style.width = rect.width + "px";
                canvas.style.height = "280px";
                
                const ctx = canvas.getContext('2d');
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // Escala o contexto para o DPR
                
                this.registry.set(card, { layers: dataStore.layers, config: config });
                this.drawCard(card);

                // Preload de áudio
                const folder = config.id.includes('field') ? 'chords' : 'scales';
                const fileSet = this.collectFiles(dataStore.layers);
                window.AudioEngine.preloadFiles(folder, fileSet).then(() => {
                    const data = this.registry.get(card);
                    if (data) {
                        data.isAudioLoaded = true;
                        card.classList.add('is-ready');
                    }
                });
            } catch (err) {
                console.error("App: Erro no processamento:", err);
            }
        }

        card.onclick = () => window.App.playCard(card);
    },

    drawCard: function(card) {
        const data = this.registry.get(card);
        const canvas = card.querySelector('canvas');
        if (!data || !canvas || !window.RenderEngine) return;

        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
                ctx.save();
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.restore();
        const style = getComputedStyle(card);
        const sysColor = style.getPropertyValue('--pianorama-notation-color').trim() || "#000";

        // Limpa a área visível considerando a escala
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Desenha o sistema básico
        const noteStartX = window.RenderEngine.drawSystem(ctx, 20, parseInt(canvas.style.width) - 15, 65, {
            key: data.config.key,
            accidentalMode: data.config.accidentalMode,
            time: data.config.time,
            color: sysColor
        });

        data.layers.forEach(layer => {
            const layerColor = style.getPropertyValue(layer.colorVar).trim() || sysColor;

            if (layer.type === "text") {
                window.RenderEngine.drawLabels(ctx, noteStartX, 65, layer.data, { color: layerColor });
            } else {
                const yTreble = 65;
                const lineSp = window.RenderConfig.lineSp || 10;
                const staffGap = window.RenderConfig.staffGap || 80;
                const yBass = yTreble + staffGap + (4 * lineSp);
                
                const treble = layer.treble || [];
                const bass = layer.bass || [];
                const len = Math.max(treble.length, bass.length);

                for (let i = 0; i < len; i++) {
                    let x = noteStartX + (i * 45);
                    if (x > parseInt(canvas.style.width) - 20) break;

                    if (treble[i]) {
                        window.RenderEngine.drawNote(ctx, x, yTreble, treble[i], {
                            color: layerColor, clef: "treble", accidentalMode: data.config.accidentalMode
                        });
                    }
                    if (bass[i]) {
                        window.RenderEngine.drawNote(ctx, x, yBass, bass[i], {
                            color: layerColor, clef: "bass", accidentalMode: data.config.accidentalMode
                        });
                    }
                }
            }
        });
    },

    bindEvents: function() {
        document.body.addEventListener('change', (e) => {
            if (e.target.classList.contains('pianorama__select--pitch') || 
                e.target.classList.contains('pianorama__select--key') ||
                e.target.classList.contains('pianorama__select--scales')) {
                this.handleSelection();
            }
        });
    },

    collectFiles: function(layers) {
        const fileSet = [];
        const enharmonics = { "Db": "C#", "Eb": "D#", "Gb": "F#", "Ab": "G#", "Bb": "A#" };
        layers.forEach(l => {
            if (l.type === "text") return;
            const all = (l.treble || []).concat(l.bass || []);
            all.forEach(slot => {
                if (!slot) return;
                [].concat(slot).forEach(n => {
                    if (n && n.fileName) {
                        let name = n.fileName;
                        for (let key in enharmonics) { name = name.replace(key, enharmonics[key]); }
                        if (!fileSet.includes(name)) fileSet.push(name);
                    }
                });
            });
        });
        return fileSet;
    },

    playCard: async function(card) {
        const data = this.registry.get(card);
        if (!data || !data.isAudioLoaded) return;

        if (this.currentPlayingCard === card) {
            this.stopAudio();
            return;
        }

        if (this.currentPlayingCard) this.stopAudio();
        await new Promise(r => setTimeout(r, 50));

        const playToken = Math.random(); 
        this.currentPlayToken = playToken;
        this.currentPlayingCard = card;
        card.classList.add('is-playing');

        window.AudioEngine.init();

        const bpm = (window.PIANORAMA_CONFIG && window.PIANORAMA_CONFIG.playback) ? window.PIANORAMA_CONFIG.playback.bpm : 80;
        const delay = (60 / bpm) * 1000; 

        const playableLayers = data.layers.filter(l => l.type !== "text");
        let maxSteps = 0;
        playableLayers.forEach(l => maxSteps = Math.max(maxSteps, (l.treble || []).length));

        for (let i = 0; i < maxSteps; i++) {
            if (this.currentPlayingCard !== card || this.currentPlayToken !== playToken) return;
        
            playableLayers.forEach(layer => {
                const t = layer.treble ? layer.treble[i] : null;
                const b = layer.bass ? layer.bass[i] : null;
                [t, b].forEach(slot => {
                    if (!slot) return;
                    [].concat(slot).forEach(n => {
                        if (n && n.fileName) {
                            const folder = (data.config.id.indexOf('field') > -1) ? 'chords' : 'scales';
                            window.AudioEngine.playFile(folder, n.fileName);
                        }
                    });
                });
            });
            await new Promise(r => setTimeout(r, delay));
        }
        if (this.currentPlayToken === playToken) this.stopAudio();
    },

    stopAudio: function() {
        if (this.currentPlayingCard) {
            this.currentPlayingCard.classList.remove('is-playing');
        }
        this.currentPlayingCard = null;
        this.currentPlayToken = null;
    },

    handleResize: function() {
        this.handleSelection();
    }
};

window.addEventListener('appReady', () => window.App.init());