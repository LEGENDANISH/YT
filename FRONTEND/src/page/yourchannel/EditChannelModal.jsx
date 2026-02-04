import { useState } from "react"
import axios from "axios"

const API_BASE_URL = "http://localhost:8000"

const EditChannelModal = ({ user, onClose, onUpdated }) => {
  const [form, setForm] = useState({
    displayName: user.displayName || "",
    bio: user.bio || "",
  })

  const [avatarFile, setAvatarFile] = useState(null)
  const [bannerFile, setBannerFile] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    try {
      setLoading(true)

      const token = localStorage.getItem("token")

      const formData = new FormData()
      formData.append("displayName", form.displayName)
      formData.append("bio", form.bio)

      if (avatarFile) formData.append("avatar", avatarFile)
      if (bannerFile) formData.append("banner", bannerFile)

      const res = await axios.put(
        `${API_BASE_URL}/api/update`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      )

      onUpdated(res.data.user)
      onClose()
    } catch (error) {
      console.error("Error updating channel:", error)
      alert("Failed to update channel")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg w-full max-w-lg p-6">

        <h2 className="text-lg font-semibold text-white mb-4">
          Customize Channel
        </h2>

        <div className="space-y-4">
          {/* Channel Name */}
          <input
            name="displayName"
            value={form.displayName}
            onChange={handleChange}
            placeholder="Channel name"
            className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white"
          />

          {/* Bio */}
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            placeholder="Channel description"
            rows={3}
            className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white"
          />

          {/* Avatar Upload */}
          <div>
            <label className="text-sm text-neutral-400">Avatar</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatarFile(e.target.files[0])}
              className="mt-1 w-full text-sm text-neutral-300"
            />
          </div>

          {/* Banner Upload */}
          <div>
            <label className="text-sm text-neutral-400">Channel Banner</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setBannerFile(e.target.files[0])}
              className="mt-1 w-full text-sm text-neutral-300"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-neutral-800 rounded"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 text-sm bg-white text-black rounded font-medium disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditChannelModal
