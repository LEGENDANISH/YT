import { useEffect, useState } from "react"
import { getMyVideos, getVideoAnalytics, getAboutMe } from "./api"
import TopBar from "./dashboardtopbar"
import VideoSelector from "./VideoSelector"
import AnalyticsOverview from "./AnalyticsScoreView"
import ViewsChart from "./ViewsChart"
import EngagementMetrics from "./Engagementmetrics"
import PerformanceInsights from "./Performanceinsights"

export default function AnalyticsDashboard() {
  const [user, setUser] = useState(null)
  const [videos, setVideos] = useState([])
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getAboutMe(),
      getMyVideos()
    ]).then(([userRes, videosRes]) => {
      setUser(userRes.data.data)
      const videoList = videosRes.data.videos || videosRes.data
      setVideos(videoList)
      if (videoList.length > 0) {
        setSelectedVideo(videoList[0])
      }
      setLoading(false)
    }).catch(err => {
      console.error("Error loading data:", err)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!selectedVideo) return
    
    setLoading(true)
    getVideoAnalytics(selectedVideo.id).then(res => {
      setAnalytics(res.data)
      setLoading(false)
    }).catch(err => {
      console.error("Error loading analytics:", err)
      setLoading(false)
    })
  }, [selectedVideo])

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <TopBar user={user} />
      
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track your video performance and audience insights</p>
        </div>

        {/* Video Selector */}
        <div className="mb-6 sm:mb-8">
          <VideoSelector
            videos={videos}
            selected={selectedVideo}
            onSelect={setSelectedVideo}
          />
        </div>

        {/* Analytics Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-pulse text-muted-foreground">Loading analytics...</div>
          </div>
        ) : analytics ? (
          <div className="space-y-6">
            {/* Overview Cards */}
            <AnalyticsOverview analytics={analytics} />

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ViewsChart analytics={analytics} />
              <EngagementMetrics analytics={analytics} />
            </div>

            {/* Performance Insights */}
            <PerformanceInsights analytics={analytics} video={selectedVideo} />
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            No analytics data available
          </div>
        )}
      </main>
    </div>
  )
}