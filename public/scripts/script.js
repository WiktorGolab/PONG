const paddle1 = document.getElementById('paddle1');
const paddle2 = document.getElementById('paddle2');
const ball = document.getElementById('ball');
const score1Display = document.getElementById('score1');
const score2Display = document.getElementById('score2');
const gameArea = document.getElementById('game');
const pauseOverlay = document.getElementById('pauseOverlay');
const menuOverlay = document.getElementById('menuOverlay');
let blinkStartElement = document.querySelector('.blink-start');
let blinkResumeElement = document.querySelector('.blink-resume');
const menuText = document.querySelector('.menuText');

const pointSound = document.getElementById('pointSound');
const paddleSound = document.getElementById('paddleSound');
const wallSound = document.getElementById('wallSound');
const startSound = document.getElementById('startSound');
const winSound = document.getElementById('win');
const music = document.getElementById('music');

const restart = document.getElementById('restart');
const countdownElement = document.getElementById('countdown');

let settings = {};
let ballSpeedX = 0;
let ballSpeedY = 0;
let paddle1Speed = 0;
let paddle2Speed = 0;
let paddle1Y = (gameArea.offsetHeight / 2) - (paddle1.offsetHeight / 2);
let paddle2Y = (gameArea.offsetHeight / 2) - (paddle2.offsetHeight / 2);
let score1 = 0;
let score2 = 0;
let soundEnabled = true;
let musicEnabled = true;
let isPaused = true;
let enterPressed = false;
let escapeAllowed = false;

// Ładowanie ustawień z pliku JSON
window.onload = loadSettings;

document.addEventListener('DOMContentLoaded', function() {
    fetch('/settings')
        .then(response => response.json())
        .then(loadedSettings => {
            settings = loadedSettings;
        })
        .catch(error => console.error('Error loading settings:', error));
});

async function loadSettings() {
    try {
        const response = await fetch('/settings');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const settings = await response.json();
        console.log('Wczytane ustawienia:', settings);
        
        if (settings.backgroundNoise) {
            removeNoiseCanvas();
        }

        return settings;
    } catch (error) {
        console.error('Error loading settings:', error);
        return {
            ballSpeed: 6,
            paddle1Sensitivity: 5,
            paddle2Sensitivity: 5,
            musicVolume: 100,
            backgroundNoise: false,
            minimalistMode: false,
            scoreLimit: 0
        };
    }
}

// Zaaplikuj zmiany z settings.json
loadSettings().then((settings) => {
    ballSpeedX = settings.ballSpeed;
    ballSpeedY = settings.ballSpeed;
    paddle1Sensitivity = settings.paddle1Sensitivity;
    paddle2Sensitivity = settings.paddle2Sensitivity;
    resetBall();
});

// Usuwanie szumu z tła
function removeNoiseCanvas() {
    const backgroundNoise = localStorage.getItem('backgroundNoise') === 'true';
    
    if (backgroundNoise) {
        const noiseCanvasElements = document.querySelectorAll('canvas#noiseCanvas');
        noiseCanvasElements.forEach(canvas => {
            canvas.remove();
        });
    }
}

// Funkcje odtwarzające dźwięki z warunkiem
function playPointSound() {
    if (soundEnabled) pointSound.play();
}

function playPaddleSound() {
    if (soundEnabled) paddleSound.play();
}

function playWallSound() {
    if (soundEnabled) wallSound.play();
}

function playStartSound() {
    if (soundEnabled) startSound.play();
}

function playWinSound() {
    if (musicEnabled) {
        winSound.volume = settings.musicVolume / 100;
        winSound.play();
    }
}

function playMusic() {
    if (musicEnabled) music.play();
    volume.gain.setValueAtTime(settings.musicVolume / 100, audioContext.currentTime);
}

