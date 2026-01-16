    import React, { useState, useEffect, useRef } from "react";
    import axios from "axios";
    import io from "socket.io-client";

    const API = "http://localhost:8000/api/videos";
    const SOCKET_URL = "http://localhost:8000";
    const VIDEO_STATUS = {
      UPLOADING: "UPLOADING",
      PROCESSING: "PROCESSING",
      PROCESSING_FAILED: "PROCESSING_FAILED",
      READY: "READY",
      CANCELLED: "CANCELLED",
    };
    const VideoTestPage = () => {
      const token = localStorage.getItem("authToken");
      const socketRef = useRef(null);

      const [file, setFile] = useState(null);
      const [uploadUrl, setUploadUrl] = useState(null);
      const [videoId, setVideoId] = useState(null);
      const [result, setResult] = useState(null);
      
      // NEW: Progress tracking
      const [uploadProgress, setUploadProgress] = useState(0);
      const [processingStatus, setProcessingStatus] = useState(null);
      const [isUploading, setIsUploading] = useState(false);
    const isTerminal =
      processingStatus === VIDEO_STATUS.READY ||
      processingStatus === VIDEO_STATUS.CANCELLED;

    const canRetry =
      processingStatus === VIDEO_STATUS.PROCESSING_FAILED;

  const isBusy =
  processingStatus === VIDEO_STATUS.PROCESSING || isUploading;


      const authConfig = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // ============================================
      // WebSocket Connection
      // ============================================
      useEffect(() => {
        if (!token) return;

        // Initialize WebSocket connection
        socketRef.current = io(SOCKET_URL, {
          auth: { token },
          transports: ["websocket", "polling"],
        });

        socketRef.current.on("connect", () => {
          console.log("✅ WebSocket connected");
          setResult({ message: "WebSocket connected" });
        });

        socketRef.current.on("disconnect", () => {
          console.log("❌ WebSocket disconnected");
        });

        // Listen for video updates
        socketRef.current.on("video:update", (data) => {
          console.log("📡 Video update:", data);
          
          if (data.uploadProgress !== undefined) {
            setUploadProgress(data.uploadProgress);
          }
          
        if (Object.values(VIDEO_STATUS).includes(data.status)) {
      setProcessingStatus(data.status);
    }


          setResult((prev) => ({
            ...prev,
            latestUpdate: data,
            timestamp: new Date().toISOString(),
          }));
        });

        return () => {
          if (socketRef.current) {
            socketRef.current.disconnect();
          }
        };
      }, [token]);

      // ============================================
      // 1️⃣ INITIATE UPLOAD
      // ============================================
      const initiateUpload = async () => {
        try {
          setResult({ message: "Initiating upload..." });
          
          const res = await axios.post(
            `${API}/upload/init`,
            {
              title: "Test Video",
              description: "Uploaded from test panel",
              fileSize: file.size,
              mimeType: file.type,
              originalName: file.name,
            },
            authConfig
          );

          setUploadUrl(res.data.uploadUrl);
          setVideoId(res.data.videoId);
          setUploadProgress(0);
          setProcessingStatus("UPLOADING");

          setResult({
            step: "Init Complete",
            videoId: res.data.videoId,
            message: "Ready to upload file",
          });
        } catch (err) {
          console.error(err);
          setResult({
            error: true,
            message: err.response?.data?.message || err.message,
          });
        }
      };

      // ============================================
      // 2️⃣ UPLOAD FILE TO S3 WITH PROGRESS
      // ============================================
      const uploadToStorage = async () => {
        try {
          setIsUploading(true);
          setResult({ message: "Uploading to storage..." });

          const xhr = new XMLHttpRequest();

          // Track upload progress
          xhr.upload.addEventListener("progress", async (e) => {
            if (e.lengthComputable) {
              const percentComplete = Math.round((e.loaded / e.total) * 100);
              setUploadProgress(percentComplete);

              // Update backend every 5% or at 100%
              if (percentComplete % 5 === 0 || percentComplete === 100) {
                try {
                  await axios.put(
                    `${API}/upload/progress/${videoId}`,
                    { progress: percentComplete },
                    authConfig
                  );
                } catch (err) {
                  console.error("Progress update failed:", err);
                }
              }
            }
          });

          // Handle upload completion
          xhr.addEventListener("load", () => {
            if (xhr.status === 200) {
              setIsUploading(false);
              setResult({
                step: "Upload Complete",
                message: "File uploaded to storage successfully",
                progress: 100,
              });
            } else {
              setIsUploading(false);
              setResult({
                error: true,
                message: `Upload failed with status ${xhr.status}`,
              });
            }
          });

          // Handle errors
          xhr.addEventListener("error", () => {
            setIsUploading(false);
            setResult({
              error: true,
              message: "Upload failed - network error",
            });
          });

          // Start upload
          xhr.open("PUT", uploadUrl);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.send(file);

        } catch (err) {
          setIsUploading(false);
          console.error(err);
          setResult({
            error: true,
            message: err.response?.data?.message || err.message,
          });
        }
      };

      // ============================================
      // 3️⃣ COMPLETE UPLOAD (TRIGGER PROCESSING)
      // ============================================
      const completeUpload = async () => {
        try {
          setResult({ message: "Starting video processing..." });
          
          const res = await axios.post(
            `${API}/upload/complete`,
            { videoId },
            authConfig
          );

          setProcessingStatus("PROCESSING");
          setResult({
            step: "Processing Started",
            ...res.data,
            message: "Video is being processed. Watch for real-time updates!",
          });
        } catch (err) {
          console.error(err);
          setResult({
            error: true,
            message: err.response?.data?.message || err.message,
          });
        }
      };

      // ============================================
      // 4️⃣ GET VIDEO METADATA
      // ============================================
      const getVideo = async () => {
        try {
          console.log("videoId:", videoId);
          const res = await axios.get(`${API}/${videoId}`);
          setResult({
            step: "Video Metadata",
            ...res.data,
          });
        } catch (err) {
          console.error(err);
          setResult({
            error: true,
            message: err.response?.data?.message || err.message,
          });
        }
      };

      // ============================================
      // 5️⃣ GET STREAM URL
      // ============================================
      const getStream = async () => {
        try {
          const res = await axios.get(`${API}/stream/${videoId}`);
          setResult({
            step: "Stream URL",
            ...res.data,
          });
        } catch (err) {
          console.error(err);
          setResult({
            error: true,
            message: err.response?.data?.message || err.message,
          });
        }
      };
    // ============================================
    // ❌ CANCEL VIDEO
    // ============================================
    const cancelVideo = async () => {
      try {
        const res = await axios.post(
          `${API}/${videoId}/cancel`,
          {},
          authConfig
        );

        setProcessingStatus("CANCELLED");
        setResult({
          step: "Cancelled",
          ...res.data,
        });
      } catch (err) {
        setResult({
          error: true,
          message: err.response?.data?.message || err.message,
        });
      }
    };
    // ============================================
    // 🗑️ DELETE VIDEO
    // ============================================
    const deleteVideo = async () => {
      try {
        const res = await axios.delete(
          `${API}/${videoId}`,
          authConfig
        );

        setResult({
          step: "Deleted",
          ...res.data,
        });

        resetTest();
      } catch (err) {
        setResult({
          error: true,
          message: err.response?.data?.message || err.message,
        });
      }
    };
    // ============================================
    // ✏️ UPDATE VIDEO
    // ============================================
    const updateVideo = async () => {
      try {
        const res = await axios.put(
          `${API}/${videoId}`,
          {
            title: "Updated Title from Test UI",
            description: "Updated description",
            visibility: "PUBLIC",
          },
          authConfig
        );

        setResult({
          step: "Updated",
          ...res.data,
        });
      } catch (err) {
        setResult({
          error: true,
          message: err.response?.data?.message || err.message,
        });
      }
    };

    // ============================================
    // 🔁 RETRY PROCESSING
    // ============================================
    const retryProcessing = async () => {
      try {
        setResult({ message: "Retrying processing..." });

        const res = await axios.post(
          `${API}/${videoId}/retry-processing`,
          {},
          authConfig
        );

        setProcessingStatus(VIDEO_STATUS.PROCESSING);

        setResult({
          step: "Retry Started",
          ...res.data,
        });
      } catch (err) {
        setResult({
          error: true,
          message: err.response?.data?.message || err.message,
        });
      }
    };


      // ============================================
      // RESET FUNCTION
      // ============================================
      const resetTest = () => {
        setFile(null);
        setUploadUrl(null);
        setVideoId(null);
        setResult(null);
        setUploadProgress(0);
        setProcessingStatus(null);
        setIsUploading(false);
      };

      // ============================================
      // UI RENDERING
      // ============================================
      return (
        <div className="min-h-screen p-8 bg-gray-100">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">
              🎥 Video Upload & Processing Test
            </h1>

            {/* WebSocket Status */}
            <div className="mb-4 p-3 bg-white rounded-lg shadow">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    socketRef.current?.connected ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <span className="text-sm font-medium">
                  WebSocket:{" "}
                  {socketRef.current?.connected ? "Connected" : "Disconnected"}
                </span>
              </div>
            </div>

            {/* File Input */}
            <div className="mb-6 p-4 bg-white rounded-lg shadow">
              <label className="block text-sm font-medium mb-2">
                Select Video File
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setFile(e.target.files[0])}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              {file && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
    


            {/* Progress Bar */}
            {(uploadProgress > 0 || processingStatus) && (
              <div className="mb-6 p-4 bg-white rounded-lg shadow">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">
                    Status: {processingStatus || "IDLE"}
                  </span>
                  <span className="text-sm text-gray-600">
                    {uploadProgress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-blue-600 h-4 transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mb-6 p-4 bg-white rounded-lg shadow">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <button
                  onClick={initiateUpload}
  disabled={!file || isBusy}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                  1️⃣ Init Upload
                </button>

                <button
                  onClick={uploadToStorage}
  disabled={!uploadUrl || isBusy}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                  {isUploading ? "Uploading..." : "2️⃣ Upload File"}
                </button>

                <button
                  onClick={completeUpload}
  disabled={
    !videoId ||
    uploadProgress < 100 ||
    isBusy ||
    processingStatus !== VIDEO_STATUS.UPLOADING
  }
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                  3️⃣ Complete Upload
                </button>

                <button
                  onClick={getVideo}
                  disabled={!videoId}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                  4️⃣ Get Video
                </button>

                <button
                  onClick={getStream}
                  disabled={!videoId}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                  5️⃣ Get Stream URL
                </button>

                <button
                  onClick={resetTest}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  🔄 Reset
                </button>


                <button
      onClick={cancelVideo}
  disabled={
    !videoId ||
    isTerminal ||
    processingStatus !== VIDEO_STATUS.PROCESSING
  }
      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 transition"
    >
      ❌ Cancel Video
    </button>

    <button
      onClick={updateVideo}
      disabled={!videoId}
      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition"
    >
      ✏️ Update Video
    </button>

    <button
      onClick={deleteVideo}
  disabled={!videoId || !isTerminal}
      className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 disabled:bg-gray-400 transition"
    >
      🗑️ Delete Video
    </button>

  {canRetry && (
    <button
      onClick={retryProcessing}
      disabled={isBusy}
      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 transition"
    >
      🔁 Retry Processing
    </button>
  )}



              </div>
            </div>

            {/* Current Video ID */}
            {videoId && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm">
                  <span className="font-semibold">Current Video ID:</span>{" "}
                  <code className="bg-blue-100 px-2 py-1 rounded">{videoId}</code>
                </p>
              </div>
            )}

            {/* Result Display */}
            <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden">
              <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
                <h2 className="text-sm font-semibold text-gray-200">
                  Response / Updates
                </h2>
              </div>
              <pre className="p-4 text-green-400 text-sm overflow-auto max-h-96">
                {result ? JSON.stringify(result, null, 2) : "No data yet..."}
              </pre>
            </div>
          </div>
        </div>
      );
    };

    export default VideoTestPage;