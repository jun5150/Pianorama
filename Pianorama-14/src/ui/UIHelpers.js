/**
 * PIANORAMA - Ui.js
 * Gerencia interações globais de interface
 */

window.setupToggleButtons = function() {
    document.addEventListener('click', function(event) {
        // O .closest é ótimo, mas se o iPad for MUITO antigo (iOS < 9), 
        // ele pode precisar de um polyfill. No Air 1 costuma rodar ok.
        var target = event.target.closest('.pianorama__btn'); 
        
        if (target) {
            target.classList.toggle('is-selected');
        }
    });
};