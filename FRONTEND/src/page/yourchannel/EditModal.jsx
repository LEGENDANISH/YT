import React from "react"
import { X, Upload, Trash2 } from "lucide-react"

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={() => setEditModalOpen(false)}
    >
      {/* Modal */}
      <div
        className="w-full max-w-2xl max-h-[90vh] bg-black border border-neutral-800 rounded-lg shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 shrink-0">
          <h3 className="text-lg font-semibold text-white">
            Video details
          </h3>
          <button
            onClick={() => setEditModalOpen(false)}
            className="p-2 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">
              Thumbnail
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-md overflow-hidden bg-neutral-900 border border-neutral-800">
                {selectedVideo.thumbnailUrl ? (
                  <img
                    src={selectedVideo.thumbnailUrl}
                    alt="Thumbnail"
                    className="w-full aspect-video object-cover"
                  />
                ) : (
                  <div className="aspect-video flex items-center justify-center text-neutral-600">
                    No thumbnail
                  </div>
                )}
              </div>

              <label
                htmlFor="thumbnailInput"
                className="flex flex-col items-center justify-center border border-dashed border-neutral-700 rounded-md cursor-pointer hover:bg-neutral-900 transition"
              >
                <Upload className="w-6 h-6 text-neutral-400 mb-2" />
                <span className="text-sm text-neutral-400">
                  Upload new thumbnail
                </span>
                <input
                  id="thumbnailInput"
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="hidden"
                />
              </label>
            </div>

            {thumbnailPreview && (
              <div className="mt-3 border border-neutral-700 rounded-md overflow-hidden">
                <img
                  src={thumbnailPreview}
                  alt="Preview"
                  className="w-full aspect-video object-cover"
                />
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">
              Title
            </label>
            <input
              name="title"
              value={editForm.title}
              onChange={handleEditChange}
              className="w-full px-3 py-2 bg-black border border-neutral-800 rounded-md text-white focus:border-neutral-600 outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={editForm.description}
              onChange={handleEditChange}
              rows={4}
              className="w-full px-3 py-2 bg-black border border-neutral-800 rounded-md text-white focus:border-neutral-600 outline-none"
            />
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">
              Visibility
            </label>
            <select
              name="visibility"
              value={editForm.visibility}
              onChange={handleEditChange}
              className="w-full px-3 py-2 bg-black border border-neutral-800 rounded-md text-white"
            >
              <option value="PUBLIC">Public</option>
              <option value="PRIVATE">Private</option>
            </select>
          </div>

          {/* Schedule */}
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">
              Schedule
            </label>
            <input
              type="datetime-local"
              name="scheduledAt"
              value={editForm.scheduledAt}
              onChange={handleEditChange}
              className="w-full px-3 py-2 bg-black border border-neutral-800 rounded-md text-white"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-800 shrink-0">
          <button
            onClick={handleRemoveThumbnail}
            disabled={updating}
            className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Remove thumbnail
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 text-sm text-neutral-300 hover:text-white"
            >
              Cancel
            </button>

            <button
              onClick={handleSaveVideoDetails}
              disabled={updating}
              className="px-5 py-2 text-sm font-medium rounded-md bg-white text-black hover:bg-neutral-200 disabled:opacity-50"
            >
              Save
            </button>

            <button
              onClick={handleUpdateThumbnail}
              disabled={updating}
              className="px-4 py-2 text-sm rounded-md border border-neutral-700 text-neutral-200 hover:bg-neutral-900 disabled:opacity-50"
            >
              Update thumbnail
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditModal
