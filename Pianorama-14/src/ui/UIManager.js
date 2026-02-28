/**
 * PIANORAMA - UIManager.js (v1.3)
 */
window.UIManager = {
    _attempts: 0,
    renderMainSelect: function(selector) {
        var self = this;
        var select = document.querySelector(selector);
        
        // Verifica se os dados teóricos já carregaram
        var hasData = window.SCALES && window.SCALES.library;

        if (!select || !hasData) {
            if (this._attempts < 10) {
                this._attempts++;
                setTimeout(function() { self.renderMainSelect(selector); }, 200);
            } else {
                console.error("UIManager: Falha crítica. Verifique se o seletor '" + selector + "' existe no HTML e se Scales.js carregou.");
            }
            return;
        }

        var catalog = window.TheoryEngine.getMenuCatalog();
        
        // Limpa e popula de forma segura para iPad
        while (select.firstChild) { select.removeChild(select.firstChild); }

        for (var i = 0; i < catalog.length; i++) {
            var opt = document.createElement('option');
            opt.value = catalog[i].id;
            opt.textContent = catalog[i].name;
            select.appendChild(opt);
        }

        select.onchange = function(e) {
            if (window.App && window.App.handleSelection) {
                window.App.handleSelection(e.target.value);
            }
        };
        
        console.log("UIManager: Menu populado com sucesso (" + selector + ")");
    }
};