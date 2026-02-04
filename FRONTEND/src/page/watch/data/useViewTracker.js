import { useEffect, useRef } from "react"
import axios from "axios"

export const useViewTracking = (id, token, API_BASE) => {
  const watchStartRef = useRef(null)
  const sentViewRef = useRef(false)
  const viewIntervalRef = useRef(null)
  const periodicUpdateIntervalRef = useRef(null)
  const lastSentDurationRef = useRef(0)

  const getWatchDuration = () => {
    if (!watchStartRef.current) return 0
    return Math.floor((Date.now() - watchStartRef.current) / 1000)
  }

  // Send watch time update to backend
  const sendWatchTimeUpdate = async (duration, force = false) => {
    // Don't send if no token, no duration, or already sent the same duration
    if (!token || duration === 0) {
      console.log("⏭️ Skipping update: no token or zero duration")
      return
    }

    // Only send if duration changed by at least 1 second (unless forced)
    if (!force && duration === lastSentDurationRef.current) {
      return
    }

    console.log(`📤 Sending watch time update: ${duration}s`)
    lastSentDurationRef.current = duration

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
      console.log("✅ Watch time updated:", response.data)
    } catch (err) {
      console.error("❌ Failed to update watch time:", err.response?.data || err.message)
    }
  }

  // Send initial view after 20 seconds
  const sendView = async (duration) => {
    if (sentViewRef.current || !token) {
      console.log("⏭️ View already sent or no token")
      return
    }

    console.log(`📤 Sending initial view: ${duration}s`)
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
      console.log("✅ Initial view recorded:", response.data)
      lastSentDurationRef.current = duration
    } catch (err) {
      console.error("❌ Failed to record view:", err.response?.data || err.message)
      sentViewRef.current = false
    }
  }

  // Send watch time when leaving page/tab
  const sendBeforeUnload = () => {
    const duration = getWatchDuration()
    if (duration > 0 && token && id) {
      console.log(`🚪 Sending final watch time on unload: ${duration}s`)
      
      // Use sendBeacon for reliable delivery when page is closing
      const data = JSON.stringify({ watchDuration: duration })
      const blob = new Blob([data], { type: 'application/json' })
      const sent = navigator.sendBeacon(
        `${API_BASE}/videos/${id}/view`,
        blob
      )
      
      // Fallback to synchronous XHR if sendBeacon fails
      if (!sent) {
        try {
          const xhr = new XMLHttpRequest()
          xhr.open('POST', `${API_BASE}/videos/${id}/view`, false) // synchronous
          xhr.setRequestHeader('Content-Type', 'application/json')
          xhr.setRequestHeader('Authorization', `Bearer ${token}`)
          xhr.send(data)
        } catch (err) {
          console.error("Failed to send final watch time:", err)
        }
      }
    }
  }

  // Handle visibility change (tab switching)
  const handleVisibilityChange = () => {
    if (document.hidden) {
      const duration = getWatchDuration()
      console.log(`👁️ Tab hidden - sending watch time: ${duration}s`)
      sendWatchTimeUpdate(duration, true)
    }
  }

  useEffect(() => {
    if (!id || !token) return

    // Add event listeners for tab close/switch
    window.addEventListener('beforeunload', sendBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Send periodic updates every 30 seconds while watching
    periodicUpdateIntervalRef.current = setInterval(() => {
      if (watchStartRef.current && !document.hidden) {
        const duration = getWatchDuration()
        if (duration > 0) {
          console.log(`⏰ Periodic update: ${duration}s`)
          sendWatchTimeUpdate(duration)
        }
      }
    }, 30000) // Every 30 seconds

    // Cleanup function when video changes or component unmounts
    return () => {
      console.log("🧹 Cleaning up view tracking...")
      
      // Send final watch time before cleanup
      const finalDuration = getWatchDuration()
      if (finalDuration > 0) {
        console.log(`📊 Final watch time on cleanup: ${finalDuration}s`)
        sendWatchTimeUpdate(finalDuration, true)
      }

      // Clear all intervals and timeouts
      if (viewIntervalRef.current) {
        clearTimeout(viewIntervalRef.current)
      }
      if (periodicUpdateIntervalRef.current) {
        clearInterval(periodicUpdateIntervalRef.current)
      }

      // Remove event listeners
      window.removeEventListener('beforeunload', sendBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)

      // Reset refs
      sentViewRef.current = false
      watchStartRef.current = null
      lastSentDurationRef.current = 0
    }
  }, [id, token])

  return {
    watchStartRef,
    sentViewRef,
    viewIntervalRef,
    sendView,
    sendWatchTimeUpdate,
    getWatchDuration,
  }
}