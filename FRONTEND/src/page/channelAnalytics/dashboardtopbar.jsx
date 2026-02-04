import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"

export default function TopBar({ user }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const getInitials = (name) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <svg
                className="w-8 h-8 text-primary"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
              <span className="text-xl font-bold tracking-tight hidden sm:inline-block">
                VideoAnalytics
              </span>
            </div>
          </div>

          {/* Navigation
          <nav className="hidden md:flex items-center gap-6">
            <a
              href="#"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Dashboard
            </a>
            <a
              href="#"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Videos
            </a>
            <a
              href="#"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Analytics
            </a>
            <a
              href="#"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Settings
            </a>
          </nav> */}

          {/* User Profile */}
          {user && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                aria-label="User menu"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.displayName}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-background"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-semibold text-sm ring-2 ring-background">
                    {getInitials(user.displayName || user.username)}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium">
                    {user.displayName || user.username}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {user.email}
                  </div>
                </div>
                <svg
                  className={`w-4 h-4 text-muted-foreground transition-transform hidden sm:block ${
                    isMenuOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <Card className="absolute right-0 mt-2 w-64 p-1 shadow-lg border">
                  <div className="p-3 border-b">
                    <div className="font-medium">{user.displayName || user.username}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                    {user.bio && (
                      <div className="text-xs text-muted-foreground mt-1">{user.bio}</div>
                    )}
                  </div>
                  
                  <div className="py-1">
                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors">
                      Profile Settings
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors">
                      Channel Settings
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors">
                      Preferences
                    </button>
                  </div>

                  <div className="py-1 border-t">
                    <button className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors">
                      Sign Out
                    </button>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}