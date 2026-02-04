import { Card } from "@/components/ui/card"

export default function VideoSelector({ videos = [], selected, onSelect }) {
  return (
    <div className="flex gap-4 overflow-x-auto">
      {videos.map(video => (
        <Card
          key={video.id}
          onClick={() => onSelect(video)}
          className={`min-w-[260px] cursor-pointer p-3 transition
            ${selected?.id === video.id ? "border-primary" : ""}`}
        >
          <img
            src={video.thumbnailUrl}
            className="rounded-md mb-2"
          />
          <p className="font-medium line-clamp-2">{video.title}</p>
          <p className="text-sm text-muted-foreground">
            {video.views} views
          </p>
        </Card>
      ))}
    </div>
  )
}
