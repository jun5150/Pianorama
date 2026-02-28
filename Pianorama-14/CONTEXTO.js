/**
 * CONTEXTO.txt
 */

PIANORAMA
Gerador de cards de exemplos em partitura com áudio FluidR3 em Base64
App de teoria musical e conteúdo para treino (escalas, relativas, campos harmônicos, harmonia funcional e modal, etc.)

Pianorama/
    ├── index.html                       (UI)
    ├── assets/                          # Recursos globais
    │   ├── fonts/                       # Bravura.otf, etc.
    │   ├── css/                         # style.css, cards.css app.css, custom.css (variáveis CSS para customização)
    │   └── audio/                       # C4.mp3, Db4.mp3, etc.
    └── src/
          ├── main.js                    (Importa todos e inicia o app)
          ├── config/                    (Configurações gerais)
          │   ├── Config.js              (Gerenciador de camadas de visualização)
          │   └── Custom.css             (Gerenciador de teoria)
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
          ├── theory/
          │   ├── TheoryCore.js          (Lógica de escalas)
          │   ├── TheoryAnaliyser.js     (Lógica de acordes)
          │   └── TheoryMenuBuilder.js   (Lógica de sequências)
          ├── render/
          │   ├── RenderConfig.js        (Lógica de escalas)
          │   ├── RenderNotation.js      (Lógica de acordes)
          │   ├── RenderSystem.js        (Lógica de acordes)
          │   └── RenderEngine.js        (Lógica de sequências)
          ├── translators/
          │   └── ContextTranslator.js   (Lógica contextual)
          └── data/
              ├── Database.js            (Gerenciador dos arquivos de dados)
              ├── Scales.js              (Exporta PIANORAMA_DATA)
              ├── Chords.js              (Exporta PIANORAMA_DATA)
              ├── Pedagogy.js            (Exporta PIANORAMA_DATA)
              └── TheoryMaps.js          (Exporta PIANORAMA_DATA - Relações)
