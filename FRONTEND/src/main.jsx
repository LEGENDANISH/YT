import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import VideoTestPage from "./VideoTestPage.jsx";
import Test from "./test";
import Signin from "./page/Signin";
import Signup from "./page/Signup";
import Home from "./page/home/Home";
import Watch from "./page/watch/Watch";
import HistoryPage from "./page/history/HistoryPage";
import LikedVideos from "./page/likedvideos/LikedVideos";
import Subscriptions from "./page/subscriptions/Subscriptions";
import SearchResults from "./page/SearchResults";
import SearchResultsPage from "./page/searches/SearchContext";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      
      <Route path="/" element={<Home />} />
      <Route path="/video" element={<VideoTestPage />} />
            <Route path="/test" element={<Test/>} />
            <Route path="/Signin" element={<Signin/>} />
            <Route path="/Signup" element={<Signup/>} />
  <Route path="/videos/:id" element={<Watch />} />
  <Route path="/feed/history" element={<HistoryPage />} />
<Route path="/liked-videos" element={<LikedVideos />} />
  <Route path="/subscriptions" element={<Subscriptions />} />
<Route path="search" element={<SearchResults />} />
<Route path="/results" element={<SearchResultsPage />} />

    </Routes>
  </BrowserRouter>
);
