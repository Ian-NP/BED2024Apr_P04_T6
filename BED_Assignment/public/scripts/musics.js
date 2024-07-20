class AudioManager {
    constructor() {
        if (!AudioManager.instance) {
            this.audio = new Audio('../music/music2.mp3');
            this.audio.loop = true;
            this.audio.preload = 'auto';

            const isMusicPlaying = sessionStorage.getItem('isMusicPlaying') === 'true';
            const currentTime = parseFloat(sessionStorage.getItem('currentTime')) || 0; 
            const playbackSpeed = parseFloat(sessionStorage.getItem('playbackSpeed')) || 1.0;
            const volume = parseFloat(sessionStorage.getItem('volume')) || 1;

            this.audio.currentTime = currentTime;
            this.audio.playbackRate = playbackSpeed;
            this.audio.volume = volume;

            this.audio.addEventListener('loadedmetadata', () => {
                this.audio.currentTime = currentTime;
                this.audio.playbackRate = playbackSpeed;
                this.audio.volume = volume;

                if (isMusicPlaying) {
                    this.audio.play();
                } else {
                    this.audio.pause();
                }
            });

            this.audio.addEventListener('timeupdate', () => {
                sessionStorage.setItem('currentTime', this.audio.currentTime.toFixed(20));
            });

            AudioManager.instance = this;
        }
        return AudioManager.instance;
    }

    play() {
        if (this.audio.currentTime < 10) {
            this.audio.currentTime = 10; // Always start at 10 seconds
        }
        this.audio.play();
        sessionStorage.setItem('isMusicPlaying', 'true');
    }

    pause() {
        this.audio.pause();
        sessionStorage.setItem('isMusicPlaying', 'false');
    }

    toggle() {
        if (this.audio.paused) {
            this.play();
        } else {
            this.pause();
        }
    }

    isPlaying() {
        return !this.audio.paused;
    }

    setPlaybackSpeed(speed) {
        this.audio.playbackRate = speed;
        sessionStorage.setItem('playbackSpeed', speed);
    }

    getPlaybackSpeed() {
        return this.audio.playbackRate;
    }

    setVolume(volume) {
        this.audio.volume = volume;
        sessionStorage.setItem('volume', volume);
    }

    getVolume() {
        return this.audio.volume;
    }
}

const audioManager = new AudioManager();
Object.freeze(audioManager);
export default audioManager;