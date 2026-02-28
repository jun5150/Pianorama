/**
 * PIANORAMA - TheoryCatalog.js
 * Varredura de bibliotecas para preenchimento de menus/UI.
 */
window.TheoryEngine = window.TheoryEngine || {};

window.TheoryEngine = window.TheoryEngine || {};
(function(TE) {
    TE.getMenuCatalog = function() {
        var catalog = [];
        // Verifica se a biblioteca de escalas existe antes de iterar
        if (window.SCALES && window.SCALES.library) {
            var lib = window.SCALES.library;
            for (var cat in lib) {
                for (var key in lib[cat]) {
                    var item = lib[cat][key];
                    var label = (item && item.name) ? item.name : key;
                    catalog.push({ id: "scale:" + key, name: label });
                }
            }
        }
        return catalog;
    };
})(window.TheoryEngine);