// Obsługa klawiszy
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        // GRACZ 1
        case 'w':
            paddle1Speed = -1 * paddle1Sensitivity;
            break;
        case 's':
            paddle1Speed = 1 * paddle1Sensitivity;
            break;
        // GRACZ 2
        case 'ArrowUp':
            paddle2Speed = -1 * paddle2Sensitivity;
            break;
        case 'ArrowDown':
            paddle2Speed = 1 * paddle2Sensitivity;
            break;
        // PAUZA (Warunek - można wcisnąć pauzę pod warunkiem, że menu startowe nie jest aktywne)
        case 'Escape':
            if (escapeAllowed) {
                isPaused = !isPaused;
                pauseOverlay.style.display = isPaused ? 'flex' : 'none';
                gameArea.classList.toggle('hidden-cursor', !isPaused);

                // Zmiany w filtrze dolnoprzepustowym tylko gdy gra jest w pauzie
                if (isPaused) {
                    filter();
                    menuText.style.opacity = 0.3;
                    gameArea.style.opacity = 0.3;
                } else {
                    resetFilter();
                    menuText.style.opacity = 1;
                    gameArea.style.opacity = 1;
                }                
            }
            break;
        // MENU STARTOWE (Warunek - można wcisnąć ENTER tylko raz)
        case 'Enter':
            if (!enterPressed) {
                // Tryb minimalistyczny
                if (settings.minimalistMode) {
                    let minimalModeElements = document.querySelectorAll('.minimal');
                    minimalModeElements.forEach(element => {
                        element.style.opacity = '0';
                    });
                }
                initAudio();
                counting();
                enterPressed = true;
                gameArea.classList.toggle('hidden-cursor');
                playMusic();
                playStartSound();
                if (menuText) {
                    menuText.classList.add('small');
                }
                resetBall();
                resetPaddles();
                opacityChangeAllowed = false;
                gameArea.style.opacity = 1;
            }
            break;
        // WYCISZENIE MUZYKI
        case 'm':
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
            break;
    }
});

// Gdy klawisz nie jest wciśnięty - paletka się zatrzymuje
document.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'w':
        case 's':
            paddle1Speed = 0;
            break;
        case 'ArrowUp':
        case 'ArrowDown':
            paddle2Speed = 0;
            break;
    }
});

// Mechanizm gry
function update() {
    if (isPaused) {
        requestAnimationFrame(update);
        return;
    }

    paddle1Y += paddle1Speed;
    paddle2Y += paddle2Speed;

    if (paddle1Y < 0) {
        paddle1Y = 0;
    } else if (paddle1Y + paddle1.offsetHeight > gameArea.clientHeight) {
        paddle1Y = gameArea.clientHeight - paddle1.offsetHeight;
    }

    if (paddle2Y < 0) {
        paddle2Y = 0;
    } else if (paddle2Y + paddle2.offsetHeight > gameArea.clientHeight) {
        paddle2Y = gameArea.clientHeight - paddle2.offsetHeight;
    }

    paddle1.style.top = paddle1Y + 'px';
    paddle2.style.top = paddle2Y + 'px';

    const ballRect = ball.getBoundingClientRect();
    const paddle1Rect = paddle1.getBoundingClientRect();
    const paddle2Rect = paddle2.getBoundingClientRect();

    ball.style.left = (ball.offsetLeft + ballSpeedX) + 'px';
    ball.style.top = (ball.offsetTop + ballSpeedY) + 'px';

    // Kolizja ścian
    if (ball.offsetTop <= 0 || ball.offsetTop + ballRect.height >= gameArea.clientHeight) {
        ballSpeedY *= -1;
        playWallSound();
    }

    // Kolizja z paletkami
    if (
        ballRect.left <= paddle1Rect.right &&
        ballRect.top + ballRect.height >= paddle1Rect.top &&
        ballRect.top <= paddle1Rect.bottom
    ) {
        ballSpeedX = Math.abs(ballSpeedX);
        ballSpeedY = (Math.random() * 4) - 2;
        playPaddleSound();
    } else if (
        ballRect.right >= paddle2Rect.left &&
        ballRect.top + ballRect.height >= paddle2Rect.top &&
        ballRect.top <= paddle2Rect.bottom
    ) {
        ballSpeedX = -Math.abs(ballSpeedX);
        ballSpeedY = (Math.random() * 4) - 2;
        playPaddleSound();
    }

    // Zdobycie punktu
    if (ball.offsetLeft <= 0) {
        score2++;
        changeGoalColor('right');
        resetBall();
        playPointSound();
    } else if (ball.offsetLeft + ballRect.width >= gameArea.clientWidth) {
        score1++;
        changeGoalColor('left');
        resetBall();
        playPointSound();
    }

    score1Display.textContent = score1;
    score2Display.textContent = score2;

    // Sprawdzenie wyniku
    if (checkScore()) {
        isPaused = true;
        return;
    }

    requestAnimationFrame(update);
}

