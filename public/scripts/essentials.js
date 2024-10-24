const soundToggle = document.getElementById('soundToggle');
const musicToggle = document.getElementById('musicToggle');
const menuTextElements = document.querySelectorAll('.fade');
const logoElement = document.querySelectorAll('.menuText');
const square = document.querySelector('.square');
const square2 = document.querySelector('.square2');
const settingsIcon = document.getElementById('settings');

let opacityChangeAllowed = true;

// Przełączniki dźwięku (Jedno kliknięcie - wyłącza, drugie - włącza dźwięk)
soundToggle.addEventListener('click', () => {
    soundEnabled = !soundEnabled;

    if (soundEnabled) {
        soundToggle.classList.remove('fa-volume-mute');
        soundToggle.classList.add('fa-volume-up');
    } else {
        soundToggle.classList.remove('fa-volume-up');
        soundToggle.classList.add('fa-volume-mute');
    }
});

musicToggle.addEventListener('click', () => {
    musicEnabled = !musicEnabled;

    if (musicEnabled) {
        music.play();
        musicToggle.classList.remove('fa-play');
        musicToggle.classList.add('fa-music');
    } else {
        music.pause();
        musicToggle.classList.remove('fa-music');
        musicToggle.classList.add('fa-play');
    }
});

// Funkcja do zmiany przezroczystości wszystkich elementów
function setAllOpacity(value) {
    menuTextElements.forEach(element => {
        element.style.opacity = value;
    });
    if (opacityChangeAllowed) {
        logoElement.forEach(element => {
            element.style.opacity = value;
        });
    }
}

// Wyciemnianie ekranu po najechaniu myszką na napisy
menuTextElements.forEach(element => {
    // MENU STARTOWE
    element.addEventListener('mouseenter', () => {
        opacityChangeAllowed = true;
        logoElement.style.opacity = 0.3;
        setAllOpacity('0.05'); 

        if (blinkStartElement) {
            blinkStartElement.classList.remove('blink-start');
        }
    });

    element.addEventListener('mouseleave', () => {
        opacityChangeAllowed = true;
        logoElement.style.opacity = 1;
        setAllOpacity('1'); 

        if (blinkStartElement) {
            blinkStartElement.classList.add('blink-start');
        }
    });

    // MENU PAUZY
    element.addEventListener('mouseenter', () => {
        opacityChangeAllowed = false;
        setAllOpacity('0.05');

        if (blinkResumeElement) {
            blinkResumeElement.classList.remove('blink-resume');
        }
    });

    element.addEventListener('mouseleave', () => {
        opacityChangeAllowed = false;
        setAllOpacity('1'); 

        if (blinkResumeElement) {
            blinkResumeElement.classList.add('blink-resume');
        }
    });
});

// Kliknięcie w menu sprawi, że gra rozpocznie się
square.addEventListener('click', () => {
    if (!enterPressed) {
        // Tryb minimalistyczny
        if (settings.minimalistMode) {
            let minimalModeElements = document.querySelectorAll('.minimal');
            minimalModeElements.forEach(element => {
                element.style.opacity = '0';
            });
        }
        gameArea.style.opacity = 1;
        initAudio();
        counting();
        enterPressed = true;
        gameArea.classList.toggle('hidden-cursor');
        playMusic();
        playStartSound();
        if (menuText) {
            menuText.classList.add('small');
            logoElement.style.opacity = 1;
        }
        opacityChangeAllowed = false;
    }
});

// Kliknięcie w pauzie sprawi, że gra wznowi się
square2.addEventListener('click', () => {
    if (escapeAllowed) {
        isPaused = !isPaused;
        pauseOverlay.style.display = isPaused ? 'flex' : 'none';
        gameArea.classList.toggle('hidden-cursor', !isPaused);

        resetFilter();
        menuText.style.opacity = 1;
        gameArea.style.opacity = 1;
    }
});

// Funkcja przycisku do ustawień
function handleSettingsClick(event) {
    setTimeout(() => {
        window.location.href = 'settings.html';
    }, 1);
}

if (settingsIcon) {
    settingsIcon.addEventListener('click', handleSettingsClick);
}

// Restart całej gry znajdującej się na index.html
document.getElementById('restartWholeGame').addEventListener('click', function() {
    location.reload();
});
