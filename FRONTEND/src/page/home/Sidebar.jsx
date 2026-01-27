import { Button } from "@/components/ui/button"

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
        
        <SidebarItem label="Home" open={sidebarOpen} />
        <SidebarItem label="Trending" open={sidebarOpen} />
        <SidebarItem label="Subscriptions" open={sidebarOpen} />

        <div className="pt-4 mt-4 border-t border-gray-200 dark:border-zinc-800">
          {sidebarOpen && (
            <p className="px-3 py-2 text-xs font-semibold uppercase text-gray-500">
              Library
            </p>
          )}

          <SidebarItem label="History" open={sidebarOpen} />
          <SidebarItem label="Your videos" open={sidebarOpen} />
          <SidebarItem label="Watch later" open={sidebarOpen} />
          <SidebarItem label="Liked videos" open={sidebarOpen} />
        </div>
      </nav>
    </aside>
  )
}

const SidebarItem = ({ label, open }) => {
  return (
    <Button
      variant="ghost"
      className={`
        w-full transition-all
        ${open ? "justify-start px-3" : "justify-center px-0"}
      `}
      title={!open ? label : undefined}
    >
      {open ? label : label[0]}
    </Button>
  )
}

export default Sidebar
