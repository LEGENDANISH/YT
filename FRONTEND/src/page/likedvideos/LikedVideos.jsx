import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"

import Topbar from "../home/components/Topbar"
import Sidebar from "../home/Sidebar"
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
  useEffect(() => {
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

      setVideos(prev => prev.filter(v => v.video.id !== videoId))
    } catch (err) {
      console.error("Failed to remove like:", err)
    }
  }

  /* ---------- LOADING ---------- */
  if (loading) {
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
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-black dark:text-white">


      <div className=" flex">

        <main className={`flex-1 px-6 py-6 ${sidebarOpen ? "ml-16 " : "ml-16"}`}>
          {/* HEADER */}
          <div className="mb-6">
            <h1 className="text-xl font-semibold">Liked videos</h1>
            <p className="text-sm text-gray-500">Videos you’ve liked</p>
          </div>

          {/* EMPTY STATE */}
          {videos.length === 0 ? (
            <p className="text-gray-500">No liked videos yet.</p>
          ) : (
            <div className="space-y-2">
              {videos.map(({ video }) => (
                <div
                  key={video.id}
                  className="flex gap-4 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-900 transition cursor-pointer"
                >
                  {/* THUMBNAIL */}
                  <div
                    className="relative flex-shrink-0"
                    onClick={() => navigate(`/videos/${video.id}`)}
                  >
                    <img
                      src={video.thumbnailUrl || "https://via.placeholder.com/168x94"}
                      alt={video.title}
                      className="w-[168px] h-[94px] object-cover rounded-lg"
                    />
                  </div>

                  {/* INFO */}
                  <div className="flex-1 min-w-0">
                    <h3
                      onClick={() => navigate(`/videos/${video.id}`)}
                      className="font-semibold text-sm md:text-base leading-snug line-clamp-2 hover:underline"
                    >
                      {video.title}
                    </h3>

<Link
  to={`/channel/${video.user?.id}`}
  className="text-xs md:text-sm text-gray-500 mt-1 hover:underline"
>
  {video.user?.username || "Unknown Channel"}
</Link>
                  </div>

                  {/* REMOVE */}
                  <button
                    onClick={() => removeLike(video.id)}
                    className="text-sm text-gray-500 hover:text-red-500 px-3"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default LikedVideos
