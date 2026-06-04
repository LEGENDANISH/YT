import Hls from "hls.js"
import { useEffect, useRef } from "react"

const HlsPlayer = ({ src, onPlay, onPause, onEnded }) => {
  const videoRef = useRef(null)

  useEffect(() => {
    if (!src || !videoRef.current) return

    if (Hls.isSupported()) {
      const hls = new Hls()
      hls.loadSource(src)
      hls.attachMedia(videoRef.current)

      return () => hls.destroy()
    }

    // Safari fallback
    if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      videoRef.current.src = src
    }
  }, [src])

  return (
    <video
      ref={videoRef}
      controls
      autoPlay
      playsInline
      className="w-full aspect-video rounded-xl bg-black"
      onPlay={onPlay}
      onPause={onPause}
      onEnded={onEnded}
    />
  )
}

export default HlsPlayer
