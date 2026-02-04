import React, { useState, useEffect } from 'react';
import { RefreshCw, Info, Users, Video } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from './config';
import { getHeaders } from './auth';
import { formatNumber, formatDate } from './formatters';
import Header from './Header';
import StatsSection from './StatsSection';
import VideosGrid from './VideosGrid';
import EditModal from './EditModal';
import AboutModal from './AboutModal';
import EditChannelModal from './EditChannelModal';

const ChannelPage = () => {
  const [videos, setVideos] = useState([]);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [aboutData, setAboutData] = useState(null);
  const [channelId, setChannelId] = useState(null);
  const [openEdit, setOpenEdit] = useState(false)
const [channelData, setChannelData] = useState(null)


  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    visibility: "public",
    scheduledAt: "",
    tags: ""
  });

  const handleEditClick = (video) => {
    setSelectedVideo(video);
    setThumbnailFile(null);
    setThumbnailPreview(null);

    setEditForm({
      title: video.title || "",
      description: video.description || "",
      visibility: video.visibility || "public",
      scheduledAt: video.scheduledAt
        ? new Date(video.scheduledAt).toISOString().slice(0, 16)
        : "",
      tags: video.tags?.join(", ") || ""
    });

    setEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveVideoDetails = async () => {
    try {
      setUpdating(true);

      const response = await fetch(
        `${API_BASE_URL}/videos/${selectedVideo.id}`,
        {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify({
            title: editForm.title,
            description: editForm.description,
            visibility: editForm.visibility,
            scheduledAt: editForm.scheduledAt || null
          })
        }
      );

      if (!response.ok) throw new Error("Update failed");

      alert("Video updated successfully!");
      setEditModalOpen(false);
      loadVideos();
    } catch (err) {
      console.error(err);
      alert("Failed to update video");
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    const fetchChannelId = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/aboutme`, {
          headers: getHeaders(),
        });
        console.log("hii")
        console.log("About Me Response:", res.data);
        const id = res.data?.data?.id;
        setChannelId(id);
        console.log("Channel ID:", id);
      } catch (err) {
        console.error("Failed to fetch channel ID:", err);
      }
    };
    loadAboutData();
    loadSubscriberCount();
    fetchChannelId();
  }, []);

  useEffect(() => {
    if (!channelId) return;

    loadSubscriberCount();
    loadVideos();
  }, [channelId]);

  const loadSubscriberCount = async () => {
    if (!channelId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/subscribers/${channelId}`);
      const data = await response.json();

      setSubscriberCount(data.subscribers || 0);
      console.log("Subscriber Count:", data.subscribers);
    } catch (error) {
      console.error('Error loading subscriber count:', error);
    }
  };

  const loadVideos = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/my-videos`, {
        headers: getHeaders()
      });

      if (!response.ok) throw new Error('Failed to load videos');

      const data = await response.json();
      setVideos(data.videos || []);
    } catch (error) {
      console.error('Error loading videos:', error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAboutData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/aboutme`, {
        headers: getHeaders()
      });
      
      if (!response.ok) throw new Error('Failed to load about info');
      
      const data = await response.json();
      setAboutData(data);
       setChannelData(data.data);
      console.log("About Data:", data); 
    } catch (error) {
      console.error('Error loading about info:', error);
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateThumbnail = async (e) => {
    e.preventDefault();
    
    if (!thumbnailFile) {
      alert('Please select a thumbnail image');
      return;
    }
    
    setUpdating(true);
    
    try {
      const formData = new FormData();
      formData.append('thumbnail', thumbnailFile);
      
      const authToken = localStorage.getItem('token') || 'your-auth-token';
      const response = await fetch(`${API_BASE_URL}/thumbnail/${selectedVideo.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: formData
      });
      
      if (!response.ok) throw new Error('Failed to update thumbnail');
      
      alert('Thumbnail updated successfully!');
      setEditModalOpen(false);
      loadVideos();
    } catch (error) {
      console.error('Error updating thumbnail:', error);
      alert('Failed to update thumbnail. Please try again.');
    } finally {
      setUpdating(false);
    }
    const det = axios.get(`${API_BASE_URL}/videos/${selectedVideo.id}`, {
        headers: getHeaders(),
        });
        console.log("data:",det.data);
        console.log("videoid:",selectedVideo.id);
  };

  const handleRemoveThumbnail = async () => {
    if (!confirm('Are you sure you want to remove this thumbnail?')) return;
    
    setUpdating(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/thumbnail/${selectedVideo.id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      
      if (!response.ok) throw new Error('Failed to remove thumbnail');
      
      alert('Thumbnail removed successfully!');
      setEditModalOpen(false);
      loadVideos();
    } catch (error) {
      console.error('Error removing thumbnail:', error);
      alert('Failed to remove thumbnail. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!confirm('Are you sure you want to delete this video? This action cannot be undone.')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/videos/${videoId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      
      if (!response.ok) throw new Error('Failed to delete video');
      
      alert('Video deleted successfully!');
      loadVideos();
      loadSubscriberCount();
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Failed to delete video. Please try again.');
    }
  };

  const handleAboutClick = async () => {
    setAboutModalOpen(true);
    await loadAboutData();
  };

  return (
<div className="min-h-screen bg-black text-white">
      <Header 
        aboutData={aboutData}
        subscriberCount={subscriberCount}
        handleAboutClick={handleAboutClick}
          handleSettingsClick={() => setOpenEdit(true)}
      />
       {openEdit && (
  <EditChannelModal
    user={channelData}
    onClose={() => setOpenEdit(false)}
    onUpdated={updatedUser => setChannelData(updatedUser)}
  />
)}


      <main className="max-w-7xl mx-auto px-4 py-8">
        <StatsSection 
          subscriberCount={subscriberCount}
          videosCount={videos.length}
        />

          <div className="mb-6 flex items-center justify-between">
  <h2 className="text-2xl font-semibold text-white tracking-tight">
    Your Videos
  </h2>

  <button
    onClick={loadVideos}
    className="flex items-center gap-2 px-4 py-2 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-200 hover:bg-neutral-800 hover:border-neutral-700 transition-all duration-200"
  >
    <RefreshCw className="w-4 h-4 text-neutral-400" />
    <span className="text-sm font-medium">Refresh</span>
  </button>
</div>


        <VideosGrid 
          loading={loading}
          videos={videos}
          handleEditClick={handleEditClick}
          handleDeleteVideo={handleDeleteVideo}
        />
      </main>

      <EditModal 
        editModalOpen={editModalOpen}
        setEditModalOpen={setEditModalOpen}
        selectedVideo={selectedVideo}
        thumbnailPreview={thumbnailPreview}
        handleThumbnailChange={handleThumbnailChange}
        handleUpdateThumbnail={handleUpdateThumbnail}
        handleRemoveThumbnail={handleRemoveThumbnail}
        updating={updating}
        editForm={editForm}
        handleEditChange={handleEditChange}
        handleSaveVideoDetails={handleSaveVideoDetails}
      />

      <AboutModal 
        aboutModalOpen={aboutModalOpen}
        setAboutModalOpen={setAboutModalOpen}
        aboutData={aboutData}
      />

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default ChannelPage;