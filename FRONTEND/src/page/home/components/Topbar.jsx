// src/components/Topbar.jsx
// Enhanced Topbar with YouTube-style search dropdown

import { Menu, Search, Video, Bell, Moon, Sun, Clock, X, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import {
  getSearchHistory,
  addSearchToHistory,
  deleteSearchFromHistory,
  clearSearchHistory,
  formatSearchTime
} from "../../searches/searchHistory"

// Mock trending searches (you can fetch from API later)
const TRENDING_SEARCHES = [
  "AI tutorials",
  "React hooks explained",
  "Best coding practices 2025",
  "JavaScript async await",
  "CSS animations"
]

const Topbar = ({
  sidebarOpen,
  setSidebarOpen,
  darkMode,
  toggleDarkMode,
  handleCreateClick,
}) => {
  const navigate = useNavigate()
  const searchInputRef = useRef(null)
  const dropdownRef = useRef(null)

  const [query, setQuery] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchHistory, setSearchHistory] = useState([])
  const [hoveredItem, setHoveredItem] = useState(null)

  // Load search history on mount
  useEffect(() => {
    setSearchHistory(getSearchHistory())
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Handle search execution
  const handleSearch = (searchQuery = query) => {
    if (!searchQuery.trim()) return

    // Add to history
    const updated = addSearchToHistory(searchQuery)
    setSearchHistory(updated)

    // Navigate to results page
    navigate(`/results?q=${encodeURIComponent(searchQuery)}`)
    setShowDropdown(false)
    setQuery("")
  }

  // Handle Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  // Delete individual history item
  const handleDeleteHistory = (itemQuery, e) => {
    e.stopPropagation()
    const updated = deleteSearchFromHistory(itemQuery)
    setSearchHistory(updated)
  }

  // Clear all history
  const handleClearAll = () => {
    const updated = clearSearchHistory()
    setSearchHistory(updated)
  }

  // Handle history item click
  const handleHistoryClick = (itemQuery) => {
    setQuery(itemQuery)
    handleSearch(itemQuery)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-zinc-950 border-b border-gray-200 dark:border-zinc-800">
      <div className="flex items-center justify-between px-4 py-2">

        {/* Left - Menu & Logo */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>

          <div 
            className="flex items-center gap-1 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <Video className="h-7 w-7 text-red-600" />
            <span className="text-xl font-semibold hidden sm:inline">
              YouTube
            </span>
          </div>
        </div>

        {/* Center - Search Bar */}
        <div className="flex-1 max-w-2xl mx-4 relative">
          <div className="flex items-center">
            <div className="flex flex-1 items-center border border-gray-300 dark:border-zinc-700 rounded-l-full">
              <Input
                ref={searchInputRef}
                placeholder="Search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowDropdown(true)}
                className="border-0 bg-transparent px-4 focus-visible:ring-0"
              />
            </div>

            <Button
              onClick={() => handleSearch()}
              className="rounded-r-full px-6 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700"
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>

          {/* Search Dropdown */}
          {showDropdown && (
            <div
              ref={dropdownRef}
              className="absolute top-full left-0 right-12 mt-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-xl max-h-[70vh] overflow-y-auto z-50"
            >
              {/* Search History */}
              {searchHistory.length > 0 && (
                <div className="border-b border-gray-200 dark:border-zinc-800">
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Search History
                    </span>
                    <button
                      onClick={handleClearAll}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline uppercase font-medium"
                    >
                      Clear all
                    </button>
                  </div>

                  {searchHistory.map((item, index) => (
                    <div
                      key={index}
                      onClick={() => handleHistoryClick(item.query)}
                      onMouseEnter={() => setHoveredItem(index)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer group"
                    >
                      {/* Icon or Thumbnail */}
                      {item.thumbnailUrl ? (
                        <img
                          src={item.thumbnailUrl}
                          alt={item.query}
                          className="w-10 h-10 rounded object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                          <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </div>
                      )}

                      {/* Query Text */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-gray-100 truncate">
                          {item.query}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatSearchTime(item.timestamp)}
                        </p>
                      </div>

                      {/* Delete Button */}
                      {hoveredItem === index && (
                        <button
                          onClick={(e) => handleDeleteHistory(item.query, e)}
                          className="p-1.5 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-full transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Trending Searches */}
              {!query.trim() && (
                <div>
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-zinc-800">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Trending Searches
                    </span>
                  </div>

                  {TRENDING_SEARCHES.map((trend, index) => (
                    <div
                      key={index}
                      onClick={() => handleHistoryClick(trend)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer"
                    >
                      <TrendingUp className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {trend}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* No history & no query */}
              {searchHistory.length === 0 && !query.trim() && (
                <div className="px-4 py-8 text-center">
                  <Clock className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No search history
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right - Actions & Profile */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="hidden sm:inline-flex"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleCreateClick}
            className="hidden sm:inline-flex"
          >
            <Video className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
            <Bell className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 w-9 rounded-full">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <p className="text-sm font-medium">User Name</p>
                <p className="text-xs text-muted-foreground">
                  user@example.com
                </p>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/channel")}>
                Your channel
              </DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem onClick={toggleDarkMode} className="sm:hidden">
                {darkMode ? "Light" : "Dark"} mode
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      </div>
    </header>
  )
}

export default Topbar