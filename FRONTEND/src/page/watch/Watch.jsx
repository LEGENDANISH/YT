import { useParams, Link } from "react-router-dom"
import { useEffect, useRef, useState } from "react"
import axios from "axios"

import Topbar from "../home/Topbar"
import Sidebar from "../home/Sidebar"
import HlsPlayer from "./HlsPlayer"

const API_BASE = `http://localhost:${import.meta.env.VITE_BACKEND_PORT}/api`

const Watch = () => {
  const { id } = useParams()
  const token = localStorage.getItem("token")

  const [video, setVideo] = useState(null)
  const [streamUrl, setStreamUrl] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)

  const [darkMode, setDarkMode] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const viewedRef = useRef(false)

  /* ---------- FETCH VIDEO ---------- */
  useEffect(() => {
    if (!id) return

    const load = async () => {
      try {
        setLoading(true)

        const [videoRes, streamRes, recRes] = await Promise.all([
          axios.get(`${API_BASE}/videos/${id}`),
          axios.get(`${API_BASE}/videos/stream/${id}`),
          axios.get(`${API_BASE}/videos/${id}/recommend`),
        ])

        setVideo(videoRes.data.video ?? videoRes.data)
        setStreamUrl(streamRes.data.streamUrl)
        setRelated(recRes.data.videos ?? recRes.data ?? [])
      } catch (err) {
        console.error("Watch load failed:", err)
        setVideo(null)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  /* ---------- RECORD VIEW (ONCE) ---------- */
  useEffect(() => {
    if (!id || !token || viewedRef.current) return
    viewedRef.current = true

    axios.post(
      `${API_BASE}/videos/${id}/view`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    ).catch(() => {})
  }, [id, token])

  const handleCreateClick = () => {
    console.log("Create clicked")
  }

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev)
  }

  if (loading) return <div className="p-6">Loading…</div>
  if (!video) return <div className="p-6">Video not found</div>

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-black dark:text-white">

      {/* 🔝 TOPBAR */}
      <Topbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        handleCreateClick={handleCreateClick}
      />

      {/* ⬇️ BODY */}
      <div className="pt-14 flex">

        {/* 📂 SIDEBAR */}
        <Sidebar sidebarOpen={sidebarOpen} />

        {/* ▶️ MAIN CONTENT */}
        <main
          className={`
            flex-1 transition-all duration-300
            ${sidebarOpen ? "ml-56" : "ml-16"}
            px-4 md:px-6 py-6
          `}
        >
          <div className="grid grid-cols-12 gap-6">

            {/* PLAYER */}
            <div className="col-span-12 lg:col-span-8 space-y-4">
              {streamUrl ? (
                <HlsPlayer src={streamUrl} />
              ) : (
                <div className="aspect-video bg-black flex items-center justify-center">
                  Stream unavailable
                </div>
              )}

              <h1 className="text-2xl font-bold">{video.title}</h1>

              <p className="text-sm text-gray-500">
                {video.views} views
              </p>

              {video.description && (
                <p className="whitespace-pre-wrap">
                  {video.description}
                </p>
              )}
            </div>

            {/* RECOMMENDED */}
            <div className="col-span-12 lg:col-span-4 space-y-3">
              <h2 className="font-semibold">Recommended</h2>

              {related.map(v => (
                <Link
                  key={v.id}
                  to={`/videos/${v.id}`}
                  className="flex gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800"
                >
                  <img
                    src={v.thumbnailUrl}
                    className="w-40 aspect-video rounded object-cover"
                  />
                  <div>
                    <p className="font-semibold text-sm line-clamp-2">
                      {v.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {v.views} views
                    </p>
                  </div>
                </Link>
              ))}
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}

export default Watch
