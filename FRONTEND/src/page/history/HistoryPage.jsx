import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trash2 } from "lucide-react";

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [loading, setLoading] = useState(false);
const URL ="http://localhost:8000/api/feed/history"
  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${URL}?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setHistory(res.data.data);
    } catch (err) {
      console.error("Fetch history error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page]);

  const deleteOne = async (videoId) => {
    try {
      await axios.delete(`${URL}/${videoId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setHistory((prev) => prev.filter((item) => item.videoId !== videoId));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const clearAll = async () => {
    try {
      await axios.delete(`${URL}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setHistory([]);
    } catch (err) {
      console.error("Clear history error:", err);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Watch History</h1>
        <Button variant="destructive" onClick={clearAll}>
          Clear All
        </Button>
      </div>

      {/* History List */}
      {loading ? (
        <p>Loading...</p>
      ) : history.length === 0 ? (
        <p>No watch history found.</p>
      ) : (
        history.map((item) => (
          <Card key={item.id} className="flex gap-4 p-3">
            <img
              src={item.video.thumbnailUrl}
              alt="thumb"
              className="w-48 h-28 object-cover rounded-lg"
            />

            <CardContent className="flex-1 space-y-2">
              <h2 className="font-semibold text-lg">
                {item.video.title}
              </h2>

              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src={item.video.user.avatarUrl} />
                  <AvatarFallback>
                    {item.video.user.displayName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <span className="text-sm text-gray-500">
                  {item.video.user.displayName}
                </span>
              </div>

              <p className="text-sm text-gray-500">
                Watched on {new Date(item.watchedAt).toLocaleDateString()}
              </p>
            </CardContent>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteOne(item.videoId)}
            >
              <Trash2 className="w-5 h-5 text-red-500" />
            </Button>
          </Card>
        ))
      )}

      {/* Pagination */}
      <div className="flex justify-center gap-4 mt-6">
        <Button
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
        >
          Previous
        </Button>

        <span>Page {page}</span>

        <Button onClick={() => setPage((prev) => prev + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default HistoryPage;
