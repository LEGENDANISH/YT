import React from "react"
import { Info } from "lucide-react"
import { formatNumber } from "./formatters"

const Header = ({ aboutData, subscriberCount, handleAboutClick }) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/80 border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        
        {/* Left: Channel Info */}
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-12 h-12 rounded-full border border-neutral-700 bg-black overflow-hidden flex items-center justify-center font-semibold text-lg text-white">
              {aboutData?.data?.avatarUrl ? (
                <img
                  src={aboutData.data.avatarUrl}
                  alt="Channel avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                aboutData?.data?.displayName?.[0]?.toUpperCase() || "U"
              )}
            </div>
          </div>

          {/* Text */}
          <div className="leading-tight">
            <h1 className="text-lg font-semibold text-white tracking-tight">
              {aboutData?.data?.displayName || "Your Channel"}
            </h1>
            <p className="text-sm text-neutral-400">
              {formatNumber(subscriberCount)} subscribers
            </p>
          </div>
        </div>

        {/* Right: Action */}
        <button
          onClick={handleAboutClick}
          className="group flex items-center gap-2 px-4 py-2 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-200 hover:bg-neutral-800 hover:border-neutral-700 transition-all duration-200"
        >
          <Info className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
          <span className="text-sm font-medium">About</span>
        </button>
      </div>
    </header>
  )
}

export default Header
