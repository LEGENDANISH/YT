import React, { useState } from "react";
import axios from "axios";

const API = "http://localhost:8000";

const VideoTestPage = () => {
  const token = localStorage.getItem("authToken");

  const [file, setFile] = useState(null);
  const [uploadData, setUploadData] = useState(null);
  const [videoId, setVideoId] = useState("");
  const [result, setResult] = useState(null);

  const authHeader = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  /* 1️⃣ INITIATE UPLOAD */
  const initiateUpload = async () => {
    try {
      const res = await axios.post(
        `${API}/api/upload/init`,
        {
          filename: file.name,
          contentType: file.type,
        },
        authHeader
      );

      setUploadData(res.data);
      setVideoId(res.data.videoId);
      console.log("INIT:", res.data);
    } catch (err) {
      console.error(err);
    }
  };

  /* 2️⃣ UPLOAD FILE TO PRESIGNED URL */
  const uploadToStorage = async () => {
    try {
      await axios.put(uploadData.uploadUrl, file, {
        headers: {
          "Content-Type": file.type,
        },
      });

      alert("File uploaded to storage");
    } catch (err) {
      console.error(err);
    }
  };

  /* 3️⃣ COMPLETE UPLOAD */
  const completeUpload = async () => {
    try {
      const res = await axios.post(
        `${API}/api/upload/complete`,
        {
          uploadId: uploadData.uploadId,
          videoId,
        },
        authHeader
      );

      setResult(res.data);
      console.log("COMPLETE:", res.data);
    } catch (err) {
      console.error(err);
    }
  };

  /* 4️⃣ GET VIDEO METADATA */
  const getVideo = async () => {
    try {
      const res = await axios.get(`${API}/api/${videoId}`);
      setResult(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  /* 5️⃣ GET STREAM URL */
  const getStream = async () => {
    try {
      const res = await axios.get(`${API}/api/stream/${videoId}`);
      setResult(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">🎥 Video API Test Panel</h1>

      {/* FILE INPUT */}
      <input
        type="file"
        accept="video/*"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-4"
      />

      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={initiateUpload}
          disabled={!file}
          className="btn"
        >
          Init Upload
        </button>

        <button
          onClick={uploadToStorage}
          disabled={!uploadData}
          className="btn"
        >
          Upload File
        </button>

        <button
          onClick={completeUpload}
          disabled={!uploadData}
          className="btn"
        >
          Complete Upload
        </button>

        <button
          onClick={getVideo}
          disabled={!videoId}
          className="btn"
        >
          Get Video Metadata
        </button>

        <button
          onClick={getStream}
          disabled={!videoId}
          className="btn"
        >
          Get Stream URL
        </button>
      </div>

      {/* RESULT */}
      <pre className="bg-black text-green-400 p-4 rounded text-sm overflow-auto">
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
};

export default VideoTestPage;
