let audioContext;
let source;
let lowpassFilter;
let volume;
let analyser;

// Inicjalizacja
function initAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const musicElement = document.getElementById('music');
    source = audioContext.createMediaElementSource(musicElement);
    lowpassFilter = audioContext.createBiquadFilter();
    volume = audioContext.createGain();
    analyser = audioContext.createAnalyser();

    lowpassFilter.type = 'lowpass';
    lowpassFilter.frequency.setValueAtTime(20000, audioContext.currentTime);
    source.connect(lowpassFilter);
    lowpassFilter.connect(volume);
    volume.connect(audioContext.destination);
    volume.connect(analyser);

    analyser.fftSize = 512;
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
}

// Nałożenie LowPass filtru na poziomie 400 Hz i zmiana poziomu głośności
function filter() {
    audioContext.resume();
    lowpassFilter.frequency.setValueAtTime(400, audioContext.currentTime);
    if (settings.musicVolume / 100 >= 0.6) {
        volume.gain.setValueAtTime((settings.musicVolume / 100) - 0.3, audioContext.currentTime);
    } else {
        volume.gain.setValueAtTime(settings.musicVolume / 100, audioContext.currentTime);
    }
}

// Funkcja resetująca nałożony LowPass i poziom głośności
function resetFilter() {
    lowpassFilter.frequency.setValueAtTime(20000, audioContext.currentTime);
    volume.gain.setValueAtTime(settings.musicVolume / 100, audioContext.currentTime);
}