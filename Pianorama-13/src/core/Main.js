/**
 * PIANORAMA - Main.js (v18.0)
 * Foco: Sincronização forçada de seletores e correção de estado.
 */

window.App = {
    registry: new Map(),
    currentPlayingCard: null,

    init: async function() {
        console.log("App: Iniciando v18.0...");
        
        try {
            if (document.fonts) await document.fonts.ready;
            
            // 1. Popula o menu de escalas
            if (window.UIManager && typeof window.UIManager.renderMainSelect === 'function') {
                window.UIManager.renderMainSelect('.pianorama__select--scales');
            }

            // 2. Tenta encontrar os selects para bindar eventos
            this.bindEvents();

            // 3. Renderização Inicial com forçagem de Tonalidade
            // Usamos um pequeno delay para garantir que o DOM está 100% estável
            setTimeout(() => {
                this.handleSelection();
            }, 200);

        } catch (e) {
            console.error("App: Erro na inicialização:", e);
        }

        window.addEventListener('resize', () => this.handleResize());
    },

    /**
     * handleSelection: O coração da sincronia. 
     * Ele lê os menus e injeta os valores nos cards e nos motores de lógica.
     */
    handleSelection: async function() {
        // Busca o seletor de tom (tenta as duas classes possíveis para evitar erro)
        const keySelect = document.querySelector('.pianorama__select--pitch') || 
                          document.querySelector('.pianorama__select--key');
        
        const scaleSelect = document.querySelector('.pianorama__select--scales');
        
        if (!keySelect) {
            console.error("App: Crítico - Seletor de Tonalidade não encontrado no HTML!");
            return;
        }

        const newKey = keySelect.value; // Ex: "C", "G", "Eb"
        let rawId = scaleSelect ? scaleSelect.value : "major";
        
        // Normaliza o ID para o AtlasEngine (garante o prefixo scale:)
        const newScaleId = rawId.includes(':') ? rawId : "scale:" + rawId;

        console.log(`App: Sincronizando -> [${newKey}] [${newScaleId}]`);

        // 1. Sincroniza o Tradutor (Muda o cálculo do absoluteY)
        if (window.ContextTranslator && window.ContextTranslator.setContext) {
            window.ContextTranslator.setContext(newKey);
        }

        // 2. Atualiza os Datasets dos cards no HTML
        const targets = document.querySelectorAll('.pianorama__card, .pianorama__app--main, .pianorama__app--secondary');
        targets.forEach(card => {
            card.dataset.key = newKey; // Aqui matamos o "Eb" travado
            if (card.classList.contains('pianorama__app--main')) {
                card.dataset.id = newScaleId;
            }
            
            // Limpa o canvas antes de redesenhar para evitar "linhas grossas"
            const canvas = card.querySelector('canvas');
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        });

        // 3. Limpa o cache de dados e renderiza
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

        // Configuração para o AtlasEngine
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
                this.registry.set(card, { layers: dataStore.layers, config: config });
                
                canvas.width = card.offsetWidth || 800; 
                canvas.height = 280; 
                
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
                console.error("App: Erro no Atlas/Render:", err);
            }
        }

        card.onclick = () => window.App.playCard(card);
    },

    drawCard: function(card) {
        const data = this.registry.get(card);
        const canvas = card.querySelector('canvas');
        if (!data || !canvas || !window.RenderEngine) return;

        const ctx = canvas.getContext('2d');
        const style = getComputedStyle(card);
        const sysColor = style.getPropertyValue('--pianorama-notation-color').trim() || "#000";

        // Chama o RenderEngine (v10.3) passando o contexto correto
        const noteStartX = window.RenderEngine.drawSystem(ctx, 20, canvas.width - 15, 65, {
            key: data.config.key,
            accidentalMode: data.config.accidentalMode,
            time: data.config.time,
            color: sysColor
        });

        // Loop de Camadas
        data.layers.forEach(layer => {
            const layerColor = style.getPropertyValue(layer.colorVar).trim() || sysColor;

            if (layer.type === "text") {
                window.RenderEngine.drawLabels(ctx, noteStartX, 65, layer.data, { color: layerColor });
            } else {
                const yTreble = 65;
                const yBass = 65 + (window.RenderConfig.staffGap || 80) + 40;
                
                const treble = layer.treble || [];
                const bass = layer.bass || [];
                const len = Math.max(treble.length, bass.length);

                for (let i = 0; i < len; i++) {
                    let x = noteStartX + (i * 45);
                    if (x > canvas.width - 20) break;

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
        // Delegação de eventos para capturar mudanças nos menus
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
                const notes = Array.isArray(slot) ? slot : [slot];
                notes.forEach(n => {
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

        // 1. Se o card clicado já é o que está tocando, para tudo e sai (Toggle)
        if (this.currentPlayingCard === card) {
            console.log("App: Parando execução atual.");
            this.stopAudio();
            return;
        }

        // 2. Se havia outro card tocando, para ele primeiro
        if (this.currentPlayingCard) {
            this.stopAudio();
            // Pequena pausa para garantir que o loop anterior detecte a mudança
            await new Promise(r => setTimeout(r, 50));
        }

        // 3. Define o novo card como o atual e gera um Token único para esta execução
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

        console.log("App: Iniciando Playback...");

        for (let i = 0; i < maxSteps; i++) {
            // 4. VERIFICAÇÃO CRÍTICA:
            // Se o card atual mudou OU se o token de execução mudou, mata este loop
            if (this.currentPlayingCard !== card || this.currentPlayToken !== playToken) {
                console.log("App: Loop abortado (Token/Card antigo).");
                return; 
            }
        
            playableLayers.forEach(layer => {
                const notesAtTime = [
                    layer.treble ? layer.treble[i] : null, 
                    layer.bass ? layer.bass[i] : null
                ];
            
                notesAtTime.forEach(slot => {
                    if (!slot) return;
                    const notes = Array.isArray(slot) ? slot : [slot];
                    notes.forEach(n => {
                        if (n && n.fileName) {
                            const folder = data.config.folder || 'scales';
                            window.AudioEngine.playFile(folder, n.fileName);
                        }
                    });
                });
            });

            await new Promise(r => setTimeout(r, delay));
        }

        // 5. Se chegou ao fim do loop e ainda é o mesmo card/token, limpa o estado
        if (this.currentPlayToken === playToken) {
            this.stopAudio();
        }
    },

    stopAudio: function() {
        if (this.currentPlayingCard) {
            this.currentPlayingCard.classList.remove('is-playing');
        }
        this.currentPlayingCard = null;
        this.currentPlayToken = null; // Invalida qualquer loop que esteja rodando
    },

    handleResize: function() {
        this.handleSelection();
    }
};

window.addEventListener('appReady', () => window.App.init());