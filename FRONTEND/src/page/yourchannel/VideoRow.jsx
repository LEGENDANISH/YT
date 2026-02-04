import {
  BarChart3,
  Pencil,
  MessageSquare,
  Globe,
  Trash2,
  X,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import axios from "axios"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import {
  formatNumber,
  formatDuration,
  formatDate,
} from "./formatters"

const VideoRow = ({ video, handleEditClick, onDelete }) => {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [loading, setLoading] = useState(false)

  const firstWord = video.title.split(" ")[0]
const API_BASE_URL = "http://localhost:8000/api"
const handleDelete = async () => {
  try {
    setLoading(true)

    const token = localStorage.getItem("token") // or your key

    await axios.delete(
      `${API_BASE_URL}/videos/${video.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    onDelete?.(video.id)
    setOpen(false)
    setConfirmText("")
  } catch (err) {
    console.error("Delete failed", err)
  } finally {
    setLoading(false)
  }
}


  return (
    <>
      <div className="group flex items-center gap-4 px-4 py-3 bg-black hover:bg-neutral-900 transition">
        {/* Checkbox */}
        <input type="checkbox" className="accent-neutral-500" />

        {/* Thumbnail */}
        <div className="relative w-40 aspect-video rounded-md overflow-hidden bg-neutral-800 shrink-0">
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-1 right-1 text-xs bg-black/80 px-1.5 py-0.5 rounded">
            {formatDuration(video.duration)}
          </span>
        </div>

        {/* Title + Description */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-white truncate">
            {video.title}
          </h4>
          <p className="text-xs text-neutral-400 truncate">
            {video.description || "Add description"}
          </p>

          {/* Hover Actions */}
          <div className="mt-2 hidden group-hover:flex items-center gap-4 text-xs text-neutral-400">
            <button
              onClick={() =>
                navigate(`/studio/analytics/video/${video.id}`)
              }
              className="hover:text-white flex items-center gap-1"
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </button>

            <button
              onClick={() => handleEditClick(video)}
              className="hover:text-white flex items-center gap-1"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>

            <button className="hover:text-white flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              Comments
            </button>

            {/* Delete */}
            <button
              onClick={() => setOpen(true)}
              className="hover:text-red-500 flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>

        {/* Visibility */}
        <div className="w-28 text-sm text-neutral-300 flex items-center gap-2">
          <Globe className="w-4 h-4" />
          {video.visibility}
        </div>

        {/* Date */}
        <div className="w-32 text-sm text-neutral-400">
          {formatDate(video.publishedAt || video.createdAt)}
        </div>

        {/* Views */}
        <div className="w-20 text-sm text-neutral-300 text-right">
          {formatNumber(video.views)}
        </div>

        {/* Likes */}
        <div className="w-20 text-sm text-neutral-500 text-right">
          —
        </div>
      </div>

      {/* Delete Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-neutral-900 border-neutral-800 text-white">
          {/* Close */}
          <button
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>

          <DialogHeader>
            <DialogTitle>
              Delete this video permanently?
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-sm text-neutral-300">
            <p>
              Type <span className="font-semibold text-white">
                {firstWord}
              </span>{" "}
              to confirm deletion.
            </p>

            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={`Type "${firstWord}"`}
              className="bg-neutral-800 border-neutral-700"
            />

            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>

              <Button
                variant="destructive"
                disabled={confirmText !== firstWord || loading}
                onClick={handleDelete}
              >
                {loading ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default VideoRow
