let peerConnection;
const config = {
    iceServers: [
        {
            urls: 'turn:numb.viagenie.ca',
            credential: 'muazkh',
            username: 'webrtc@live.com'
        }
    ]
}

const socket = io()

const video = document.querySelector("video")

socket.on("offer", (id,description) => {
    peerConnection = new RTCPeerConnection(config)
    peerConnection
    .setRemoteDescription(description)
    .then(() => peerConnection.createAnswer())
    .then(sdp => peerConnection.setLocalDescription(sdp))
    .then(() => {
        socket.emit("answer",id,peerConnection.localDescription)
    });
    peerConnection.ontrack = event => {
        if (!video.srcObject) {
            video.srcObject = new MediaStream(); // Create a new MediaStream object
        }
        // Add the incoming track to the video stream
        video.srcObject.addTrack(event.track);
    }
    peerConnection.onicecandidate = event => {
        if(event.candidate) {
            socket.emit('candidate',id,event.candidate)
        }
    }
})

socket.on("candidate",(id,candidate) => {
    peerConnection
    .addIceCandidate(new RTCIceCandidate(candidate))
    .catch(e => {
        console.log(e)
    })
})

socket.on("connect",() => {
    socket.emit("watcher")
})
socket.on("broadcaster",() => {
    socket.emit("watcher")
})

window.addEventListener("beforeunload", () => {
    socket.close();
    peerConnection.close();
});