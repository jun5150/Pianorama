/**
 * PIANORAMA - RenderConfig.js
 */
window.RenderConfig = {
    lineSp: 10,
    fontSize: 45,
    accSize: 32,
    clefSize: 40,
    braceSize: 160,
    staffGap: 80,
    stemHeight: 32,
    timeSize: 42,
    BRACE_X_OFFSET: -18,
    BRACE_Y_OFFSET: 80, 
    NOTE_X_START: 195,
    TIME_GLYPHS: { "0":"\uE080","1":"\uE081","2":"\uE082","3":"\uE083","4":"\uE084","5":"\uE085","6":"\uE086","7":"\uE087","8":"\uE088","9":"\uE089" },
    KEY_MAP: {
        "C": [], "G": ["F"], "D": ["F", "C"], "A": ["F", "C", "G"], "E": ["F", "C", "G", "D"], 
        "B": ["F", "C", "G", "D", "A"], "F#": ["F", "C", "G", "D", "A", "E"], "C#": ["F", "C", "G", "D", "A", "E", "B"],
        "G#": ["F", "C", "G", "D", "A", "E", "B", "F"], "D#": ["F", "C", "G", "D", "A", "E", "B", "F", "C"], // Suporte a tons teóricos
        "F": ["B"], "Bb": ["B", "E"], "Eb": ["B", "E", "A"], "Ab": ["B", "E", "A", "D"], 
        "Db": ["B", "E", "A", "D", "G"], "Gb": ["B", "E", "A", "D", "G", "C"], "Cb": ["B", "E", "A", "D", "G", "C", "F"]
    }
};