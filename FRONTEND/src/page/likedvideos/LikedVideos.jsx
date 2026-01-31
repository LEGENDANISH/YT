import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

import Topbar from "../home/components/Topbar"
import Sidebar from "../home/Sidebar"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

const API_BASE = `http://localhost:${import.meta.env.VITE_BACKEND_PORT}/api`

const LikedVideos = () => {
  const token = localStorage.getItem("token")
  const navigate = useNavigate()

  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const toggleDarkMode = () => setDarkMode(prev => !prev)

  /* ---------- FETCH LIKED VIDEOS ---------- */
  const fetchLikedVideos = async () => {
    try {
      setLoading(true)

      const res = await axios.get(`${API_BASE}/videos/likedvideos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setVideos(res.data.data || [])
    } catch (err) {
      console.error("Failed to fetch liked videos:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLikedVideos()
  }, [])

  /* ---------- REMOVE LIKE ---------- */
  const removeLike = async (videoId) => {
    try {
      await axios.delete(`${API_BASE}/videos/like/${videoId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setVideos(prev => prev.filter(v => v.videoId !== videoId))
    } catch (err) {
      console.error("Failed to remove like:", err)
    }
  }

  /* ---------- LOADING UI ---------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 text-black dark:text-white">
        <Topbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <div className="pt-14 flex">
          <Sidebar sidebarOpen={sidebarOpen} />
          <main className={`flex-1 px-6 py-6 ${sidebarOpen ? "ml-56" : "ml-16"}`}>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-black dark:text-white">

      <Topbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      <div className="pt-14 flex">
        <Sidebar sidebarOpen={sidebarOpen} />

        <main className={`flex-1 px-6 py-6 ${sidebarOpen ? "ml-56" : "ml-16"}`}>
          <h1 className="text-2xl font-bold mb-6">Liked Videos</h1>

          {videos.length === 0 ? (
            <p className="text-gray-500">No liked videos yet.</p>
          ) : (
            <div className="space-y-4">
              {videos.map(({ video }) => (
                <Card key={video.id} className="hover:bg-gray-50 dark:hover:bg-zinc-900 transition cursor-pointer">
                  <CardContent className="flex gap-4 p-4">

                    <img
                      src={video.thumbnailUrl || "https://via.placeholder.com/160x90"}
                      alt={video.title}
                      className="w-40 h-24 object-cover rounded-lg"
                      onClick={() => navigate(`/videos/${video.id}`)}
                    />

                    <div className="flex-1">
                      <h3
                        onClick={() => navigate(`/videos/${video.id}`)}
                        className="font-semibold text-lg hover:underline"
                      >
                        {video.title}
                      </h3>

                      <p className="text-sm text-gray-500 mt-1">
                        {video.user?.username}
                      </p>
                    </div>

                    <Button
                      variant="destructive"
                      onClick={() => removeLike(video.id)}
                    >
                      Remove
                    </Button>

                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default LikedVideos
