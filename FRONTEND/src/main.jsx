import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import VideoTestPage from "./VideoTestPage.jsx";
import Test from "./test";
import Signin from "./page/Signin";
import Signup from "./page/Signup";
import Home from "./page/home/Home";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/video" element={<VideoTestPage />} />
            <Route path="/test" element={<Test/>} />
            <Route path="/Signin" element={<Signin/>} />
            <Route path="/Signup" element={<Signup/>} />

    </Routes>
  </BrowserRouter>
);
