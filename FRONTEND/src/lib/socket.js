import { io } from "socket.io-client"

const SOCKET_URL = "http://localhost:8000"

export const socket = io(SOCKET_URL, {
  autoConnect: false,          // 🔴 IMPORTANT: prevent early connect
  transports: ["polling", "websocket"],
})

/**
 * Connect socket with JWT
 * Call this AFTER token exists
 */
export const connectSocket = () => {
  const token = localStorage.getItem("token")
  if (!token) {
    console.warn("Socket not connected: token missing")
    return
  }

  // attach token BEFORE connecting
  socket.auth = { token }

  if (!socket.connected) {
    socket.connect()
    console.log("Socket connecting with token...")
  }
}

/**
 * Disconnect socket safely
 */
export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect()
    console.log("Socket disconnected")
  }
}