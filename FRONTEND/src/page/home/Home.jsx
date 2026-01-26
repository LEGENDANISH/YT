import { useEffect, useState } from "react"
import { Menu, Search, Video, Bell, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const PORT = import.meta.env.VITE_BACKEND_PORT
const BASE_URL = `http://localhost:${PORT}/api`

const Home = () => {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const fetchHomeFeed = async () => {
      try {
        const token = localStorage.getItem("token")

        const res = await fetch(`${BASE_URL}/feed/home`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await res.json()
        setVideos(data?.videos || [])
      } catch (err) {
        console.error("Failed to load home feed", err)
      } finally {
        setLoading(false)
      }
    }

    fetchHomeFeed()
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const handleCreateClick = () => {
    console.log("Create button clicked - upload flow will be implemented")
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    console.log("Dark mode toggled:", !darkMode)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-black dark:text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-zinc-950 border-b border-gray-200 dark:border-zinc-800">
        <div className="flex items-center justify-between px-4 py-2">
          {/* Left section */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div className="flex items-center gap-1">
              <Video className="h-7 w-7 text-red-600" />
              <span className="text-xl font-semibold hidden sm:inline">YouTube</span>
            </div>
          </div>

          {/* Center - Search */}
          <div className="flex-1 max-w-2xl mx-4">
            <div className="flex items-center">
              <div className="flex flex-1 items-center border border-gray-300 dark:border-zinc-700 rounded-l-full overflow-hidden">
                <Input
                  type="text"
                  placeholder="Search"
                  className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent px-4"
                />
              </div>
              <Button className="rounded-l-none rounded-r-full px-6 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-black dark:text-white border border-l-0 border-gray-300 dark:border-zinc-700">
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="hidden sm:inline-flex"
            >
              {darkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleCreateClick}
              className="hidden sm:inline-flex"
            >
              <Video className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:inline-flex"
            >
              <Bell className="h-5 w-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">User Name</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      user@example.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => console.log("Your channel clicked")}>
                  Your channel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => console.log("Settings clicked")}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleDarkMode} className="sm:hidden">
                  {darkMode ? "Light" : "Dark"} mode
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => console.log("Sign out clicked")}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex pt-14">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'block' : 'hidden'} md:block fixed md:sticky top-14 left-0 h-[calc(100vh-3.5rem)] w-56 border-r border-gray-200 dark:border-zinc-800 px-3 py-4 overflow-y-auto bg-white dark:bg-zinc-950 z-40`}>
          <nav className="space-y-1 text-sm font-medium">
            <Button variant="ghost" className="w-full justify-start bg-gray-100 dark:bg-zinc-800">
              Home
            </Button>
            <Button variant="ghost" className="w-full justify-start hover:bg-gray-100 dark:hover:bg-zinc-800">
              Trending
            </Button>
            <Button variant="ghost" className="w-full justify-start hover:bg-gray-100 dark:hover:bg-zinc-800">
              Subscriptions
            </Button>
            <div className="pt-4 border-t border-gray-200 dark:border-zinc-800 mt-4">
              <p className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Library
              </p>
              <Button variant="ghost" className="w-full justify-start hover:bg-gray-100 dark:hover:bg-zinc-800">
                History
              </Button>
              <Button variant="ghost" className="w-full justify-start hover:bg-gray-100 dark:hover:bg-zinc-800">
                Your videos
              </Button>
              <Button variant="ghost" className="w-full justify-start hover:bg-gray-100 dark:hover:bg-zinc-800">
                Watch later
              </Button>
              <Button variant="ghost" className="w-full justify-start hover:bg-gray-100 dark:hover:bg-zinc-800">
                Liked videos
              </Button>
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 px-4 md:px-6 py-6 md:ml-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {loading
              ? Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-48 w-full rounded-xl bg-gray-200 dark:bg-zinc-800" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full bg-gray-200 dark:bg-zinc-800" />
                      <Skeleton className="h-4 w-3/4 bg-gray-200 dark:bg-zinc-800" />
                    </div>
                  </div>
                ))
              : videos.map((video) => (
                  <div key={video.id} className="space-y-3 cursor-pointer">
                    <div className="relative aspect-video bg-gray-200 dark:bg-zinc-800 rounded-xl overflow-hidden">
                      <img
                        src={video.thumbnail || 'https://via.placeholder.com/320x180'}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={video.channelAvatar} />
                        <AvatarFallback>{video.channelName?.[0] || 'C'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm line-clamp-2">
                          {video.title}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {video.channelName}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {video.views} views • {video.uploadedAt}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Home