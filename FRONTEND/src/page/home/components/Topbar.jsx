import { Menu, Search, Video, Bell, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useUserStore } from "../store/userStore";
import { useUser } from "../hooks/useUser";

const Topbar = ({
  sidebarOpen,
  setSidebarOpen,
  darkMode,
  toggleDarkMode,
  handleCreateClick,
}) => {
  useUser();
  const { user } = useUserStore();

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

        {/* Center */}
        <div className="flex-1 max-w-2xl mx-4 flex">
          <Input placeholder="Search" />
          <Button>
            <Search />
          </Button>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
            {darkMode ? <Sun /> : <Moon />}
          </Button>

          <Button variant="ghost" size="icon" onClick={handleCreateClick}>
            <Video />
          </Button>

          <Button variant="ghost" size="icon">
            <Bell />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 w-9 rounded-full">
                <Avatar>
                  <AvatarImage src={user?.avatarUrl || ""} />
                  <AvatarFallback>
                    {user?.displayName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <p className="text-sm font-medium">{user?.displayName}</p>
                <p className="text-xs text-muted-foreground">
                  {user?.email}
                </p>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />
              <DropdownMenuItem>Your channel</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("userData");
                  window.location.href = "/login";
                }}
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
