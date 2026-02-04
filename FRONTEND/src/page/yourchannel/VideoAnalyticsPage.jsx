import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import AnalyticsPanel from "./Analytics/AnalyticsPanel"

const API_BASE_URL = "http://localhost:8000/api"

const VideoAnalyticsPage = () => {
  const { videoId } = useParams()
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")

        const res = await fetch(
          `${API_BASE_URL}/analytics/video/${videoId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const data = await res.json()
        setAnalytics(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [videoId])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-neutral-800 border-t-neutral-400 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <AnalyticsPanel analytics={analytics} />
      </div>
    </div>
  )
}

export default VideoAnalyticsPage
