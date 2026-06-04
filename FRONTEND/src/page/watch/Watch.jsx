import { useParams } from "react-router-dom"
import { useEffect, useRef, useState } from "react"
import axios from "axios"
import HlsPlayer from "./HlsPlayer"
import VideoMeta from "./VideoMeta"
import RelatedVideos from "./RelatedVideos"
import CommentSection from "./CommentSection"
import { useVideoData } from "./data/userVideoData"
import { useViewTracking } from "./data/useViewTracker"
import { useVideoActions } from "./data/uservideeoAction"

const API_BASE = `http://localhost:${import.meta.env.VITE_BACKEND_PORT}/api`

const Watch = () => {
  const { id } = useParams()
  const token = localStorage.getItem("token")

  const [darkMode, setDarkMode] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showFullDescription, setShowFullDescription] = useState(false)

  // Decode JWT token directly — no API call needed
  const currentUser = (() => {
    if (!token) return null
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      return {
        id: payload.id || payload.userId || payload.sub,
        username: payload.username,
        displayName: payload.displayName || payload.username,
        avatarUrl: payload.avatarUrl || null,
      }
    } catch {
      return null
    }
  })()

  // Custom hooks
  const {
    video,
    setVideo,
    streamUrl,
    related,
    loading,
    liked,
    setLiked,
    disliked,
    setDisliked,
    subscribed,
    setSubscribed,
    subscriberCount,
    setSubscriberCount,
    channelId,
  } = useVideoData(id, token, API_BASE)

  const { watchStartRef, sentViewRef, viewIntervalRef, sendView, sendWatchTimeUpdate, getWatchDuration } =
    useViewTracking(id, token, API_BASE)

  const { handleLike, handleDislike, handleShare, handleSubscribe } = useVideoActions(
    id,
    token,
    API_BASE,
    liked,
    setLiked,
    disliked,
    setDisliked,
    subscribed,
    setSubscribed,
    subscriberCount,
    setSubscriberCount,
    channelId,
    video,
    setVideo
  )

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev)
  }

  const formatViews = (views) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`
    return views
  }

  const formatDate = (date) => {
    if (!date) return ""
    const d = new Date(date)
    const now = new Date()
    const diffTime = Math.abs(now - d)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 text-black dark:text-white">
        <div className="pt-14 flex">
          {/* On mobile sidebar is overlay so no margin; on md+ use ml-16 */}
          <main className="flex-1 md:ml-16 px-4 md:px-6 py-6">
            <div className="animate-pulse space-y-4">
              <div className="aspect-video bg-gray-300 dark:bg-zinc-800 rounded-xl"></div>
              <div className="h-8 bg-gray-300 dark:bg-zinc-800 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 dark:bg-zinc-800 rounded w-1/4"></div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 text-black dark:text-white">
        <div className="pt-14 flex">
          <main className="flex-1 md:ml-16 px-4 md:px-6 py-6">
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold mb-2">Video not found</h2>
              <p className="text-gray-500">This video may have been removed or is unavailable</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-black dark:text-white">
      <div className="pt-14 flex">
        {/*
          Mobile:  sidebar is a fixed overlay → no left margin (ml-0)
          md+:     sidebar is always at least w-16 → ml-16
        */}
        <main className="flex-1 md:ml-16 px-4 md:px-6 py-6">
          <div className="max-w-[1680px] mx-auto">
            {/* Grid: single column on mobile/tablet, two columns on xl+ */}
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_400px] gap-6">
              
              {/* LEFT COLUMN — player + meta + comments */}
              <div className="space-y-2 min-w-0">
                {/* VIDEO PLAYER */}
                <div className="w-full">
                  {streamUrl ? (
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
                      <HlsPlayer
                        src={streamUrl}
                        onPlay={() => {
                          console.log("▶️ Video started playing")
                          if (!watchStartRef.current) {
                            watchStartRef.current = Date.now()
                          }
                          viewIntervalRef.current = setTimeout(() => {
                            const duration = getWatchDuration()
                            console.log(`⏰ 20 seconds reached, duration: ${duration}s`)
                            sendView(duration)
                          }, 20000)
                        }}
                        onPause={() => {
                          console.log("⏸️ Video paused")
                          if (viewIntervalRef.current) {
                            clearTimeout(viewIntervalRef.current)
                          }
                          const duration = getWatchDuration()
                          console.log(`⏸️ Pause duration: ${duration}s`)
                          if (duration >= 20) {
                            sendWatchTimeUpdate(duration, true)
                          }
                        }}
                        onEnded={() => {
                          console.log("🏁 Video ended")
                          if (viewIntervalRef.current) {
                            clearTimeout(viewIntervalRef.current)
                          }
                          const duration = getWatchDuration()
                          console.log(`🏁 End duration: ${duration}s`)
                          sendWatchTimeUpdate(duration, true)
                        }}
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-black rounded-xl flex items-center justify-center">
                      <span className="text-white">Stream unavailable</span>
                    </div>
                  )}
                </div>

                <VideoMeta
                  video={video}
                  channelId={channelId}
                  subscriberCount={subscriberCount}
                  subscribed={subscribed}
                  liked={liked}
                  disliked={disliked}
                  showFullDescription={showFullDescription}
                  setShowFullDescription={setShowFullDescription}
                  handleLike={handleLike}
                  handleDislike={handleDislike}
                  handleShare={handleShare}
                  handleSubscribe={handleSubscribe}
                  formatViews={formatViews}
                  formatDate={formatDate}
                />

                {/* COMMENT SECTION */}
                <CommentSection
                  videoId={id}
                  currentUser={currentUser}
                  token={token}
                  initialCount={video.comments || 0}
                />
              </div>

              {/* RIGHT COLUMN — related videos
                  On mobile/tablet it renders below; on xl+ it's a side column */}
              <RelatedVideos
                videos={related}
                formatViews={formatViews}
                formatDate={formatDate}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Watch