import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

import Layout from "./layout";

// Pages
import Home from "./page/home/Home";
import Watch from "./page/watch/Watch";
import HistoryPage from "./page/history/HistoryPage";
import LikedVideos from "./page/likedvideos/LikedVideos";
import Subscriptions from "./page/subscriptions/Subscriptions";
import SearchResults from "./page/SearchResults";
import SearchResultsPage from "./page/searches/SearchContext";
import ChannelPage from "./page/yourchannel/channnel";
import UploadPage from "./page/videoUpload/UploadPage";
import ChannelPageview from "./page/viewchannel/channelpage";

// Auth / standalone pages
import Signin from "./page/Signin";
import Signup from "./page/Signup";
import VideoTestPage from "./VideoTestPage";
// import Test from "./test";
import AnalyticsPage from "./page/channelAnalytics/AnalyticsPage";
import AnalyticsDashboard from "./page/channelAnalytics/Analyticsdashboard";
import VideoAnalyticsPage from "./page/yourchannel/VideoAnalyticsPage";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
<Route
  path="/studio/analytics/video/:videoId"
  element={<VideoAnalyticsPage />}
/>

      {/* 🔓 Routes WITHOUT Topbar / Sidebar */}
      <Route path="/signin" element={<Signin />} />
      <Route path="/signup" element={<Signup />} />
        {/* <Route path="/test" element={<Test />} /> */}
      <Route path="/video" element={<VideoTestPage />} />
        <Route path="/channel" element={<ChannelPage />} />
        <Route path="/analytics" element={< AnalyticsDashboard/>} />
      {/* ✅ Routes WITH Topbar & Sidebar */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/videos/:id" element={<Watch />} />
        <Route path="/feed/history" element={<HistoryPage />} />
        <Route path="/liked-videos" element={<LikedVideos />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/results" element={<SearchResultsPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/channel/:channelId" element={<ChannelPageview />} />

      </Route>

    </Routes>
  </BrowserRouter>
);
