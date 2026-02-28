/**
 * PIANORAMA - Loader (v12.8)
 * Carregador sequencial resiliente.
 */

var scripts = [
    // 1. Config and Audio
    "config/Config.js",
    "assets/audio/AudioData.js",

    // 2. Data
    "src/data/TheoryMaps.js",
    "src/data/Scales.js",
    "src/data/Chords.js",
    "src/data/Pedagogy.js",
    "src/data/Database.js",

    // 3. Translators and Generators (Logic)
    "src/translators/ContextTranslator.js",
    "src/generators/SequenceBuilder.js",

    // 4. Engines
    "src/theory/TheorySpeller.js",
    "src/theory/TheoryCore.js",
    "src/theory/TheoryAnalyzer.js",
    "src/theory/TheoryCatalog.js",

    "src/engines/AudioEngine.js",

    "src/render/RenderConfig.js",   // Novo
    "src/render/RenderSystem.js",   // Novo
    "src/render/RenderNotation.js", // Novo
    "src/render/RenderEngine.js",

    "src/engines/LayerProcessors.js",

    "src/generators/ScaleGenerator.js",
    "src/generators/ChordGenerator.js",

    "src/engines/AtlasEngine.js",

    // 5. UI
    "src/ui/UIManager.js",
    "src/ui/ControlManager.js",
    "src/ui/UIHelpers.js",

    // 6. Init
    "src/core/Main.js"
];

function loadScripts(list) {
    if (list.length === 0) {
        console.log("Pianorama: Todos os sistemas carregados.");
        // Dispara o evento de prontidão usando a sintaxe antiga compatível
        var event;
        if (typeof(Event) === 'function') {
            event = new Event('appReady');
        } else {
            event = document.createEvent('Event');
            event.initEvent('appReady', true, true);
        }
        window.dispatchEvent(event);
        return;
    }

    var src = list.shift();
    var script = document.createElement('script');
    script.src = src;
    script.async = false; // Fundamental para manter a ordem
    
    script.onload = function() {
        console.log("Carregado: " + src);
        loadScripts(list);
    };

    script.onerror = function() {
        console.error("Erro crítico ao carregar: " + src);
    };

    document.head.appendChild(script);
}

// Inicia a cascata
loadScripts(scripts);