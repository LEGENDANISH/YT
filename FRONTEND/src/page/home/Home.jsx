import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
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
import Topbar from "../home/components/Topbar"
import Sidebar from "./Sidebar"
const PORT = import.meta.env.VITE_BACKEND_PORT
const BASE_URL = `http://localhost:${PORT}/api`

const Home = () => {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

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
    navigate("/upload") 
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    console.log("Dark mode toggled:", !darkMode)
  }

  const handleVideoClick = (videoId) => {
    navigate(`/videos/${videoId}`)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-black dark:text-white">
      {/* Header */}


      <div className="flex pt-14">


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
                  <div 
                    key={video.id} 
                    className="space-y-3 cursor-pointer"
                    onClick={() => handleVideoClick(video.id)}
                  >
                    <div className="relative aspect-video bg-gray-200 dark:bg-zinc-800 rounded-xl overflow-hidden">
                      <img
                        src={video.thumbnailUrl || 'https://via.placeholder.com/320x180'}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={video.user?.avatarUrl} />
                        <AvatarFallback>{video.user?.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm line-clamp-2">
                          {video.title}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {video.user?.username}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {video.views} views • {formatDate(video.createdAt)}
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