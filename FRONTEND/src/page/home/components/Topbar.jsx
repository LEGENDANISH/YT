import { Menu, Search, Video, Bell, Moon, Sun, Clock, X, TrendingUp, LogOut, Settings, User } from "lucide-react"
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

// Mock trending searches
const TRENDING_SEARCHES = [
  "AI tutorials",
  "React hooks explained",
  "Best coding practices 2025",
  "JavaScript async await",
  "CSS animations"
]

// Reusable Search Dropdown Component
const SearchDropdown = ({ 
  searchHistory, 
  query, 
  hoveredItem, 
  setHoveredItem, 
  handleHistoryClick, 
  handleDeleteHistory, 
  handleClearAll,
  containerRef 
}) => (
  <div
    ref={containerRef}
    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl max-h-[70vh] overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2 duration-200"
  >
    {searchHistory.length > 0 && (
      <div className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-50/50 dark:bg-zinc-900/50">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Recent</span>
          <button
            onClick={handleClearAll}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
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
            className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer group transition-colors"
          >
            {item.thumbnailUrl ? (
              <img src={item.thumbnailUrl} alt={item.query} className="w-10 h-10 rounded-md object-cover flex-shrink-0 bg-zinc-800" />
            ) : (
              <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 rounded-md bg-zinc-100 dark:bg-zinc-800">
                <Clock className="w-4 h-4 text-zinc-500" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-zinc-900 dark:text-zinc-100 truncate font-medium">{item.query}</p>
              <p className="text-xs text-zinc-500">{formatSearchTime(item.timestamp)}</p>
            </div>
            {hoveredItem === index && (
              <button
                onClick={(e) => handleDeleteHistory(item.query, e)}
                className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-zinc-500" />
              </button>
            )}
          </div>
        ))}
      </div>
    )}

    {!query.trim() && searchHistory.length === 0 && (
       <div className="px-4 py-8 text-center">
       <Clock className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
       <p className="text-sm text-zinc-500">No recent searches</p>
     </div>
    )}

    {!query.trim() && (
      <div>
        <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Trending</span>
        </div>
        {TRENDING_SEARCHES.map((trend, index) => (
          <div
            key={index}
            onClick={() => handleHistoryClick(trend)}
            className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
          >
            <TrendingUp className="w-4 h-4 text-zinc-500 flex-shrink-0" />
            <span className="text-sm text-zinc-700 dark:text-zinc-300">{trend}</span>
          </div>
        ))}
      </div>
    )}
  </div>
)

