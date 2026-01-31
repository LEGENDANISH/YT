import React, { useState, useRef, useCallback } from 'react';
import axios from 'axios';

const VideoUpload = () => {
  // Configuration
  const API_BASE_URL = 'http://localhost:8000/api/videos';
  
  // State
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [status, setStatus] = useState({ message: '', type: '' });
  const [currentVideoId, setCurrentVideoId] = useState(null);

  // Refs
  const videoInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);
  const uploadControllerRef = useRef(null);

  // Get auth token (adjust based on your auth implementation)
  const getAuthToken = () => {
    return localStorage.getItem('token') || '';
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Show status message
  const showStatus = useCallback((message, type = 'success') => {
    setStatus({ message, type });
    if (type === 'success') {
      setTimeout(() => setStatus({ message: '', type: '' }), 5000);
    }
  }, []);

  // Handle video file selection
  const handleVideoSelection = useCallback((file) => {
    // Validate file type
    if (!file.type.startsWith('video/')) {
      showStatus('Please select a valid video file', 'error');
      return;
    }

    // Validate file size (5GB max)
    const maxSize = 5 * 1024 * 1024 * 1024;
    if (file.size > maxSize) {
      showStatus('File size exceeds 5GB limit', 'error');
      return;
    }

    setSelectedVideo(file);

    // Auto-fill title if empty
    if (!title) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setTitle(nameWithoutExt);
    }
  }, [title, showStatus]);

  // Handle thumbnail selection
  const handleThumbnailSelection = useCallback((file) => {
    if (!file.type.startsWith('image/')) {
      showStatus('Please select a valid image file', 'error');
      return;
    }

    setSelectedThumbnail(file);
    const reader = new FileReader();
    reader.onload = (e) => setThumbnailPreview(e.target.result);
    reader.readAsDataURL(file);
  }, [showStatus]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleVideoSelection(files[0]);
    }
  }, [handleVideoSelection]);

  // Upload to S3 with progress tracking
  const uploadToS3 = async (uploadUrl, file, videoId) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', async (e) => {
        if (e.lengthComputable) {
          const percentage = (e.loaded / e.total) * 100;
          setUploadProgress(percentage);

          // Update backend progress every 5%
          if (percentage % 5 < 1) {
            try {
              await axios.put(
                `${API_BASE_URL}/upload/progress/${videoId}`,
                { progress: Math.floor(percentage) },
                {
                  headers: {
                    'Authorization': `Bearer ${getAuthToken()}`
                  }
                }
              );
            } catch (err) {
              console.error('Progress update failed:', err);
            }
          }
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setUploadProgress(100);
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'));
      });

      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);

      uploadControllerRef.current = xhr;
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedVideo) {
      showStatus('Please select a video file', 'error');
      return;
    }

    if (!title.trim()) {
      showStatus('Please enter a video title', 'error');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setStatus({ message: '', type: '' });

      // Step 1: Initialize upload
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('fileSize', selectedVideo.size);
      formData.append('mimeType', selectedVideo.type);
      formData.append('originalName', selectedVideo.name);

      if (selectedThumbnail) {
        formData.append('thumbnail', selectedThumbnail);
      }

      const initResponse = await axios.post(
        `${API_BASE_URL}/upload/init`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      const { videoId, uploadUrl } = initResponse.data;
      setCurrentVideoId(videoId);

      if (!uploadUrl) {
        throw new Error('No upload URL received');
      }

      // Step 2: Upload to S3
      await uploadToS3(uploadUrl, selectedVideo, videoId);

      // Step 3: Complete upload
      await axios.post(
        `${API_BASE_URL}/upload/complete`,
        { videoId },
        {
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          }
        }
      );

      // Success!
      showStatus('Video uploaded successfully! Processing has started.', 'success');

      // Reset form after delay
      setTimeout(() => {
        resetForm();
      }, 3000);

    } catch (error) {
      console.error('Upload error:', error);
      
      let errorMessage = 'Upload failed. Please try again.';
      
      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
        
        if (error.response.status === 401) {
          errorMessage = 'Please log in to upload videos';
        } else if (error.response.status === 400) {
          errorMessage = error.response.data.message || 'Invalid upload data';
        }
      } else if (error.message === 'Upload cancelled') {
        errorMessage = 'Upload was cancelled';
      }

      showStatus(errorMessage, 'error');
    } finally {
      setIsUploading(false);
      uploadControllerRef.current = null;
    }
  };

  // Cancel upload
  const handleCancel = () => {
    if (uploadControllerRef.current) {
      uploadControllerRef.current.abort();
      showStatus('Upload cancelled', 'warning');
    }
    resetForm();
  };

  // Reset form
  const resetForm = () => {
    setSelectedVideo(null);
    setSelectedThumbnail(null);
    setThumbnailPreview(null);
    setTitle('');
    setDescription('');
    setUploadProgress(0);
    setIsUploading(false);
    setCurrentVideoId(null);
    if (videoInputRef.current) videoInputRef.current.value = '';
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-violet-600/10 to-transparent animate-pulse-slow" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-radial from-fuchsia-600/10 to-transparent animate-pulse-slow delay-1000" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <header className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-white via-violet-200 to-fuchsia-200 bg-clip-text text-transparent tracking-tight">
            Upload Video
          </h1>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500 font-mono">
            Share your content with the world
          </p>
        </header>

        {/* Upload Card */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 md:p-10 shadow-2xl shadow-violet-500/10 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Video File Drop Area */}
            <div className="space-y-3">
              <label className="block text-xs uppercase tracking-widest text-slate-400 font-mono">
                Video File
              </label>
              
              <div
                onClick={() => videoInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
                  transition-all duration-300 group
                  ${isDragOver 
                    ? 'border-violet-500 bg-violet-500/10 scale-[1.02]' 
                    : 'border-slate-700 bg-slate-950/50 hover:border-violet-600 hover:bg-violet-500/5'
                  }
                `}
              >
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={(e) => e.target.files[0] && handleVideoSelection(e.target.files[0])}
                  className="hidden"
                />
                
                <div className="text-6xl mb-4 transition-transform group-hover:scale-110">
                  📹
                </div>
                <div className="text-lg text-slate-300 mb-2 font-medium">
                  Click to browse or drag & drop
                </div>
                <div className="text-xs uppercase tracking-widest text-slate-500 font-mono">
                  MP4, MOV, AVI • Max 5GB
                </div>
              </div>

              {/* File Info */}
              {selectedVideo && (
                <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-5 space-y-3 animate-slide-down">
                  <div className="flex justify-between items-center text-sm font-mono">
                    <span className="text-slate-400">File Name:</span>
                    <span className="text-slate-200 truncate max-w-xs">{selectedVideo.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-mono">
                    <span className="text-slate-400">File Size:</span>
                    <span className="text-slate-200">{formatFileSize(selectedVideo.size)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-mono">
                    <span className="text-slate-400">Type:</span>
                    <span className="text-slate-200">{selectedVideo.type}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Title */}
            <div className="space-y-3">
              <label htmlFor="title" className="block text-xs uppercase tracking-widest text-slate-400 font-mono">
                Video Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a descriptive title"
                required
                className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-5 py-4 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Description */}
            <div className="space-y-3">
              <label htmlFor="description" className="block text-xs uppercase tracking-widest text-slate-400 font-mono">
                Description (Optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell viewers about your video"
                rows={4}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-5 py-4 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* Thumbnail */}
            <div className="space-y-3">
              <label htmlFor="thumbnail" className="block text-xs uppercase tracking-widest text-slate-400 font-mono">
                Thumbnail (Optional)
              </label>
              <input
                ref={thumbnailInputRef}
                id="thumbnail"
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files[0] && handleThumbnailSelection(e.target.files[0])}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-5 py-3 text-slate-100 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-violet-600 file:text-white file:cursor-pointer hover:file:bg-violet-700 transition-all"
              />
              
              {thumbnailPreview && (
                <div className="border border-slate-700 rounded-lg overflow-hidden animate-slide-down">
                  <img src={thumbnailPreview} alt="Thumbnail preview" className="w-full h-auto" />
                </div>
              )}
            </div>

            {/* Progress Section */}
            {isUploading && (
              <div className="space-y-3 animate-slide-down">
                <div className="flex justify-between items-center text-sm font-mono">
                  <span className="text-slate-300">
                    {uploadProgress < 100 ? 'Uploading to server...' : 'Finalizing...'}
                  </span>
                  <span className="text-violet-400 font-semibold">{Math.round(uploadProgress)}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-600 transition-all duration-300 ease-out relative overflow-hidden"
                    style={{ width: `${uploadProgress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  </div>
                </div>
              </div>
            )}

            {/* Status Messages */}
            {status.message && (
              <div
                className={`
                  px-5 py-4 rounded-lg font-mono text-sm border animate-slide-down
                  ${status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : ''}
                  ${status.type === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : ''}
                  ${status.type === 'warning' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : ''}
                `}
              >
                {status.message}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleCancel}
                disabled={!isUploading && !selectedVideo}
                className="flex-1 px-6 py-4 bg-transparent border border-slate-700 text-slate-300 rounded-lg font-mono text-sm uppercase tracking-widest hover:bg-slate-800 hover:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading || !selectedVideo}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-lg font-mono text-sm uppercase tracking-widest hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5"
              >
                {isUploading ? 'Uploading...' : 'Upload Video'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
        
        .delay-1000 {
          animation-delay: 1s;
        }
        
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
      `}</style>
    </div>
  );
};

export default VideoUpload;