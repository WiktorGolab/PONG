// Funkcja do ładowania ustawień
function loadSettings() {
    fetch('/settings')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(settings => {
            console.log('Wczytane ustawienia:', settings);

            const ballSpeedSlider = document.querySelector('.ball-speed');
            const paddle1SensitivitySlider = document.querySelector('.paddle1-sensitivity');
            const paddle2SensitivitySlider = document.querySelector('.paddle2-sensitivity');
            const musicVolumeSlider = document.querySelector('.music-volume');
            
            ballSpeedSlider.value = settings.ballSpeed;
            paddle1SensitivitySlider.value = settings.paddle1Sensitivity;
            paddle2SensitivitySlider.value = settings.paddle2Sensitivity;
            musicVolumeSlider.value = settings.musicVolume;

            document.querySelector('.background-noise').checked = settings.backgroundNoise;
            document.querySelector('.minimalist-mode').checked = settings.minimalistMode;
            document.querySelector('.score-limit').value = settings.scoreLimit;

            localStorage.setItem('backgroundNoise', settings.backgroundNoise);

            setSliderBackground(ballSpeedSlider);
            setSliderBackground(paddle1SensitivitySlider);
            setSliderBackground(paddle2SensitivitySlider);
            setSliderBackground(musicVolumeSlider);
        })
        .catch(error => {
            console.error('Error loading settings:', error);
        });
}

// Funkcja do zapisywania ustawień
function saveSettings() {
    const settings = {
        ballSpeed: document.querySelector('.ball-speed').value,
        paddle1Sensitivity: document.querySelector('.paddle1-sensitivity').value,
        paddle2Sensitivity: document.querySelector('.paddle2-sensitivity').value,
        musicVolume: document.querySelector('.music-volume').value,
        backgroundNoise: document.querySelector('.background-noise').checked,
        minimalistMode: document.querySelector('.minimalist-mode').checked,
        scoreLimit: document.querySelector('.score-limit').value
    };

    fetch('/save-settings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.text();
    })
    .then(data => {
        console.log('Ustawienia zapisane:', data);
        loadSettings(); 
    })
    .catch(error => {
        console.error('Błąd podczas zapisywania ustawień:', error);
    });
}

// Funkcja do ustawiania tła dla suwaka
function setSliderBackground(slider) {
    const value = (slider.value - slider.min) / (slider.max - slider.min) * 100;
    slider.style.background = `linear-gradient(to right, #fff 0%, #fff ${value}%, #808080 ${value}%, #808080 100%)`;
}

// Wywołanie funkcji po załadowaniu strony
const noise = document.getElementById('noise');

window.onload  = function() {
    loadSettings();
    noise.play();
}

// Powrót do menu poprzez klawisz ESC
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        window.location.href = 'index.html';
    }
});

// Ustawienie stylu suwaków
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('input[type="range"]').forEach(slider => {
        setSliderBackground(slider);
        slider.addEventListener('input', function() {
            setSliderBackground(this);
        });
    });
});

// Komunikat o zapisie ustawień
const acceptSettingsButton = document.getElementById('acceptSettings');
const acceptSettingsText = document.querySelector('.acceptSettingsText');

if (acceptSettingsButton) {
    acceptSettingsButton.addEventListener('click', saveSettings);
    acceptSettingsButton.addEventListener('click', function() {
        acceptSettingsText.style.opacity = 1;

        setTimeout(function() {
            acceptSettingsText.style.opacity = 0;
        }, 2000);
    });
}