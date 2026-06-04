import { useEffect, useState } from "react"
import axios from "axios"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const API_BASE = `http://localhost:${import.meta.env.VITE_BACKEND_PORT}/api`

const Subscriptions = () => {
  const token = localStorage.getItem("token")

  const [channels, setChannels] = useState([])
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [channelRes, videoRes] = await Promise.all([
          axios.get(`${API_BASE}/subscriptions`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE}/subscriptions/videos`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])
        setChannels(channelRes.data.data || [])
        setVideos(videoRes.data.data || [])
      } catch (err) {
        console.error("Subscriptions load failed:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleUnsubscribe = async (channelId) => {
    try {
      await axios.delete(`${API_BASE}/subscribe/${channelId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setChannels(prev => prev.filter(c => c.id !== channelId))
      setVideos(prev => prev.filter(v => v.user.id !== channelId))
    } catch (err) {
      console.error("Unsubscribe failed:", err)
    }
  }

  if (loading) {
    return (
      <div className="pt-20 text-center text-gray-500">
        Loading subscriptions...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-black dark:text-white">
      <div className="flex pt-14">
        <main className="flex-1 px-4 md:px-6 py-6 md:ml-0">

          {/* -------- CHANNEL STRIP -------- */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Subscriptions</h2>

            <div
              className="flex items-center gap-4 overflow-x-auto pb-2"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {channels.slice(0, 8).map(channel => (
                <div key={channel.id} className="flex flex-col items-center flex-shrink-0">
                  <img
                    src={channel.avatarUrl || "https://via.placeholder.com/64"}
                    alt={channel.username}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <span className="text-xs mt-1 w-14 text-center truncate">{channel.username}</span>
                </div>
              ))}

              {channels.length > 8 && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-shrink-0">See All</Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[500px] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>All Subscriptions</DialogTitle>
                    </DialogHeader>
                    {channels.map(channel => (
                      <div
                        key={channel.id}
                        className="flex items-center justify-between py-2"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={channel.avatarUrl || "https://via.placeholder.com/40"}
                            alt={channel.username}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <span>{channel.username}</span>
                        </div>
                        <Button
                          variant="destructive"
                          onClick={() => handleUnsubscribe(channel.id)}
                        >
                          Unsubscribe
                        </Button>
                      </div>
                    ))}
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          {/* -------- VIDEO FEED -------- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map(video => (
              <Link key={video.id} to={`/videos/${video.id}`}>
                <div className="space-y-2 cursor-pointer group">
                  <div className="w-full aspect-video overflow-hidden rounded-xl bg-gray-200 dark:bg-zinc-800">
                    <img
                      src={video.thumbnailUrl || "https://via.placeholder.com/320"}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-gray-600">
                    {video.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {video.user.username}
                  </p>
                </div>
              </Link>
            ))}
          </div>

        </main>
      </div>
    </div>
  )
}

export default Subscriptions