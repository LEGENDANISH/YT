import { useEffect, useState } from "react"
import axios from "axios"
import { Link } from "react-router-dom"

import Topbar from "../home/Topbar"
import Sidebar from "../home/Sidebar"

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

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [darkMode, setDarkMode] = useState(true)

  const [channels, setChannels] = useState([])
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  const toggleDarkMode = () => setDarkMode(prev => !prev)

  /* ---------------- FETCH DATA ---------------- */
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

  /* ---------------- UNSUBSCRIBE ---------------- */
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
      <Topbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      <div className="pt-14 flex">
        <Sidebar sidebarOpen={sidebarOpen} />

        <main className={`flex-1 ${sidebarOpen ? "ml-56" : "ml-16"} px-6 py-6`}>

          {/* -------- CHANNEL STRIP -------- */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Subscriptions</h2>

            <div className="flex items-center gap-4 overflow-x-auto pb-2">
              {channels.slice(0, 8).map(channel => (
                <div key={channel.id} className="flex flex-col items-center">
                  <img
                    src={channel.avatarUrl || "https://via.placeholder.com/64"}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <span className="text-xs mt-1">{channel.username}</span>
                </div>
              ))}

              {channels.length > 8 && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">See All</Button>
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
                            className="w-10 h-10 rounded-full"
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
          <div className="grid md:grid-cols-3 gap-6">
            {videos.map(video => (
              <Link key={video.id} to={`/videos/${video.id}`}>
                <div className="space-y-2 cursor-pointer group">
                  <img
                    src={video.thumbnailUrl || "https://via.placeholder.com/320"}
                    className="rounded-xl w-full"
                  />

                  <h3 className="font-semibold line-clamp-2 group-hover:text-gray-600">
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
    