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

const Topbar = ({
  sidebarOpen,
  setSidebarOpen,
  darkMode,
  toggleDarkMode,
  handleCreateClick,
}) => {
 const getCachedUser = async (setUser) => {
  try {
    const cachedUser = localStorage.getItem("userData");

    if (cachedUser) {
      setUser(JSON.parse(cachedUser));
      return;
    }

    const res = await axios.get("http://localhost:8000/api/aboutme", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const userData = res.data.data;

    localStorage.setItem("userData", JSON.stringify(userData));
    setUser(userData);

  } catch (error) {
    console.error("Failed to fetch user:", error);
  }
};

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
                className="border-0 bg-transparent px-4 focus-visible:ring-0"
              />
            </div>
            <Button className="rounded-r-full px-6 bg-gray-100 dark:bg-zinc-800">
              <Search className="h-5 w-5" />
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
