    import { useParams, Link } from "react-router-dom"
    import { useEffect, useRef, useState } from "react"
    import axios from "axios"
    import { 
      ThumbsUp, 
      ThumbsDown, 
      Share2, 
      ChevronDown,
      ChevronUp
    } from "lucide-react"

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
      
      const [liked, setLiked] = useState(false)
      const [disliked, setDisliked] = useState(false)
      const [showFullDescription, setShowFullDescription] = useState(false)
      const [subscribed, setSubscribed] = useState(false)

      const [subscriberCount, setSubscriberCount] = useState(0)
const [channelId, setChannelId] = useState(null)




      // ✅ View tracking refs
      const watchStartRef = useRef(null)
      const sentViewRef = useRef(false)
      const viewIntervalRef = useRef(null)

      /* ---------- FETCH VIDEO ---------- */
      useEffect(() => {
        if (!id) return

        
const load = async () => {
  try {
    setLoading(true);

    const [videoRes, streamRes, recRes, likeRes] = await Promise.all([
      axios.get(`${API_BASE}/videos/${id}`),
      axios.get(`${API_BASE}/videos/stream/${id}`),
      axios.get(`${API_BASE}/videos/${id}/recommend`),
      token
        ? axios.get(`${API_BASE}/videos/${id}/likes`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        : Promise.resolve(null),
    ]);

    const videoData = videoRes.data.video ?? videoRes.data;

    setVideo({
      ...videoData,
      likes: likeRes?.data?.totalLikes ?? videoData.likes,
    });

    setLiked(likeRes?.data?.likedByUser || false);
    setStreamUrl(streamRes.data.streamUrl);
    setRelated(recRes.data.videos ?? recRes.data ?? []);

    // ✅ Subscription logic MUST be inside try
    const channelIdFromVideo = videoData.user?.id;
    setChannelId(channelIdFromVideo);

    if (channelIdFromVideo) {
      const [subCountRes, subCheckRes] = await Promise.all([
        axios.get(`${API_BASE}/subscribers/${channelIdFromVideo}`),
        token
          ? axios.get(`${API_BASE}/subscribe/check/${channelIdFromVideo}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
          : Promise.resolve(null),
      ]);

      setSubscriberCount(subCountRes.data.subscribers || 0);
      setSubscribed(subCheckRes?.data?.subscribed || false);
    }

  } catch (err) {
    console.error("Watch load failed:", err);
    setVideo(null);
  } finally {
    setLoading(false);
  }
};






        load()

        // Reset view tracking when video changes
        return () => {
          sentViewRef.current = false
          watchStartRef.current = null
          if (viewIntervalRef.current) {
            clearInterval(viewIntervalRef.current)
          }
        }
      }, [id])

      /* ---------- SEND VIEW ---------- */
      const sendView = async (duration) => {
        if (sentViewRef.current || !token) {
          console.log("⏭️ View already sent or no token")
          return
        }

        console.log(`📤 Sending view: ${duration}s`)
        sentViewRef.current = true

        try {
          const response = await axios.post(
            `${API_BASE}/videos/${id}/view`,
            { watchDuration: duration },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
          console.log("✅ View response:", response.data)
        } catch (err) {
          console.error("❌ Failed to record view:", err.response?.data || err.message)
          sentViewRef.current = false // Reset on error
        }
      }

      /* ---------- CALCULATE WATCH DURATION ---------- */
      const getWatchDuration = () => {
        if (!watchStartRef.current) return 0
        return Math.floor((Date.now() - watchStartRef.current) / 1000)
      }

      const handleCreateClick = () => {
        console.log("Create clicked")
      }

      const toggleDarkMode = () => {
        setDarkMode(prev => !prev)
      }

 const refreshVideoLikes = async () => {
  try {
    const res = await axios.get(`${API_BASE}/videos/${id}/likes`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setLiked(res.data.likedByUser);
    setVideo(prev => ({
      ...prev,
      likes: res.data.totalLikes,
    }));

  } catch (err) {
    console.error("Failed to refresh likes:", err);
  }
};




  const handleLike = async () => {
    if (!token) {
      alert("Please login first");
      return;
    }

    try {
      if (liked) {
        await axios.delete(`${API_BASE}/videos/like/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setLiked(false);
        setVideo(prev => ({
          ...prev,
          likes: Math.max((prev.likes || 1) - 1, 0),
        }));

      } else {
        await axios.post(
          `${API_BASE}/videos/like/${id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setLiked(true);
        setDisliked(false);
        setVideo(prev => ({
          ...prev,
          likes: (prev.likes || 0) + 1,
        }));
      }
await refreshVideoLikes();

    } catch (err) {
      console.error("Like action failed:", err);
    }
  };



      const handleDislike = () => {
        if (disliked) {
          setDisliked(false)
        } else {
          setDisliked(true)
          setLiked(false)
        }
      }

      const handleShare = () => {
        navigator.clipboard.writeText(window.location.href)
        alert("Link copied to clipboard!")
      }

  const handleSubscribe = async () => {
  if (!token || !channelId) {
    alert("Please login first");
    return;
  }

  try {
    if (subscribed) {
      await axios.delete(`${API_BASE}/subscribe/${channelId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSubscribed(false);
      setSubscriberCount(prev => Math.max(prev - 1, 0));

    } else {
      await axios.post(
        `${API_BASE}/subscribe/${channelId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSubscribed(true);
      setSubscriberCount(prev => prev + 1);
    }

  } catch (err) {
    console.error("Subscription action failed:", err);
  }
};


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
            <Topbar
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
              handleCreateClick={handleCreateClick}
            />
            <div className="pt-14 flex">
              <Sidebar sidebarOpen={sidebarOpen} />
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
            <Topbar
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
              handleCreateClick={handleCreateClick}
            />
            <div className="pt-14 flex">
              <Sidebar sidebarOpen={sidebarOpen} />
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

          <Topbar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
            handleCreateClick={handleCreateClick}
          />

          <div className="pt-14 flex">
            <Sidebar sidebarOpen={sidebarOpen} />

            <main
              className={`
                flex-1 transition-all duration-300
                ${sidebarOpen ? "ml-56" : "ml-16"}
                px-4 md:px-6 py-6
              `}
            >
              <div className="max-w-[1754px] mx-auto">
                <div className="grid grid-cols-1 xl:grid-cols-[1fr_402px] gap-6">

                  <div className="space-y-3">
                    
                    {/* VIDEO PLAYER */}
                    <div className="w-full">
                      {streamUrl ? (
                        <HlsPlayer
                          src={streamUrl}
                          onPlay={() => {
                            console.log("▶️ Video started playing")
                            watchStartRef.current = Date.now()
                            
                            // Set up interval to send view after 20 seconds
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
                            
                            if (duration >= 20) {
                              sendView(duration)
                            }
                          }}
                          onEnded={() => {
                            console.log("🏁 Video ended")
                            
                            if (viewIntervalRef.current) {
                              clearTimeout(viewIntervalRef.current)
                            }

                            const duration = getWatchDuration()
                            console.log(`🏁 End duration: ${duration}s`)
                            sendView(duration)
                          }}
                        />
                      ) : (
                        <div className="aspect-video bg-black rounded-xl flex items-center justify-center">
                          <span className="text-white">Stream unavailable</span>
                        </div>
                      )}
                    </div>

                    <h1 className="text-xl font-semibold leading-tight pr-6">
                      {video.title}
                    </h1>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                          {video.user?.username ? video.user.username[0].toUpperCase() : 'U'}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">
                            {video.user?.username || 'Unknown'}
                          </span>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
{formatViews(subscriberCount)} subscribers
                          </span>
                        </div>
                        <button
                          onClick={handleSubscribe}
                          className={`ml-4 px-4 py-2 rounded-full font-medium text-sm transition-all ${
                            subscribed
                              ? 'bg-gray-200 dark:bg-zinc-800 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-zinc-700'
                              : 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200'
                          }`}
                        >
                          {subscribed ? 'Subscribed' : 'Subscribe'}
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        
                        <div className="flex items-center bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <button
                            onClick={handleLike}
                            className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors ${
                              liked ? 'text-blue-600' : ''
                            }`}
                          >
                            <ThumbsUp className="w-5 h-5" fill={liked ? 'currentColor' : 'none'} />
  <span className="text-sm font-medium">
  {formatViews(video.likes || 0)}
  </span>
                          </button>
                          <div className="w-px h-6 bg-gray-300 dark:bg-zinc-700"></div>
                          <button
                            onClick={handleDislike}
                            className={`px-4 py-2 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors ${
                              disliked ? 'text-blue-600' : ''
                            }`}
                          >
                            <ThumbsDown className="w-5 h-5" fill={disliked ? 'currentColor' : 'none'} />
                          </button>
                        </div>

                        <button
                          onClick={handleShare}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-full transition-colors"
                        >
                          <Share2 className="w-5 h-5" />
                          <span className="text-sm font-medium">Share</span>
                        </button>
                      </div>
                    </div>

                    <div className="bg-gray-100 dark:bg-zinc-800 rounded-xl p-3">
                      <div className="flex items-center gap-2 text-sm font-semibold mb-1">
                        <span>{formatViews(video.views || 0)} views</span>
                        <span>•</span>
                        <span>{formatDate(video.createdAt)}</span>
                      </div>
                      
                      {video.description && (
                        <div className="text-sm">
                          <p className={`whitespace-pre-wrap ${!showFullDescription ? 'line-clamp-2' : ''}`}>
                            {video.description}
                          </p>
                          {video.description.length > 100 && (
                            <button
                              onClick={() => setShowFullDescription(prev => !prev)}
                              className="flex items-center gap-1 font-semibold mt-2 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                              {showFullDescription ? (
                                <>
                                  Show less <ChevronUp className="w-4 h-4" />
                                </>
                              ) : (
                                <>
                                  ...more <ChevronDown className="w-4 h-4" />
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-6">
                      <div className="flex items-center gap-4 mb-6">
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
                  <div className="space-y-2">
                    {related.length > 0 ? (
                      related.map(v => (
                        <Link
                          key={v.id}
                          to={`/videos/${v.id}`}
                          className="flex gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors group"
                        >
                          <div className="relative flex-shrink-0">
                            <img
                              src={v.thumbnailUrl || 'https://via.placeholder.com/168x94/333/666?text=No+Thumbnail'}
                              alt={v.title}
                              className="w-[168px] h-[94px] rounded-lg object-cover"
                            />
                            {v.duration && (
                              <span className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1 rounded">
                                {v.duration}
                              </span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-gray-700 dark:group-hover:text-gray-300">
                              {v.title}
                            </h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">
                              {v.user?.username || 'Unknown Channel'}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                              <span>{formatViews(v.views || 0)} views</span>
                              <span>•</span>
                              <span>{formatDate(v.createdAt)}</span>
                            </div>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No recommendations available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      )
    }

    export default Watch