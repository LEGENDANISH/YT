import { useParams } from "react-router-dom"
import { useEffect, useRef, useState } from "react"
import axios from "axios"
import HlsPlayer from "./HlsPlayer"
import VideoMeta from "./VideoMeta"
import RelatedVideos from "./RelatedVideos"
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
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`
    }
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
          <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-56" : "ml-16"} px-4 md:px-6 py-6`}>
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
          <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-56" : "ml-16"} px-4 md:px-6 py-6`}>
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
        <main
          className={`
            flex-1 transition-all duration-300
            ${sidebarOpen ? "ml-16" : "ml-16"}
            px-4 md:px-6 py-6
          `}
        >
          <div className="max-w-[1680px] mx-auto">
            <div className="grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_400px] gap-6">
              <div className="space-y-2">
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
                          
                          // Set up timeout to send initial view after 20 seconds
                          viewIntervalRef.current = setTimeout(() => {
                            const duration = getWatchDuration()
                            console.log(`⏰ 20 seconds reached, duration: ${duration}s`)
                            sendView(duration)
                          }, 20000)
                        }}
                        onPause={() => {
                          console.log("⏸️ Video paused")
                          
                          // Clear the timeout if user pauses before 20s
                          if (viewIntervalRef.current) {
                            clearTimeout(viewIntervalRef.current)
                          }

                          const duration = getWatchDuration()
                          console.log(`⏸️ Pause duration: ${duration}s`)
                          
                          // Send watch time update on pause
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
                          
                          // Send final watch time on video end
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

                <div className="pt-6">
                  <div className="flex items-center gap-4 ">
                    <h2 className="text-xl font-semibold">
                      {video.comments || 0} Comments
                    </h2>
                  </div>
                  <div className="text-center py-8 text-gray-500">
                    Comments section coming soon...
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN - RECOMMENDED */}
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