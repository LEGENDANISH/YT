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
import { API_BASE_URL } from "../yourchannel/config"

const Watch = () => {
  const { id } = useParams()
  const token = localStorage.getItem("token")

  // Note: Dark mode is usually handled globally in Layout/App, 
  // but kept here if you need local control or if Layout doesn't handle it yet.
  const [darkMode, setDarkMode] = useState(true) 
  
  const [showFullDescription, setShowFullDescription] = useState(false)

  // Decode JWT token directly
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
  } = useVideoData(id, token, API_BASE_URL)

  const { 
    watchStartRef, 
    sentViewRef, 
    viewIntervalRef, 
    sendView, 
    sendWatchTimeUpdate, 
    getWatchDuration 
  } = useViewTracking(id, token, API_BASE_URL)

  const { 
    handleLike, 
    handleDislike, 
    handleShare, 
    handleSubscribe 
  } = useVideoActions(
    id,
    token,
    API_BASE_URL,
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

  // Helper Formatters
  const formatViews = (views) => {
    if (!views) return "0"
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`
    return views.toString()
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
      <div className="min-h-screen bg-white dark:bg-zinc-950 text-black dark:text-white transition-colors duration-300">
        <main className="pt-14 px-4 md:px-8 py-6 max-w-[1800px] mx-auto lg:ml-20 transition-all duration-300">
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] gap-8">
            <div className="space-y-4">
              <div className="aspect-video bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
              <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4 animate-pulse" />
              <div className="flex gap-4">
                 <div className="h-10 w-10 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
                 <div className="flex-1 space-y-2">
                    <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3 animate-pulse" />
                    <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4 animate-pulse" />
                 </div>
              </div>
            </div>
            <div className="hidden xl:block space-y-4">
               {[...Array(6)].map((_, i) => (
                 <div key={i} className="flex gap-2">
                   <div className="w-40 h-24 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
                   <div className="flex-1 space-y-2">
                     <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full animate-pulse" />
                     <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3 animate-pulse" />
                   </div>
                 </div>
               ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 text-black dark:text-white flex items-center justify-center pt-14">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-zinc-100">Video not found</h2>
          <p className="text-zinc-500">This video may have been removed or is unavailable</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-black dark:text-white transition-colors duration-300">
      
      {/* Main Content Area */}
      <main className="pt-0 px-4 md:px-8 py-2 max-w-[1800px] mx-auto lg:ml-20 transition-all duration-300">
        
        {/* Grid Layout: Single column on mobile/tablet, Side-by-side on XL */}
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] gap-8">
          
          {/* LEFT COLUMN — Player + Meta + Comments */}
          <div className="space-y-6 min-w-0">
            
            {/* VIDEO PLAYER */}
            <div className="w-full bg-black rounded-xl overflow-hidden shadow-lg aspect-video relative group">
              {streamUrl ? (
                <HlsPlayer
                  src={streamUrl}
                  onPlay={() => {
                    if (!watchStartRef.current) {
                      watchStartRef.current = Date.now()
                    }
                    // Reset interval if playing again
                    if (viewIntervalRef.current) clearTimeout(viewIntervalRef.current)
                    
                    viewIntervalRef.current = setTimeout(() => {
                      const duration = getWatchDuration()
                      sendView(duration)
                    }, 20000)
                  }}
                  onPause={() => {
                    if (viewIntervalRef.current) {
                      clearTimeout(viewIntervalRef.current)
                    }
                    const duration = getWatchDuration()
                    if (duration >= 20) {
                      sendWatchTimeUpdate(duration, true)
                    }
                  }}
                  onEnded={() => {
                    if (viewIntervalRef.current) {
                      clearTimeout(viewIntervalRef.current)
                    }
                    const duration = getWatchDuration()
                    sendWatchTimeUpdate(duration, true)
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-500">
                  Stream unavailable
                </div>
              )}
            </div>

            {/* VIDEO META DATA */}
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
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <CommentSection
                videoId={id}
                currentUser={currentUser}
                token={token}
                initialCount={video.comments || 0}
              />
            </div>
          </div>

          {/* RIGHT COLUMN — Related Videos */}
          <div className="xl:pl-4">
            <RelatedVideos
              videos={related}
              formatViews={formatViews}
              formatDate={formatDate}
            />
          </div>

        </div>
      </main>
    </div>
  )
}

export default Watch