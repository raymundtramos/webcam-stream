const path = require('path');
const express = require('express');
const https = require('https');
const fs = require('fs');
const app = express();
var options = {
    key: fs.readFileSync('./cert/file.pem'),
    cert: fs.readFileSync('./cert/file.crt')
};
const server = https.createServer(options, app);
const io = require('socket.io')(server);

app.use(express.static(path.join(__dirname, '/public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/broadcast', (req, res) => {
    res.sendFile(path.join(__dirname, 'broadcast.html'));
});

app.get('/socket.io.js', (req, res) => {
    res.sendFile(path.join(__dirname, '/node_modules/socket.io-client/dist/socket.io.js'));
});

io.on('connection', (socket) => {
    socket.on('offer', (data) => {
        socket.broadcast.emit('offer', data);
    });

    socket.on('answer', (data) => {
        socket.broadcast.emit('answer', data);
    });

    socket.on('candidate', (data) => {
        socket.broadcast.emit('candidate', data);
    });

    socket.on('bye', (data) => {
        socket.broadcast.emit('bye', data);
    });
});

server.listen(3000);