const Topbar = ({
  sidebarOpen,
  setSidebarOpen,
  darkMode,
  toggleDarkMode,
}) => {
  const navigate = useNavigate()
  const searchInputRef = useRef(null)
  const mobileSearchInputRef = useRef(null)
  const dropdownRef = useRef(null)

  const [query, setQuery] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchHistory, setSearchHistory] = useState([])
  const [hoveredItem, setHoveredItem] = useState(null)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  // Get user from localStorage safely
  const [user, setUser] = useState(null)
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        console.error("Failed to parse user", e)
      }
    }
  }, [])

  // Load search history
  useEffect(() => {
    setSearchHistory(getSearchHistory())
  }, [])

  // Focus mobile search input
  useEffect(() => {
    if (mobileSearchOpen && mobileSearchInputRef.current) {
      mobileSearchInputRef.current.focus()
    }
  }, [mobileSearchOpen])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target) &&
        mobileSearchInputRef.current &&
        !mobileSearchInputRef.current.contains(event.target)
      ) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearch = (searchQuery = query) => {
    if (!searchQuery.trim()) return
    const updated = addSearchToHistory(searchQuery)
    setSearchHistory(updated)
    navigate(`/results?q=${encodeURIComponent(searchQuery)}`)
    setShowDropdown(false)
    setMobileSearchOpen(false)
    setQuery("")
  }

  const handleSignout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/signin")
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch()
    if (e.key === "Escape") {
      setMobileSearchOpen(false)
      setShowDropdown(false)
    }
  }

  const handleDeleteHistory = (itemQuery, e) => {
    e.stopPropagation()
    const updated = deleteSearchFromHistory(itemQuery)
    setSearchHistory(updated)
  }

  const handleClearAll = () => {
    const updated = clearSearchHistory()
    setSearchHistory(updated)
  }

  const handleHistoryClick = (itemQuery) => {
    setQuery(itemQuery)
    handleSearch(itemQuery)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
      
      {/* ── Mobile Full-Width Search Overlay ── */}
      {mobileSearchOpen && (
        <div className="flex md:hidden items-center gap-2 px-2 py-2 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-top-2 duration-200">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { setMobileSearchOpen(false); setQuery(""); setShowDropdown(false) }}
            className="flex-shrink-0 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            <X className="h-5 w-5" />
          </Button>

          <div className="flex flex-1 items-center relative">
            <div className="flex flex-1 items-center bg-zinc-100 dark:bg-zinc-900 border border-transparent focus-within:border-zinc-300 dark:focus-within:border-zinc-700 rounded-l-full transition-colors">
              <Input
                ref={mobileSearchInputRef}
                placeholder="Search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowDropdown(true)}
                className="border-0 bg-transparent px-4 focus-visible:ring-0 text-base"
              />
            </div>
            <Button
              onClick={() => handleSearch()}
              className="rounded-r-full px-4 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 border border-l-0 border-zinc-200 dark:border-zinc-700"
            >
              <Search className="h-4 w-4" />
            </Button>

            {showDropdown && (
              <SearchDropdown
                searchHistory={searchHistory}
                query={query}
                hoveredItem={hoveredItem}
                setHoveredItem={setHoveredItem}
                handleHistoryClick={handleHistoryClick}
                handleDeleteHistory={handleDeleteHistory}
                handleClearAll={handleClearAll}
                containerRef={dropdownRef}
              />
            )}
          </div>
        </div>
      )}

      {/* ── Main Topbar Row ── */}
      <div className={`flex items-center justify-between px-4 py-2 h-14 ${mobileSearchOpen ? "hidden md:flex" : "flex"}`}>

        {/* Left: Menu & Logo */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <Menu className="h-6 w-6" />
          </Button>

          <div
            className="flex items-center gap-1 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <div className="relative flex items-center justify-center w-8 h-8 bg-red-600 rounded-lg group-hover:scale-105 transition-transform">
               <Video className="h-5 w-5 text-white" fill="currentColor" />
            </div>
            <span className="text-xl font-bold tracking-tight hidden sm:inline dark:text-white">StreamFlow</span>
          </div>
        </div>

        {/* Center: Desktop Search */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-4 relative group">
          <div className="flex flex-1 items-center">
            <div className="flex flex-1 items-center bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-l-full focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all shadow-sm">
              <Input
                ref={searchInputRef}
                placeholder="Search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowDropdown(true)}
                className="border-0 bg-transparent px-4 focus-visible:ring-0 text-base"
              />
            </div>
            <Button
              onClick={() => handleSearch()}
              className="rounded-r-full px-6 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-l-0 border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300"
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>

          {showDropdown && (
            <SearchDropdown
              searchHistory={searchHistory}
              query={query}
              hoveredItem={hoveredItem}
              setHoveredItem={setHoveredItem}
              handleHistoryClick={handleHistoryClick}
              handleDeleteHistory={handleDeleteHistory}
              handleClearAll={handleClearAll}
              containerRef={dropdownRef}
            />
          )}
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          
          {/* Mobile Search Trigger */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileSearchOpen(true)}
            className="md:hidden text-zinc-600 dark:text-zinc-400"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Create/Upload */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/upload")}
            className="hidden sm:inline-flex text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            title="Create"
          >
            <Video className="h-5 w-5" />
          </Button>

          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="hidden sm:inline-flex text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <Bell className="h-5 w-5" />
          </Button>

          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="hidden sm:inline-flex text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 w-9 rounded-full p-0 ml-2 ring-2 ring-transparent hover:ring-zinc-200 dark:hover:ring-zinc-700 transition-all">
                <Avatar className="h-9 w-9">
                  {user?.avatarUrl ? (
                    <AvatarImage src={user.avatarUrl} className="object-cover" />
                  ) : (
                    <AvatarFallback className="bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-semibold">
                      {user?.displayName?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  )}
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-zinc-900 dark:text-zinc-100">{user?.displayName || "User"}</p>
                  <p className="text-xs leading-none text-zinc-500 truncate">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-800" />
              
              <DropdownMenuItem onClick={() => navigate("/channel")} className="cursor-pointer text-zinc-700 dark:text-zinc-300 focus:bg-zinc-100 dark:focus:bg-zinc-800">
                <User className="mr-2 h-4 w-4" />
                Your channel
              </DropdownMenuItem>
              
              <DropdownMenuItem className="cursor-pointer text-zinc-700 dark:text-zinc-300 focus:bg-zinc-100 dark:focus:bg-zinc-800">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>

              {/* Mobile Only Items in Dropdown */}
              <DropdownMenuItem onClick={toggleDarkMode} className="sm:hidden cursor-pointer text-zinc-700 dark:text-zinc-300 focus:bg-zinc-100 dark:focus:bg-zinc-800">
                {darkMode ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                {darkMode ? "Light" : "Dark"} mode
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => navigate("/upload")} className="sm:hidden cursor-pointer text-zinc-700 dark:text-zinc-300 focus:bg-zinc-100 dark:focus:bg-zinc-800">
                <Video className="mr-2 h-4 w-4" />
                Upload video
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-800" />
              
              <DropdownMenuItem
                onClick={handleSignout}
                className="cursor-pointer text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

export default Topbar