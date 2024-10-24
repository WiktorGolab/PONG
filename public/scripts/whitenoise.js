const canvas = document.getElementById('noiseCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const bars = [
    { height: canvas.height * 0.15, y: Math.random() * (canvas.height - (canvas.height * 0.3)), speed: 20, opacity: 0.3 },
    { height: canvas.height * 0.05, y: Math.random() * (canvas.height - (canvas.height * 0.15)), speed: 20, opacity: 0.3 }
];

// Funkcja do generowania białego szumu
function generateNoise() {
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const value = Math.random() * 255;
        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
        data[i + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);
}

// Funkcja do rysowania pasków
function drawBars() {
    bars.forEach(bar => {
        ctx.fillStyle = `rgba(255, 255, 255, ${bar.opacity})`;
        ctx.fillRect(0, bar.y, canvas.width, bar.height);
    });
}

// Funkcja do aktualizacji pozycji pasków
function updateBars() {
    bars.forEach(bar => {
        bar.y += (Math.random() - 0.5) * bar.speed * 2;

        if (bar.y < 0) {
            bar.y = 0;
        } else if (bar.y + bar.height > canvas.height) {
            bar.y = canvas.height - bar.height;
        }
    });
}

// Główna funkcja do rysowania
function draw() {
    generateNoise();
    updateBars();
    drawBars();
}

setInterval(draw, 100);
