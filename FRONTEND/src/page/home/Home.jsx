import axios from "axios"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import VideoCard from "./VideoCard"

const PORT = import.meta.env.VITE_BACKEND_PORT
const BASE_URL = `http://localhost:${PORT}`

const Home = () => {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHomeFeed = async () => {
      try {
        const token = localStorage.getItem("token")

        const res = await axios.get(`${BASE_URL}/home`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        setVideos(res.data?.videos || [])
      } catch (err) {
        console.error("Failed to load home feed", err)
      } finally {
        setLoading(false)
      }
    }

    fetchHomeFeed()
  }, [])

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside className="hidden md:block w-56 border-r px-4 py-6">
        <nav className="space-y-4 text-sm font-medium">
          <p className="cursor-pointer">Home</p>
          <p className="cursor-pointer">Trending</p>
          <p className="cursor-pointer">Subscriptions</p>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 px-6 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-56 w-full rounded-xl"
                />
              ))
            : videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
        </div>
      </main>
    </div>
  )
}

export default Home
  