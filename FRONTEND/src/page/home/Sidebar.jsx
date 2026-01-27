import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

const Sidebar = ({ sidebarOpen }) => {
  return (
    <aside
      className={`
        fixed md:sticky top-14 left-0 z-40
        h-[calc(100vh-3.5rem)]
        bg-white dark:bg-zinc-950
        border-r border-gray-200 dark:border-zinc-800
        transition-all duration-300 ease-in-out
        overflow-y-auto
        ${sidebarOpen ? "w-56 px-3" : "w-16 px-1"}
      `}
    >
      <nav className="space-y-1 text-sm font-medium">
        <SidebarItem label="Home" open={sidebarOpen} to="/" />
        <SidebarItem label="Trending" open={sidebarOpen} to="/trending" />
        <SidebarItem label="Subscriptions" open={sidebarOpen} to="/subscriptions" />

        <div className="pt-4 mt-4 border-t border-gray-200 dark:border-zinc-800">
          {sidebarOpen && (
            <p className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 dark:text-zinc-400">
              Library
            </p>
          )}

          <SidebarItem label="History" open={sidebarOpen} to="/history" />
          <SidebarItem label="Your videos" open={sidebarOpen} to="/your-videos" />
          <SidebarItem label="Watch later" open={sidebarOpen} to="/watch-later" />
          <SidebarItem label="Liked videos" open={sidebarOpen} to="/liked-videos" />
        </div>
      </nav>
    </aside>
  )
}

const SidebarItem = ({ label, open, to }) => {
  const navigate = useNavigate()

  return (
    <Button
      variant="ghost"
      onClick={() => to && navigate(to)}
      className={`
        w-full transition-all
        text-gray-700 dark:text-zinc-200
        hover:bg-gray-100 dark:hover:bg-zinc-900
        ${open ? "justify-start px-3" : "justify-center px-0"}
      `}
      title={!open ? label : undefined}
    >
      {open ? label : label[0]}
    </Button>
  )
}

export default Sidebar
