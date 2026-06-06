import { Outlet } from "react-router-dom";
import Sidebar from "./page/home/Sidebar";
import Topbar from "./page/home/components/Topbar";
import { useEffect, useState } from "react";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  // 🔥 Single source of truth for dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-black dark:text-white transition-colors duration-300">
      
      {/* Sticky Topbar */}
      <div className="fixed top-0 left-0 right-0 z-40">
        <Topbar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          darkMode={darkMode}
          toggleDarkMode={() => setDarkMode((prev) => !prev)}
        />
      </div>

      <div className="flex pt-14 min-h-screen">
        
        {/* Sidebar - Fixed on Desktop, Hidden/Overlay on Mobile depending on your Sidebar implementation */}
        <aside 
          className={`
            fixed left-0 top-14 bottom-0 z-30 transition-all duration-300 ease-in-out
            ${sidebarOpen ? "w-60 translate-x-0" : "w-0 -translate-x-full md:w-20 md:translate-x-0"}
            bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 overflow-hidden
          `}
        >
          <Sidebar sidebarOpen={sidebarOpen} />
        </aside>

        {/* Main Content Area */}
        <main
          className={`
            flex-1 transition-all duration-300 ease-in-out
            ${sidebarOpen ? "md:ml-60" : "md:ml-20"}
            w-full px-4 py-6 md:px-8 md:py-8
          `}
        >
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
};

export default Layout;