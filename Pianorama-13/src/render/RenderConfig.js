/**
 * PIANORAMA - RenderConfig.js
 * Central de constantes e mapeamentos de glifos.
 */

window.RenderConfig = {
    // Dimensões e espaçamentos
    lineSp: 10,
    fontSize: 45,
    accSize: 32,
    clefSize: 40,
    braceSize: 160,
    staffGap: 80,
    stemHeight: 32,
    timeSize: 42,

    // Travas de Layout Fixo
    X_CLEF: 10,         // Início da Clave
    X_KEY_SIG: 45,      // Início da Armadura
    X_TIME_SIG: 145,    // Início da Fórmula de Compasso
    X_NOTE_START: 195,  // Onde a primeira nota sempre começa

    // Mapeamento de Glifos de Tempo (Bravura)
    TIME_GLYPHS: {
        "0": "\uE080", "1": "\uE081", "2": "\uE082", "3": "\uE083", "4": "\uE084",
        "5": "\uE085", "6": "\uE086", "7": "\uE087", "8": "\uE088", "9": "\uE089"
    },

    // Mapeamento de Armaduras
    KEY_MAP: {
        "C": [], "G": ["F"], "D": ["F", "C"], "A": ["F", "C", "G"], "E": ["F", "C", "G", "D"], 
        "B": ["F", "C", "G", "D", "A"], "F#": ["F", "C", "G", "D", "A", "E"], "C#": ["F", "C", "G", "D", "A", "E", "B"],
        "F": ["B"], "Bb": ["B", "E"], "Eb": ["B", "E", "A"], "Ab": ["B", "E", "A", "D"], 
        "Db": ["B", "E", "A", "D", "G"], "Gb": ["B", "E", "A", "D", "G", "C"], "Cb": ["B", "E", "A", "D", "G", "C", "F"]
    }
};