/**
 * PIANORAMA - AudioEngine.js (v12.4)
 * Motor de áudio otimizado para rodar offline via Base64.
 * Compatível com dispositivos legados (iPad Air 1 / A1475).
 */

window.AudioEngine = {
    cache: new Map(),
    decodedCache: new Map(),
    ctx: null,
    masterGain: null,

    /**
     * Inicializa o contexto de áudio. 
     * Chamado via interação do usuário para contornar bloqueios de autoplay.
     */
    init: function() {
        if (!this.ctx) {
            // Suporte para WebkitAudioContext (Safari antigo/iOS)
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            
            // Volume vindo das configurações globais
            var volume = (window.PIANORAMA_CONFIG && window.PIANORAMA_CONFIG.audio) 
                         ? window.PIANORAMA_CONFIG.audio.volume 
                         : 0.5;
            
            this.masterGain.gain.value = volume;
            this.masterGain.connect(this.ctx.destination);
        }
        
        // Retoma o contexto caso o navegador o tenha suspendido
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    /**
     * Converte string Base64 em ArrayBuffer binário.
     */
    _base64ToArrayBuffer: function(base64) {
        // Remove o cabeçalho "data:audio/mp3;base64," se existir
        var base64String = base64.indexOf(',') > -1 ? base64.split(',')[1] : base64;
        var binaryString = window.atob(base64String);
        var len = binaryString.length;
        var bytes = new Uint8Array(len);
        
        for (var i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    },

    /**
     * Prepara os sons na memória. Agora busca do window.PIANORAMA_SAMPLES.
     */
    preloadFiles: async function(folder, fileNames) {
        var self = this;

        if (!window.PIANORAMA_SAMPLES) {
            console.warn("AudioData.js ainda processando... tentando novamente em 100ms");
            setTimeout(function() {
                self.preloadFiles(folder, fileNames);
            }, 100);
            return;
        }

        fileNames.forEach(function(name) {
            var cleanName = name.trim();
        
            // --- AQUI ESTÁ A CORREÇÃO REAL ---
            // Remove o .mp3 e converte sustenidos em bemóis para bater com o banco
            var cleanKey = cleanName.replace('.mp3', '')
                                    .replace('C#', 'Db')
                                    .replace('D#', 'Eb')
                                    .replace('F#', 'Gb')
                                    .replace('G#', 'Ab')
                                    .replace('A#', 'Bb');

            if (self.cache.has(cleanName)) return;

            var base64Data = window.PIANORAMA_SAMPLES[cleanKey];
            if (base64Data) {
                try {
                    var buffer = self._base64ToArrayBuffer(base64Data);
                    self.cache.set(cleanName, buffer);
                } catch (e) {
                    console.error("Erro ao processar buffer para: " + cleanKey, e);
                }
            } else {
                console.warn("Amostra não encontrada no banco de dados: " + cleanKey);
            }
        });
    },

    /**
     * Toca o arquivo a partir do cache de buffers.
     */
    playFile: async function(folder, fileName) {
        this.init(); 
        var name = fileName.trim();

        // 1. Tenta usar o buffer já decodificado (mais rápido)
        if (this.decodedCache.has(name)) {
            this._sourcePlay(this.decodedCache.get(name));
            return;
        }

        // 2. Se não estiver decodificado mas estiver no cache binário
        if (this.cache.has(name)) {
            var rawBuffer = this.cache.get(name);
            var self = this;

            try {
                // decodeAudioData costumava não aceitar Promises em versões muito antigas, 
                // mas no iPad Air 1 (iOS 12) funciona bem.
                this.ctx.decodeAudioData(rawBuffer.slice(0), function(decoded) {
                    self.decodedCache.set(name, decoded);
                    self._sourcePlay(decoded);
                }, function(err) {
                    console.error("Erro na decodificação do áudio: " + name, err);
                });
            } catch (e) {
                console.error("Falha ao iniciar decodificação: " + name);
            }
        }
    },

    /**
     * Cria o nó de áudio, aplica o envelope de volume e toca.
     */
    _sourcePlay: function(buffer, time) {
        var source = this.ctx.createBufferSource();
        var gainNode = this.ctx.createGain();
        source.buffer = buffer;

        var now = time || this.ctx.currentTime;
    
        var sustain = 3.5; 
        var release = 0.5;

        if (window.PIANORAMA_CONFIG && window.PIANORAMA_CONFIG.audio) {
            sustain = window.PIANORAMA_CONFIG.audio.sustain || 3.5;
            release = window.PIANORAMA_CONFIG.audio.release || 0.5;
        }

        // --- LÓGICA DE CORPO (PUNCH) ---
        // Fazemos a nota ficar no volume máximo (1.0) por 40% do tempo de sustain.
        // Isso evita a "fraqueza" na primeira nota e dá corpo ao piano.
        var peakDuration = sustain * 0.4; 

        // 1. Início imediato no volume máximo
        gainNode.gain.setValueAtTime(1.0, now);
    
        // 2. MANTÉM o volume em 1.0 até o fim do peakDuration
        gainNode.gain.setValueAtTime(1.0, now + peakDuration);
    
        // 3. Só agora inicia o decaimento exponencial suave até o fim
        // Usamos now + sustain + release para a curva total
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + sustain + release);

        source.connect(gainNode);
        gainNode.connect(this.masterGain);
    
        source.start(now);
        // Para o som um pouco depois do envelope acabar para evitar cliques
        source.stop(now + sustain + release + 0.1);
    }
};