/**
 * PIANORAMA - ControlManager.js (v1.2)
 * Conecta a Toolbar exclusivamente ao App Principal.
 */
window.ControlManager = {
    init: function() {
        var self = this;
        
        // 1. Elementos da Toolbar
        var pitchSelect = document.querySelector('.pianorama__select--pitch');
        var scaleSelect = document.querySelector('.pianorama__select--scales');
        var invSelect   = document.querySelector('.pianorama__chords .pianorama__select');
        
        // 2. O Alvo (Apenas o que for "App", não os "Cards")
        var mainApp = document.querySelector('.pianorama__app--main');
        var secondaryApp = document.querySelector('.pianorama__app--secondary');
        
        if (!mainApp) return;

        // Listener: Troca de Tom (Key)
        if (pitchSelect) {
            pitchSelect.addEventListener('change', function(e) {
                var newKey = e.target.value;
                mainApp.dataset.key = newKey;
                if (secondaryApp) secondaryApp.dataset.key = newKey;
                
                self.updateDescription(newKey);
                self.refresh([mainApp, secondaryApp]);
            });
        }

        // Listener: Troca de Inversão
        if (invSelect) {
            invSelect.addEventListener('change', function(e) {
                var val = e.target.value;
                // Mapeia o valor do select (first, second...) para o motor (1, 2...)
                var invMap = { "first": 1, "second": 2, "third": 3, "fourth": 4, "fifth": 5 };
                mainApp.dataset.inversion = invMap[val] || 0;
                
                self.refresh([mainApp]);
            });
        }

        // Listener: Botões de Feature (REL, DEG, HFL)
        this.bindFeatureButtons(mainApp);
    },

    bindFeatureButtons: function(target) {
        var self = this;
        var buttons = document.querySelectorAll('.pianorama__btn[data-feature]');
        
        buttons.forEach(function(btn) {
            btn.addEventListener('click', function() {
                var feature = btn.dataset.feature;
                var isActive = btn.classList.toggle('is-active');

                // Mapeia o botão para o atributo do dataset do AtlasEngine
                switch(feature) {
                    case 'relative': 
                        target.dataset.layerRelative = isActive; 
                        break;
                    case 'harmonic-field': 
                        target.dataset.layerChords = isActive; 
                        break;
                    case 'degrees-functions': 
                        target.dataset.layerDegrees = isActive; 
                        break;
                }

                self.refresh([target]);
            });
        });
    },

    updateDescription: function(key) {
        var desc = document.querySelector('.pianorama__app--description');
        if (desc) desc.textContent = "Escala de " + key;
    },

    refresh: async function(elements) {
        if (!window.App) return;
        for (var i = 0; i < elements.length; i++) {
            if (elements[i]) {
                await window.App.setupCard(elements[i]);
                window.App.drawCard(elements[i], false);
            }
        }
    }
};