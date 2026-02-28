/**
 * PIANORAMA - Main.js (v20.1)
 */
window.App = {
    registry: new Map(),

    init: async function() {
        var self = this;
        try {
            if (document.fonts) await document.fonts.ready;
            
            if (window.UIManager && window.UIManager.renderMainSelect) {
                window.UIManager.renderMainSelect('.pianorama__select--scales');
            }
            this.bindEvents();
            
            setTimeout(function() { 
                self.handleSelection(); 
            }, 150);
        } catch (e) { console.error("Main Init Error:", e); }
    },

    handleSelection: function() {
        var self = this;
        var keySelect = document.querySelector('.pianorama__select--pitch, .pianorama__select--key');
        var scaleSelect = document.querySelector('.pianorama__select--scales');
        if (!keySelect) return;

        var valKey = keySelect.value;
        var valScale = scaleSelect ? scaleSelect.value : "scale:major";

        var cards = document.querySelectorAll('.pianorama__card, .pianorama__app--main, .pianorama__app--secondary');
        for (var i = 0; i < cards.length; i++) {
            var card = cards[i];
            card.setAttribute('data-key', valKey);
            card.setAttribute('data-id', valScale.indexOf(':') !== -1 ? valScale : "scale:" + valScale);
            self.setupCard(card);
        }
    },

    setupCard: function(card) {
        var canvas = card.querySelector('canvas');
        if (!canvas) return;

        var config = {
            key: card.getAttribute('data-key') || "C",
            id: card.getAttribute('data-id') || "scale:major",
            accidentalMode: card.getAttribute('data-accidental') || "signature"
        };

        if (window.AtlasEngine) {
            var dataStore = window.AtlasEngine.processCardData(config);
            var dpr = window.devicePixelRatio || 1;
            var displayWidth = card.clientWidth || 800;
            
            canvas.width = displayWidth * dpr;
            canvas.height = 160 * dpr;
            canvas.style.width = displayWidth + "px";
            canvas.style.height = "160px";

            this.registry.set(card, { config: config, layers: dataStore.layers });
            this.drawCard(card);
        }
    },

    drawCard: function(card) {
        var data = this.registry.get(card);
        var canvas = card.querySelector('canvas');
        if (!data || !canvas) return;

        var ctx = canvas.getContext('2d');
        var dpr = window.devicePixelRatio || 1;
        var width = canvas.width / dpr;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.scale(dpr, dpr);

        var sigKey = "C";
        if (window.TheoryEngine && window.TheoryEngine.getRelativeKeyForSignature) {
            sigKey = window.TheoryEngine.getRelativeKeyForSignature(data.config.key, data.config.id);
        }

        window.RenderEngine.drawStaff(ctx, 10, width - 20, 40, { 
            clef: "treble", 
            key: sigKey,
            accidentalMode: data.config.accidentalMode 
        });

        var noteStartX = 110;
        data.layers.forEach(function(layer) {
            if (layer.type !== "text") {
                var color = "#000"; 
                (layer.treble || []).forEach(function(note, i) {
                    if (note) {
                        window.RenderEngine.drawNote(ctx, noteStartX + (i * 55), 40, note, {
                            color: color,
                            clef: "treble",
                            keySignature: sigKey
                        });
                    }
                });
            }
        });
        ctx.restore();
    },

    bindEvents: function() {
        var self = this;
        var selectors = ['.pianorama__select--pitch', '.pianorama__select--key', '.pianorama__select--scales'];
        selectors.forEach(function(s) {
            var el = document.querySelector(s);
            if (el) el.addEventListener('change', function() { self.handleSelection(); });
        });
    }
};

window.addEventListener('appReady', function() { window.App.init(); });