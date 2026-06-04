import React from "react"
import { Users, Video, BarChart3 } from "lucide-react"
import { formatNumber } from "./formatters"

const StatsSection = ({ subscriberCount, videosCount, onAnalyticsClick }) => {
  return (
    <div className="mb-8 flex flex-wrap items-center gap-4">
      
      {/* Subscribers */}
      <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-black border border-neutral-800 shadow-sm">
        <Users className="w-5 h-5 text-neutral-300" />
        <span className="font-semibold text-white">
          {formatNumber(subscriberCount)}
        </span>
        <span className="text-neutral-400">subscribers</span>
      </div>

      {/* Videos */}
      <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-black border border-neutral-800 shadow-sm">
        <Video className="w-5 h-5 text-neutral-300" />
        <span className="font-semibold text-white">{videosCount}</span>
        <span className="text-neutral-400">videos</span>
      </div>

      {/* Analytics Button */}
      <button
        onClick={onAnalyticsClick}
        className="ml-auto flex items-center gap-2 px-5 py-3 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-200 hover:bg-neutral-800 hover:border-neutral-700 transition-all duration-200"
      >
        <BarChart3 className="w-5 h-5" />
        <span className="font-medium">Analytics</span>
      </button>

    </div>
  )
}

export default StatsSection
