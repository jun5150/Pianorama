/**
 * PIANORAMA - Main.js (v20.0)
 * Ajustado para suporte a Spelling Harmônico e Armaduras de Clave Dinâmicas.
 */
window.App = {
    registry: new Map(),

    init: async function() {
        try {
            // Força espera pela fonte musical (Bravura)
            if (document.fonts) await document.fonts.ready;
            
            // Popula o menu de escalas se o UIManager estiver disponível
            if (window.UIManager && window.UIManager.renderMainSelect) {
                window.UIManager.renderMainSelect('.pianorama__select--scales');
            }
            
            this.bindEvents();
            
            // Pequeno delay para garantir que o CSS aplicou as larguras antes de medir o canvas
            setTimeout(() => this.handleSelection(), 150);
        } catch (e) { 
            console.error("Pianorama Init Error:", e); 
        }
    },

    /**
     * Captura os valores dos seletores e atualiza os atributos dos cards/viewers.
     */
    handleSelection: function() {
        const keySelect = document.querySelector('.pianorama__select--pitch, .pianorama__select--key');
        const scaleSelect = document.querySelector('.pianorama__select--scales');
        
        if (!keySelect) return;

        const valKey = keySelect.value;
        const valScale = scaleSelect ? scaleSelect.value : "scale:major";

        // Atualiza tanto os viewers principais quanto cards estáticos
        document.querySelectorAll('.pianorama__card, .pianorama__app--main, .pianorama__app--secondary').forEach(card => {
            card.setAttribute('data-key', valKey);
            card.setAttribute('data-id', valScale.includes(':') ? valScale : "scale:" + valScale);
            this.setupCard(card);
        });
    },

    /**
     * Prepara os dados técnicos (camadas) e configura o canvas físico.
     */
    setupCard: function(card) {
        const canvas = card.querySelector('canvas');
        if (!canvas) return;

        const config = {
            key: card.getAttribute('data-key') || "C",
            id: card.getAttribute('data-id') || "scale:major",
            accidentalMode: card.getAttribute('data-accidental') || "signature", // Default: respeitar armadura
            inversion: parseInt(card.getAttribute('data-inversion')) || 0,
            layerRelative: card.getAttribute('data-layer-relative') === "true",
            layerChords: card.getAttribute('data-layer-chords') === "true",
            layerDegrees: card.getAttribute('data-layer-degrees') === "true"
        };

        if (window.AtlasEngine) {
            // Processa as camadas (Notas, Acordes, Texto)
            const dataStore = window.AtlasEngine.processCardData(config);
            
            // Ajuste de DPI (Retina/High-Res)
            const dpr = window.devicePixelRatio || 1;
            const displayWidth = card.clientWidth || 800;
            
            canvas.width = displayWidth * dpr;
            canvas.height = 180 * dpr; // Aumentado levemente para comportar graus (DEG)
            canvas.style.width = displayWidth + "px";
            canvas.style.height = "180px";

            // Registra para renderização
            this.registry.set(card, { config, layers: dataStore.layers });
            this.drawCard(card);
        }
    },

    /**
     * Executa o desenho no Canvas baseado nos dados processados.
     */
    drawCard: function(card) {
        const data = this.registry.get(card);
        const canvas = card.querySelector('canvas');
        if (!data || !canvas) return;

        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const width = canvas.width / dpr;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.scale(dpr, dpr);

        // 1. LÓGICA DE ARMADURA:
        // Converte a tonalidade (Ex: Do Menor -> Armadura de Mib Maior)
        let sigKey = window.TheoryEngine.getRelativeKeyForSignature(data.config.key, data.config.id);

        // 2. DESENHAR O PENTAGRAMA (STAFF)
        window.RenderEngine.drawStaff(ctx, 10, width - 20, 40, { 
            clef: "treble", 
            key: sigKey,
            accidentalMode: data.config.accidentalMode 
        });

        // 3. DESENHAR AS CAMADAS (NOTAS E LABELS)
        const noteStartX = 110; // Espaço para clave + armadura
        const spacing = 55;    // Espaçamento entre notas

        data.layers.forEach(layer => {
            const color = getComputedStyle(document.documentElement)
                          .getPropertyValue(layer.colorVar || '--pianorama-notation-color').trim() || "#000";

            if (layer.type === "text") {
                // Camada de Graus/Funções (DEG)
                window.RenderEngine.drawLabels(ctx, noteStartX, 40, layer.data, { color: color });
            } else {
                // Camada de Notas ou Acordes
                (layer.treble || []).forEach((note, i) => {
                    if (note) {
                        window.RenderEngine.drawNote(ctx, noteStartX + (i * spacing), 40, note, {
                            color: color,
                            clef: "treble",
                            keySignature: sigKey, // Crucial para esconder acidentes repetidos
                            accidentalMode: data.config.accidentalMode
                        });
                    }
                });
            }
        });

        ctx.restore();
    },

    /**
     * Vincula os eventos de interface.
     */
    bindEvents: function() {
        const selectors = [
            '.pianorama__select--pitch', 
            '.pianorama__select--key', 
            '.pianorama__select--scales'
        ];

        selectors.forEach(s => {
            const el = document.querySelector(s);
            if (el) {
                el.addEventListener('change', () => this.handleSelection());
            }
        });

        // Ouve redimensionamento da janela para reajustar os canvas
        window.addEventListener('resize', () => {
            document.querySelectorAll('.pianorama__app--main, .pianorama__card').forEach(card => {
                this.setupCard(card);
            });
        });
    }
};

// Inicialização automática ao carregar o script
window.addEventListener('appReady', function() {
    window.App.init();
});