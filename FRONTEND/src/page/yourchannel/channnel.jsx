import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Edit, RefreshCw, Info, X, Users, Video, Play } from 'lucide-react';
import axios from 'axios';
// Configuration
const API_BASE_URL = 'http://localhost:8000/api';

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

  const authToken = localStorage.getItem('token') || 'your-auth-token';

  const getHeaders = (isMultipart = false) => {
    const headers = {
      'Authorization': `Bearer ${authToken}`
    };
    if (!isMultipart) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
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
    setSubscriberCount(data.count || 0);
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
    // ✅ Extract the videos array
    setVideos(data.videos || []); // fallback to empty array if undefined
  } catch (error) {
    console.error('Error loading videos:', error);
    setVideos([]); // ensure state stays as array even on error
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
    } catch (error) {
      console.error('Error loading about info:', error);
    }
  };

  const handleEditClick = (video) => {
    setSelectedVideo(video);
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setEditModalOpen(true);
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

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/60 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 via-pink-500 to-orange-500 flex items-center justify-center font-bold text-xl shadow-lg shadow-pink-500/30">
              YC
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Your Channel
              </h1>
              <p className="text-sm text-slate-400 font-mono">
                {formatNumber(subscriberCount)} subscribers
              </p>
            </div>
          </div>
          <button
            onClick={handleAboutClick}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-pink-500 transition-all duration-200"
          >
            <Info className="w-4 h-4" />
            <span className="font-medium">About</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="mb-8 flex flex-wrap gap-4">
          <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-slate-800/50 backdrop-blur border border-slate-700/50 shadow-lg">
            <Users className="w-5 h-5 text-pink-400" />
            <span className="font-semibold">{formatNumber(subscriberCount)}</span>
            <span className="text-slate-400">subscribers</span>
          </div>
          <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-slate-800/50 backdrop-blur border border-slate-700/50 shadow-lg">
            <Video className="w-5 h-5 text-orange-400" />
            <span className="font-semibold">{videos.length}</span>
            <span className="text-slate-400">videos</span>
          </div>
        </div>

        {/* Section Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-pink-200 to-orange-200 bg-clip-text text-transparent">
            Your Videos
          </h2>
          <button
            onClick={loadVideos}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 transition-all duration-200 shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 hover:-translate-y-0.5"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="font-semibold">Refresh</span>
          </button>
        </div>

        {/* Videos Grid */}
        {loading ? (
          <div className="text-center py-24">
            <div className="inline-block w-12 h-12 border-4 border-slate-700 border-t-pink-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-400">Loading your videos...</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-8xl mb-6 opacity-20">📹</div>
            <h3 className="text-2xl font-bold mb-2">No videos yet</h3>
            <p className="text-slate-400">Upload your first video to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video, index) => (
              <div
                key={video.id}
                className="group bg-slate-800/50 backdrop-blur rounded-xl overflow-hidden border border-slate-700/50 hover:border-pink-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-pink-500/20"
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                }}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl opacity-30">
                      🎬
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <button
                      onClick={() => handleEditClick(video)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 transition-all shadow-lg transform hover:scale-105"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="font-medium">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteVideo(video.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500 border border-red-500 hover:border-red-400 transition-all shadow-lg transform hover:scale-105"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="font-medium">Delete</span>
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-pink-300 transition-colors">
                    {video.title}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <span className="font-mono">{formatNumber(video.views || 0)} views</span>
                    <span>•</span>
                    <span>{formatDate(video.createdAt)}</span>
                  </div>
                  {video.description && (
                    <p className="mt-2 text-sm text-slate-400 line-clamp-2">
                      {video.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Edit Modal */}
      {editModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setEditModalOpen(false)}
        >
          <div
            className="bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: 'modalSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-pink-200 bg-clip-text text-transparent">
                Edit Video
              </h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <form onSubmit={handleUpdateThumbnail}>
                {/* Current Thumbnail */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-400 mb-3">
                    Current Thumbnail
                  </label>
                  <div className="rounded-lg overflow-hidden bg-slate-800 border border-slate-700">
                    {selectedVideo.thumbnailUrl ? (
                      <img
                        src={selectedVideo.thumbnailUrl}
                        alt="Current thumbnail"
                        className="w-full aspect-video object-cover"
                      />
                    ) : (
                      <div className="w-full aspect-video flex items-center justify-center text-6xl opacity-30">
                        🎬
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload New Thumbnail */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-400 mb-3">
                    Upload New Thumbnail
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                    id="thumbnailInput"
                  />
                  <label
                    htmlFor="thumbnailInput"
                    className="block p-8 border-2 border-dashed border-slate-700 hover:border-pink-500 rounded-lg text-center cursor-pointer transition-all hover:bg-slate-800/50"
                  >
                    <Upload className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                    <p className="text-slate-400 mb-1">Click to upload or drag and drop</p>
                    <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
                  </label>
                  
                  {thumbnailPreview && (
                    <div className="mt-4 rounded-lg overflow-hidden border border-pink-500/30">
                      <img
                        src={thumbnailPreview}
                        alt="Preview"
                        className="w-full aspect-video object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={updating}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 transition-all duration-200 shadow-lg shadow-pink-500/30 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    {updating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Update Thumbnail</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveThumbnail}
                    disabled={updating}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-red-500/20 hover:bg-red-500 border border-red-500 hover:border-red-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Remove</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* About Modal */}
      {aboutModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setAboutModalOpen(false)}
        >
          <div
            className="bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: 'modalSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-pink-200 bg-clip-text text-transparent">
                About This Channel
              </h3>
              <button
                onClick={() => setAboutModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {!aboutData ? (
                <div className="text-center py-12">
                  <div className="inline-block w-8 h-8 border-4 border-slate-700 border-t-pink-500 rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-400 mb-2">Channel Name</h4>
                    <p className="text-lg font-medium">{aboutData.channelName || 'Your Channel'}</p>
                  </div>
                  {aboutData.description && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-400 mb-2">Description</h4>
                      <p className="text-slate-300">{aboutData.description}</p>
                    </div>
                  )}
                  {aboutData.email && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-400 mb-2">Email</h4>
                      <p className="text-slate-300 font-mono">{aboutData.email}</p>
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-400 mb-2">Joined</h4>
                    <p className="text-slate-300">{formatDate(aboutData.createdAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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