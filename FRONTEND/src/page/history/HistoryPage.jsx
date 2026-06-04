import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import axios from "axios"
import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

const API_BASE = "http://localhost:8000/api/feed/history"

const HistoryPage = () => {
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  const [history, setHistory] = useState([])
  const [page, setPage] = useState(1)
  const limit = 10
  const [loading, setLoading] = useState(false)

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${API_BASE}?page=${page}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setHistory(res.data.data || [])
    } catch (err) {
      console.error("Fetch history error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [page])

  const deleteOne = async (videoId) => {
    try {
      await axios.delete(`${API_BASE}/${videoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setHistory(prev => prev.filter(item => item.videoId !== videoId))
    } catch (err) {
      console.error("Delete error:", err)
    }
  }

  const clearAll = async () => {
    try {
      await axios.delete(API_BASE, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setHistory([])
    } catch (err) {
      console.error("Clear history error:", err)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 ml-15 text-black dark:text-white">
      <div className="flex pt-14">
        <main className="flex-1 px-4 md:px-6 py-6 md:ml-0">

          {/* HEADER */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold">Watch history</h1>
              <p className="text-sm text-gray-500">Videos you've watched</p>
            </div>
            <Button
              variant="ghost"
              className="text-red-500 hover:text-red-600"
              onClick={clearAll}
            >
              Clear all watch history
            </Button>
          </div>

          {/* LOADING */}
          {loading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <p className="text-gray-500">No watch history found.</p>
          ) : (
            <div className="space-y-2">
              {history.map((item) => {
                const video = item.video
                return (
                  <div
                    key={item.id}
                    className="flex gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-900 transition"
                  >
                    {/* THUMBNAIL */}
                    <div
                      className="relative flex-shrink-0 cursor-pointer"
                      onClick={() => navigate(`/videos/${video.id}`)}
                    >
                      <img
                        src={video.thumbnailUrl || "https://via.placeholder.com/168x94"}
                        alt={video.title}
                        className="w-40 h-24 object-cover rounded-lg"
                      />
                    </div>

                    {/* INFO */}
                    <div className="flex-1 min-w-0">
                      <h3
                        onClick={() => navigate(`/videos/${video.id}`)}
                        className="font-semibold text-sm leading-snug line-clamp-2 hover:underline cursor-pointer"
                      >
                        {video.title}
                      </h3>
                      <Link
                        to={`/channel/${video.user?.id}`}
                        className="block text-xs text-gray-500 mt-1 hover:underline"
                      >
                        {video.user?.displayName || "Unknown Channel"}
                      </Link>
                      <p className="text-xs text-gray-500 mt-1">
                        Watched on {new Date(item.watchedAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* DELETE */}
                    <button
                      onClick={() => deleteOne(item.videoId)}
                      className="text-gray-400 hover:text-red-500 px-2 flex-shrink-0"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {/* PAGINATION */}
          <div className="flex justify-center items-center gap-6 mt-8">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-500">Page {page}</span>
            <Button
              variant="outline"
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>

        </main>
      </div>
    </div>
  )
}

export default HistoryPage