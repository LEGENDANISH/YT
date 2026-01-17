import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import VideoTestPage from "./VideoTestPage.jsx";
import Test from "./test";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/video" element={<VideoTestPage />} />
            <Route path="/test" element={<Test/>} />

    </Routes>
  </BrowserRouter>
);
