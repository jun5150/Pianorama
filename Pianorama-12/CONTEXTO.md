###PIANORAMA
Gerador de cards de exemplos em partitura com áudio FluidR3 em Base64
App de teoria musical e conteúdo para treino (escalas, relativas, campos harmônicos, harmonia funcional e modal, etc.)

####CONTEXTO.MD (Draft)

Hierarquia de Globais:
1. window.PIANORAMA_CONFIG: Ajustes de BPM, cores e caminhos de áudio.
2. window.TheoryEngine: O cérebro. Resolve fórmulas de escalas e acordes.
3. window.ContextTranslator: O tradutor de MIDI para Notação (crucial para o absoluteY).
4. window.AtlasEngine: O orquestrador. Transforma dataset em Layers.
5. window.App: O controlador do DOM e eventos.

Ordem de Carregamento (Dependências):
Config -> 2. Data -> 3. Translators -> 4. Generators -> 5. Engines -> 6. UI -> 7. Main.

Variáveis de Dataset (Laboratório):
data-key, data-id, data-inversion, data-layer-chords, data-layer-degrees.


Pianorama/
    ├── Windows.bat
    ├── Unix.sh
    ├── _server/
    │   ├── pocketbase_windows.exe
    │   ├── pocketbase_linux
    │   └── pocketbase_mac
    └── pb_public/
        ├── index.html                       (UI)
        ├── assets/                          # Recursos globais
        │   ├── fonts/                       # Bravura.otf, etc.
        │   ├── css/                         # style.css, cards.css app.css, custom.css (variáveis CSS para customização)
        │   └── audio/                       # C4.mp3, Db4.mp3, etc.
        └── src/
              ├── main.js                    (Importa todos e inicia o app)
              ├── Config.js                  (Configurações gerais)
              ├── engines/
              │   ├── AtlasEngine.js         (Orquestrador de módulos)
              │   ├── AudioEngine.js         (Objeto de som)
              │   ├── RenderEngine.js        (Objeto de desenho)
              │   ├── LayerProcessors.js     (Gerenciador de camadas de visualização)
              │   └── TheoryEngine.js        (Gerenciador de teoria)
              ├── generators/
              │   ├── ScaleGenerator.js      (Lógica de escalas)
              │   ├── ChordGenerator.js      (Lógica de acordes)
              │   └── SequenceBuilder.js     (Lógica de sequências)
              ├── translators/
              │   └── ContextTranslator.js   (Lógica contextual)
              └── data/
                  ├── Database.js            (Gerenciador dos arquivos de dados)
                  ├── Scales.js              (Exporta PIANORAMA_DATA)
                  ├── Chords.js              (Exporta PIANORAMA_DATA)
                  ├── Pedagogy.js            (Exporta PIANORAMA_DATA)
                  └── TheoryMaps.js          (Exporta PIANORAMA_DATA - Relações)