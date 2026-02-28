/**
 * PIANORAMA - Config.js
 * Central de Atributos: Altere aqui o comportamento global do app.
 */
window.PIANORAMA_CONFIG = {
    audio: {
        sustain: 3.5,     // Duração do som em segundos (quanto menor, mais curto/staccato)
        release: 0.15,    // Tempo de desvanecimento para evitar estalos (fade-out)
        volume: 1         // Volume master (0 a 1)
    },
    playback: {
        baseDelay: 250,   // Milissegundos entre notas em acordes/escalas curtas
        longDelay: 450,   // Milissegundos entre notas em escalas longas
        bpm: 120
    }
};