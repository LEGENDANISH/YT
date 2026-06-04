import { Outlet } from "react-router-dom";
import Sidebar from "./page/home/Sidebar";
import { useEffect, useState } from "react";
import Topbar from "./page/home/components/Topbar";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  // 🔥 single source of truth for dark mode
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

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
    ${sidebarOpen ? "ml-10" : "ml-0"}
    px-1 md:px-3
  `}
>

          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
