import { Menu, Search, Video, Bell, Moon, Sun } from "lucide-react"
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
import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate, useSearchParams } from "react-router-dom"

const Topbar = ({
  sidebarOpen,
  setSidebarOpen,
  darkMode,
  toggleDarkMode,
  handleCreateClick,
}) => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)

  /* ---------------- Sync Query From URL ---------------- */
  useEffect(() => {
    const q = searchParams.get("q")
    if (q) setQuery(q)
  }, [])

  /* ---------------- Debounce Logging ---------------- */
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.trim()) {
        console.log("Auto search:", query)
      }
    }, 400)

    return () => clearTimeout(delayDebounce)
  }, [query])

  /* ---------------- Cached User Fetch ---------------- */
  const getCachedUser = async (setUser) => {
    try {
      const cachedUser = localStorage.getItem("userData")

      if (cachedUser) {
        setUser(JSON.parse(cachedUser))
        return
      }

      const res = await axios.get("http://localhost:8000/api/aboutme", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      const userData = res.data.data
      console.log("Fetched user data:", userData)
      localStorage.setItem("userData", JSON.stringify(userData))
      setUser(userData)
    } catch (error) {
      console.error("Failed to fetch user:", error)
    }
  }

  /* ---------------- Search Handler ---------------- */
  const handleSearch = () => {
    if (!query.trim()) return

    setLoading(true)
    navigate(`/search?q=${encodeURIComponent(query)}`)

    setTimeout(() => {
      setLoading(false)
    }, 300)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-zinc-950 border-b border-gray-200 dark:border-zinc-800">
      <div className="flex items-center justify-between px-4 py-2">

        {/* Left */}
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
            <span className="text-xl font-semibold hidden sm:inline">
              YouTube
            </span>
          </div>
        </div>

        {/* Center Search */}
        <div className="flex-1 max-w-2xl mx-4">
          <div className="flex items-center">
            <div className="flex flex-1 items-center border border-gray-300 dark:border-zinc-700 rounded-l-full">
              <Input
                placeholder="Search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="border-0 bg-transparent px-4 focus-visible:ring-0"
              />
            </div>

            <Button
              onClick={handleSearch}
              className="rounded-r-full px-6 bg-gray-100 dark:bg-zinc-800"
            >
              {loading ? "..." : <Search className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="hidden sm:inline-flex"
          >
            {darkMode ? <Sun /> : <Moon />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleCreateClick}
            className="hidden sm:inline-flex"
          >
            <Video />
          </Button>

          <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
            <Bell />
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
              <DropdownMenuItem>Your channel</DropdownMenuItem>
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
