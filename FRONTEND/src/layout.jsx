import { useEffect, useState } from "react"
import { Outlet } from "react-router-dom"
import Topbar from "./page/home/Topbar"
import Sidebar from "./page/home/Sidebar"

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [darkMode, setDarkMode] = useState(true)

  // 🔥 THIS is the key
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode)
  }, [darkMode])

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-black dark:text-white">
      <Topbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        darkMode={darkMode}
        toggleDarkMode={() => setDarkMode(p => !p)}
      />

      <div className="pt-14 flex">
        <Sidebar sidebarOpen={sidebarOpen} />

        <main
          className={`
            flex-1 transition-all duration-300
            ${sidebarOpen ? "ml-56" : "ml-16"}
            px-4 md:px-6 py-6
          `}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
    