import React from "react"
import VideoRow from "./VideoRow"

const VideosGrid = ({
  loading,
  videos,
  handleEditClick,
  handleDeleteVideo,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-neutral-800 border-t-neutral-400 rounded-full animate-spin" />
      </div>
    )
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-center">
        <h3 className="text-lg font-semibold text-white">
          No videos uploaded
        </h3>
        <p className="mt-2 text-sm text-neutral-400">
          Your uploaded videos will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-neutral-800 border border-neutral-800 rounded-lg overflow-hidden">
      {videos.map((video) => (
        <VideoRow
          key={video.id}
          video={video}
          handleEditClick={handleEditClick}
          handleDeleteVideo={handleDeleteVideo}
        />
      ))}
    </div>
  )
}

export default VideosGrid
