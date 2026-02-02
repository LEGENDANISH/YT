const { Server } = require("socket.io")
const jwt = require("jsonwebtoken")

let io

const initializeWebSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: true, // allow all origins
      methods: ["GET", "POST"],
    },
  })

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token
    if (!token) return next(new Error("Authentication error"))

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      socket.userId = decoded.id
      next()
    } catch (err) {
      next(new Error("Authentication error"))
    }
  })

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.userId}`)
    socket.join(`user:${socket.userId}`)

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.userId}`)
    })
  })

  return io
}

const emitToUser = (userId, event, data) => {
  if (!io) return
  io.to(`user:${userId}`).emit(event, data)
}

const emitVideoUpdate = (userId, videoId, data) => {
  emitToUser(userId, "video:update", { videoId, ...data })
}

module.exports = {
  initializeWebSocket,
  emitToUser,
  emitVideoUpdate,
}
