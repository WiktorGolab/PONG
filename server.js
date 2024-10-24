const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const net = require('net');

const app = express();
const PORT = process.env.PORT || 8000;

// Użyj body-parser do obsługi JSON
app.use(bodyParser.json());

// Włącz serwowanie plików statycznych z katalogu 'public'
app.use(express.static('public'));

// Endpoint do zapisywania ustawień
app.post('/save-settings', (req, res) => {
    const settings = req.body;

    // Ścieżka do zapisu pliku
    const filePath = path.join(__dirname, 'settings.json');

    // Zapisz plik
    fs.writeFile(filePath, JSON.stringify(settings, null, 2), (err) => {
        if (err) {
            return res.status(500).send('Błąd podczas zapisywania ustawień.');
        }
        res.send('Ustawienia zostały zapisane pomyślnie.');
    });
});

// Endpoint do pobierania ustawień
app.get('/settings', (req, res) => {
    const filePath = path.join(__dirname, 'settings.json');
    res.sendFile(filePath);
});

// Funkcja do sprawdzania, czy port jest zajęty
const isPortInUse = (port, callback) => {
    const server = net.createServer();
    server.unref();
    server.on('error', () => callback(true)); // Jeśli port jest zajęty, zwróć true
    server.listen(port, () => {
        server.close(() => callback(false)); // Jeśli udało się nasłuchiwać, port jest wolny
    });
};

// Sprawdź, czy port jest zajęty i uruchom serwer
isPortInUse(PORT, async (inUse) => {
    if (inUse) {
        console.error(`Przerwano. Port ${PORT} jest już aktywny.`);
        console.error(`Wprowadź jakikolwiek klawisz, aby wyjść z terminalu.`);
        process.exit(1); // Zatrzymaj skrypt
    } else {
        app.listen(PORT, async () => {
            console.log(`Serwer PONG znajduje się pod linkiem: http://localhost:${PORT}`);
            // Otwórz stronę w domyślnej przeglądarce
            const { default: open } = await import('open');
            open(`http://localhost:${PORT}`);
        });
    }
});
