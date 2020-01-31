const id = '_' + Math.random().toString(36).substr(2, 9);
const video = document.getElementById('webcam');
const socket = io.connect();
var peerConnection = null;

var userMediaOptions = userMediaOptions = {
    audio: false,
    video: {
        width: {
            min: 1280,
            max: 1920
        },
        height: {
            min: 720,
            max: 1080
        },
        facingMode: 'environment' // To use the rear camera on mobile
    }
}

navigator.mediaDevices.getUserMedia(userMediaOptions)
    .then(function(stream) {
        video.srcObject = stream;
        video.play();
        connectPeer(stream);
    });

function connectPeer(stream) {
    if (peerConnection) {
        // Close a currently open connection
        disconnectServer();
        peerConnection.close();
        peerConnection = null;
    }

    peerConnection = new RTCPeerConnection();
    peerConnection.addTrack(stream.getTracks()[0], stream);
    peerConnection.createOffer({
            offerToReceiveVideo: true
        })
        .then(sdp => peerConnection.setLocalDescription(sdp))
        .then(function() {
            socket.emit('offer', {
                id: id,
                message: peerConnection.localDescription
            });
        });

    peerConnection.onicecandidate = function(event) {
        if (event.candidate) {
            socket.emit('candidate', {
                id: id,
                candidate: event.candidate
            });
        }
    };
}

socket.on('answer', function(data) {
    if ((data.id == id) && peerConnection) {
        peerConnection.setRemoteDescription(data.message);
    }
});

socket.on('candidate', function(data) {
    if ((data.id == id) && peerConnection) {
        peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate))
            .catch(function(e) {
                console.error(e);
            });
    }
});

function disconnectServer() {
    socket.emit('bye', {
        id: id
    });
}

window.addEventListener("beforeunload", disconnectServer, false); // For everywhere else
window.addEventListener("pagehide", disconnectServer, false); // For iPhone, mobile