const path = require('path');
const express = require('express');
const app = express();
const server = require('http').Server(app);
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

server.listen(process.env.PORT || 3000);