// Funkcja sprawdzająca wynik graczy
function checkScore() {
    if (settings.scoreLimit > 0) {
        if (score1 >= settings.scoreLimit) {
            displayWinner('1');
            return true;
        } else if (score2 >= settings.scoreLimit) {
            displayWinner('2');
            return true;
        }
    }
    return false;
}

// Funkcja wyświetlająca werdykt
function displayWinner(winner) {
    const winnerMessage = document.getElementById('winnerText');
    const winOverlay = document.getElementById('winOverlay');
    const finalScore = document.getElementById('finalScore');

    winnerMessage.textContent = `Gracz ${winner} wygrywa!`;
    finalScore.textContent = `${score1}:${score2}`;
    gameArea.classList.toggle('hidden-cursor', false);
    gameArea.style.opacity = 0.3;
    menuText.style.opacity = 0.3;
    winOverlay.style.display = true ? 'flex' : 'none';
    escapeAllowed = false;
    if (music) {
        music.pause();
        music.currentTime = 0;
        playWinSound();
    }
}

// Reset piłki na środek planszy
function resetBall() {
    const ballWidth = ball.offsetWidth;
    const ballHeight = ball.offsetHeight;
    ball.style.left = 'calc(50% - ' + (ballWidth / 2) + 'px)';
    ball.style.top = 'calc(50% - ' + (ballHeight / 2) + 'px)';
    ball.style.opacity = 1;
    ballSpeedX *= -1;
    ballSpeedY *= 1;
}

// Reset paletek na środek planszy
function resetPaddles() {
    paddle1.style.top = 'calc(' + (gameArea.offsetHeight / 2) + 'px - ' + (paddle1.offsetHeight / 2) + 'px)';
    paddle2.style.top = 'calc(' + (gameArea.offsetHeight / 2) + 'px - ' + (paddle2.offsetHeight / 2) + 'px)';
    paddle1Y = (gameArea.offsetHeight / 2) - (paddle1.offsetHeight / 2);
    paddle2Y = (gameArea.offsetHeight / 2) - (paddle2.offsetHeight / 2);
}

// Funkcja restartu gry
function restartGame() {
    resetPaddles();
    resetBall();

    score1 = 0;
    score2 = 0;
    score1Display.textContent = score1;
    score2Display.textContent = score2;

    pauseOverlay.style.display = 'none';
    gameArea.classList.add('hidden-cursor');

    for (const logo of logoElement) {
        logo.style.opacity = 1;
    }
}

// Przycisk do resetowania gry
restart.addEventListener('click', () => {
    gameArea.style.opacity = 1;
    resetFilter();
    restartGame();
    counting();
    logoElement.style.opacity = 1;
});

// Animacje kolorów bramek
function changeGoalColor(side) {
    if (side === 'right') {
        gameArea.style.borderLeftColor = 'red';
        gameArea.style.borderRightColor = 'green';
        score1Display.style.color = 'red';
        score2Display.style.color = 'green';
        paddle1.style.backgroundColor = 'red';
        paddle2.style.backgroundColor = 'green';
    } else if (side === 'left') {
        gameArea.style.borderLeftColor = 'green';
        gameArea.style.borderRightColor = 'red';
        score1Display.style.color = 'green';
        score2Display.style.color = 'red';
        paddle1.style.backgroundColor = 'green';
        paddle2.style.backgroundColor = 'red';
    }
    setTimeout(() => {
        gameArea.style.borderLeftColor = '';
        gameArea.style.borderRightColor = '';
        score1Display.style.color = '';
        score2Display.style.color = '';
        paddle1.style.backgroundColor = '';
        paddle2.style.backgroundColor = '';
    }, 1000);
}

// Funkcja odliczania
function counting() {
    let count = 3;
    countdownElement.style.display = 'block';
    countdownElement.textContent = count;
    escapeAllowed = false;
    menuOverlay.style.display = 'none';

    const interval = setInterval(() => {
        count--;
        if (count > 0) {
            countdownElement.textContent = count;
        } else {
            clearInterval(interval);
            countdownElement.style.display = 'none';
            isPaused = false;
            escapeAllowed = true;
            resetBall();
            resetPaddles();
        }
    }, 1000);
}

// Wywołanie gry
window.onload = function() {
    resetPaddles();
    update();
    menuOverlay.style.display = 'flex';
}
window.addEventListener('resize', resetPaddles);