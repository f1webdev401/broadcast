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
    .then(sdp => {
        peerConnection.setLocalDescription(sdp)
        socket.emit("answer",id,sdp)
    }
    )
   
    peerConnection.ontrack = event => {
        video.srcObject = event.streams[0]
        console.log(event.streams[0])
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