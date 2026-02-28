window.PIANORAMA_DATA = {
    config: {
        version: "4.5",
        pitch_reference: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
        piano_range: {
            central_octave: 4,
            sweet_spot_chords: [3, 4, 5],
            midi_limits: {"min": 21, "max": 108}
        }
    },
    // Teoria
    enharmonics: THEORY_MAPS.enharmonics,
    relative_map: THEORY_MAPS.relative_map,
    key_signatures: THEORY_MAPS.key_signatures,
    note_to_degree: THEORY_MAPS.note_to_degree,
    
    // Escalas
    intervals: SCALES.intervals,
    scale_library: SCALES.library,
    
    // Acordes
    chord_formulas: CHORDS.formulas,
    harmonic_fields: CHORDS.harmonic_fields,
    functions_advanced: CHORDS.functions_advanced,
    chord_inversions: CHORDS.inversions,
    blues_penta_chords: CHORDS.blues_penta_chords,
    
    // Outros
    pedagogy: PEDAGOGY.pedagogy,
    rhythm: PEDAGOGY.rhythm
};