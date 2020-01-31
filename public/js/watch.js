const videos = document.getElementById('videos');
const socket = io.connect();
var connections = [];

socket.on('offer', function(data) {
    var connection = new RTCPeerConnection();
    var connectionData = {
        id: data.id,
        connection: connection
    };

    connection.setRemoteDescription(data.message)
        .then(() => connection.createAnswer())
        .then(sdp => connection.setLocalDescription(sdp))
        .then(function() {
            socket.emit('answer', {
                id: connectionData.id,
                message: connection.localDescription
            });
        });

    connection.onicecandidate = function(event) {
        if (event.candidate) {
            socket.emit('candidate', {
                id: connectionData.id,
                candidate: event.candidate
            });
        }
    };

    connection.ontrack = function(event) {
        addVideo(event.streams[0]);
    };

    connection.onconnectionstatechange = function(event) {
        switch (connection.connectionState) {
            case 'connected':
                console.log('CONNECTED', connectionData.id);
                break;
            case 'disconnected':
                console.log('DISCONNECTED', connectionData.id);
                deleteVideo(connectionData.id);
                break;
            case 'failed':
                console.log('FAILED', connectionData.id);
                break;
            case 'closed':
                console.log('CLOSED', connectionData.id);
                break;
        }
    };

    connections.push(connectionData);
});

socket.on('candidate', function(data) {
    connections.forEach(function(peer) {;
        if (peer.id == data.id) {
            peer.connection.addIceCandidate(new RTCIceCandidate(data.candidate))
                .catch(function(e) {
                    console.error(e);
                });
        }
    });
});

socket.on('bye', function(data) {
    deleteVideo(data.id);
});

function addVideo(stream) {
    var video = document.createElement('video');
    video.srcObject = stream;
    video.autoplay = true;
    video.muted = true;
    video.controls = true;
    // video.width = '100%';
    // video.height = '100%';
    videos.appendChild(video);
    video.play();
}

function deleteVideo(id) {
    connections.forEach(function(peer, index) {;
        if (peer.id == id) {
            peer.connection.close();
            peer.connection = null;
            connections.splice(index, 1);
            videos.removeChild(videos.childNodes[index]);
        }
    });
}