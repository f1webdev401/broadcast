const express = require('express')
const app = express()
const http = require('http')
const cors = require('cors')
const port = 4000
let broadcaster;
app.use(cors())
const server = http.createServer(app)

const io = require('socket.io')(server)

app.use(express.static('public'))
app.get('/broadcast', (req, res) => {
    res.sendFile(__dirname + '/public/broadcast.html');
});
io.sockets.on("error",e => console.log(e))
io.sockets.on("connection",socket => {
    socket.on("broadcaster",() => {
        broadcaster = socket.id;
        socket.broadcast.emit("broadcaster")
    });
    socket.on("watcher",() => {
        socket.to(broadcaster).emit("watcher",socket.id)
    });
    socket.on("disconnect",() => {
        socket.to("broadcaster").emit("disconnectPeer",socket.id)
    });
    socket.on("offer",(id,message) => {
        socket.to(id).emit("offer",socket.id,message)
    });
    socket.on("answer",(id,message) => {
        socket.to(id).emit("answer",socket.id,message)
    });
    socket.on("candidate",(id,message) => {
        socket.to(id).emit("candidate",socket.id,message)
    })
})



server.listen(port, () => {
    console.log("running good")
})

