import { useEffect, useState } from "react"
import Topbar from "./page/home/Topbar"
import Sidebar from "./page/home/Sidebar"
import { Outlet } from "react-router-dom"

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // 🔥 THIS is what makes dark mode work
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode)
  }, [darkMode])



  const handleCreateClick = () => {
    console.log("Create clicked")
  }

  return (
    <>
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-black dark:text-white">

      {/* TOPBAR */}
      <Topbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        handleCreateClick={handleCreateClick}
      />

      {/* BODY */}
      <div className="pt-14 flex">
        <Sidebar sidebarOpen={sidebarOpen} />

        <main
          className={`
            flex-1 transition-all duration-300
            ${sidebarOpen ? "ml-56" : "ml-16"}
            px-4 md:px-6 py-6
          `}
        >
          {children}
        </main>
      </div>
    </div>
          <Outlet />

    </>
    
  )
}

export default Layout
