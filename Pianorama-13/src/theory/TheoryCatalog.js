/**
 * PIANORAMA - TheoryCatalog.js
 * Varredura de bibliotecas para preenchimento de menus/UI.
 */
window.TheoryEngine = window.TheoryEngine || {};

(function(TE) {
    TE.getMenuCatalog = function() {
        var catalog = [];
        if (window.SCALES && window.SCALES.library) {
            var lib = window.SCALES.library;
            for (var cat in lib) {
                if (!lib.hasOwnProperty(cat)) continue;
                for (var key in lib[cat]) {
                    var item = lib[cat][key];
                    var label = (typeof item === 'object' && item.name) ? item.name : 
                                key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
                    catalog.push({ id: "scale:" + key, name: label });
                }
            }
        }
        if (window.CHORDS && window.CHORDS.harmonic_fields) {
            for (var fKey in window.CHORDS.harmonic_fields) {
                var fLabel = fKey.charAt(0).toUpperCase() + fKey.slice(1).replace(/_/g, ' ');
                catalog.push({ id: "field:\"" + fKey, name: fLabel });
            }
        }
        return catalog;
    };
})(window.TheoryEngine);