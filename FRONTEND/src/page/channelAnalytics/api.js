import axios from "axios"

const API = axios.create({
  baseURL: "http://localhost:8000/api"
})

// 🔐 Attach token automatically to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 👤 Get current user information
export const getAboutMe = () => {
  return API.get("/aboutme")
}

// 📹 Get all uploaded videos
export const getMyVideos = () => {
  return API.get("/my-videos")
}

// 📊 Get analytics for a single video
export const getVideoAnalytics = (videoId) => {
  return API.get(`/analytics/video/${videoId}`)
}

export default API