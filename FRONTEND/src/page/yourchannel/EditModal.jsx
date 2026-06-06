import React from "react"
import { X, Upload, Trash2, Image as ImageIcon } from "lucide-react"

const EditModal = ({
  editModalOpen,
  setEditModalOpen,
  selectedVideo,
  thumbnailPreview,
  handleThumbnailChange,
  handleUpdateThumbnail,
  handleRemoveThumbnail,
  updating,
  editForm,
  handleEditChange,
  handleSaveVideoDetails,
}) => {
  if (!editModalOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={() => setEditModalOpen(false)}
    >
      {/* Modal Container */}
      <div
        className="w-full max-w-4xl max-h-[90vh] bg-black border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-black">
          <div>
            <h3 className="text-xl font-semibold text-white">Video Details</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Manage metadata and thumbnails</p>
          </div>
          <button
            onClick={() => setEditModalOpen(false)}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Thumbnail (Spans 1 col on large screens) */}
            <div className="lg:col-span-1 space-y-4">
              <label className="block text-sm font-medium text-zinc-300">
                Thumbnail
              </label>

              <div className="relative group aspect-video rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800">
                {/* Current or Preview Image */}
                <img
                  src={thumbnailPreview || selectedVideo.thumbnailUrl || ""}
                  alt="Thumbnail"
                  className={`w-full h-full object-cover transition-opacity ${
                    !thumbnailPreview && !selectedVideo.thumbnailUrl ? 'opacity-0' : 'opacity-100'
                  }`}
                />
                
                {/* Placeholder State */}
                {!thumbnailPreview && !selectedVideo.thumbnailUrl && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600">
                    <ImageIcon className="w-8 h-8 mb-2" />
                    <span className="text-xs">No Image</span>
                  </div>
                )}

                {/* Overlay for Upload */}
                <label
                  htmlFor="thumbnailInput"
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white"
                >
                  <Upload className="w-6 h-6 mb-2" />
                  <span className="text-xs font-medium">Change</span>
                  <input
                    id="thumbnailInput"
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Thumbnail Actions */}
              <div className="flex flex-col gap-2">
                 <button
                  onClick={handleUpdateThumbnail}
                  disabled={!thumbnailPreview || updating}
                  className="w-full py-2 text-xs font-medium rounded-md bg-zinc-900 border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {updating ? "Uploading..." : "Apply New Thumbnail"}
                </button>
                
                {selectedVideo.thumbnailUrl && (
                  <button
                    onClick={handleRemoveThumbnail}
                    disabled={updating}
                    className="w-full py-2 text-xs font-medium rounded-md text-red-400 hover:bg-red-900/20 hover:text-red-300 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-3 h-3" />
                    Remove Current
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Details (Spans 2 cols on large screens) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Title */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  name="title"
                  value={editForm.title}
                  onChange={handleEditChange}
                  placeholder="Add a title that describes your video"
                  className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:border-white focus:ring-1 focus:ring-white outline-none transition-all"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">
                  Description
                </label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  rows={5}
                  placeholder="Tell viewers about your video"
                  className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:border-white focus:ring-1 focus:ring-white outline-none transition-all resize-none"
                />
              </div>

              {/* Grid for Visibility & Schedule */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Visibility */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-300">
                    Visibility
                  </label>
                  <div className="relative">
                    <select
                      name="visibility"
                      value={editForm.visibility}
                      onChange={handleEditChange}
                      className="w-full appearance-none px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white focus:border-white outline-none transition-all cursor-pointer"
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                      <option value="unlisted">Unlisted</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

                {/* Schedule */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-300">
                    Schedule Publish
                  </label>
                  <input
                    type="datetime-local"
                    name="scheduledAt"
                    value={editForm.scheduledAt}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white focus:border-white outline-none transition-all [color-scheme:dark]"
                  />
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-black">
          <button
            onClick={() => setEditModalOpen(false)}
            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSaveVideoDetails}
            disabled={updating}
            className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-white/10"
          >
            {updating ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditModal