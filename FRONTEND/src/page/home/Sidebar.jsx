import { Button } from "@/components/ui/button"
import { useNavigate, useLocation } from "react-router-dom"
import {
  MdHome,
  MdLocalFireDepartment,
  MdSubscriptions,
  MdHistory,
  MdVideoLibrary,
  MdThumbUp,
} from "react-icons/md"

const NAV_ITEMS = [
  { label: "Home", to: "/", icon: MdHome },
  // { label: "Trending", to: "/trending", icon: MdLocalFireDepartment },
  { label: "Subscriptions", to: "/subscriptions", icon: MdSubscriptions },
]

const LIBRARY_ITEMS = [
  { label: "History", to: "/feed/history", icon: MdHistory },
  // { label: "Your videos", to: "/your-videos", icon: MdVideoLibrary },
  { label: "Liked videos", to: "/liked-videos", icon: MdThumbUp },
]

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  return (
    <>
      {/* Mobile backdrop — only visible on small screens when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed top-14 left-0 z-40
          h-[calc(100vh-3.5rem)]
          bg-white dark:bg-zinc-950
          border-r border-gray-200 dark:border-zinc-800
          transition-all duration-300 ease-in-out
          overflow-y-auto
          ${sidebarOpen
            ? "w-56 px-3 translate-x-0"
            : "-translate-x-full md:translate-x-0 w-16 px-1"}
        `}
      >
        <nav className="space-y-1 text-sm font-medium">
          {NAV_ITEMS.map((item) => (
            <SidebarItem
              key={item.label}
              label={item.label}
              to={item.to}
              icon={item.icon}
              open={sidebarOpen}
              onNavigate={() => {
                // Close sidebar on mobile after navigation
                if (window.innerWidth < 768) setSidebarOpen(false)
              }}
            />
          ))}

          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-zinc-800">
            {sidebarOpen && (
              <p className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 dark:text-zinc-400">
                Library
              </p>
            )}

            {LIBRARY_ITEMS.map((item) => (
              <SidebarItem
                key={item.label}
                label={item.label}
                to={item.to}
                icon={item.icon}
                open={sidebarOpen}
                onNavigate={() => {
                  if (window.innerWidth < 768) setSidebarOpen(false)
                }}
              />
            ))}
          </div>
        </nav>
      </aside>
    </>
  )
}

const SidebarItem = ({ label, open, to, icon: Icon, onNavigate }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const isActive = location.pathname === to

  const handleClick = () => {
    if (to) navigate(to)
    onNavigate?.()
  }

  return (
    <Button
      variant="ghost"
      onClick={handleClick}
      className={`
        w-full transition-all
        text-gray-700 dark:text-zinc-200
        hover:bg-gray-100 dark:hover:bg-zinc-900
        ${open ? "justify-start px-3 gap-3" : "justify-center px-0 flex-col gap-0.5 h-auto py-2"}
        ${isActive ? "bg-gray-100 dark:bg-zinc-900 font-semibold" : ""}
      `}
      title={!open ? label : undefined}
    >
      <Icon className={`flex-shrink-0 ${open ? "text-xl" : "text-2xl"}`} />
      {open
        ? <span>{label}</span>
        : <span className="text-[10px] font-medium leading-tight">{label.split(" ")[0]}</span>
      }
    </Button>
  )
}

export default Sidebar