import audioManager from './musics.js';

document.addEventListener('DOMContentLoaded', () => {
    let hasInteracted = false;

   
    function startMusic() {
        if (!hasInteracted) {
            audioManager.play();
            hasInteracted = true;
        }
    }

    
    ['click', 'touchstart', 'keydown', 'scroll'].forEach(eventType => {
        document.addEventListener(eventType, startMusic, { once: true });
    });

    
    audioManager.audio.addEventListener('play', () => {
        if (audioManager.audio.currentTime < 10) {
            audioManager.audio.currentTime = 10;
        }
    });
});