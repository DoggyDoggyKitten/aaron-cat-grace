import { useState, useCallback, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import logo from "./logo.png";
import PostCard from "./components/PostCard";
import Player from "./components/Player";
import Admin from "./pages/Admin";
import { supabase } from "./lib/supabase";

export default function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPost, setCurrentPost] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    async function fetchPosts() {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error) setPosts(data);
      setLoading(false);
    }
    fetchPosts();
  }, []);

  const handlePlay = useCallback((post) => {
    if (currentPost?.id === post.id) {
      // Toggle play/pause on same post
      setPlaying(p => !p);
    } else {
      setCurrentPost(post);
      setPlaying(true);
      setProgress(0);
    }
  }, [currentPost]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<Admin />} />
        <Route path="/" element={<Feed
          posts={posts}
          loading={loading}
          currentPost={currentPost}
          playing={playing}
          progress={progress}
          duration={duration}
          handlePlay={handlePlay}
          setPlaying={setPlaying}
          setProgress={setProgress}
          setDuration={setDuration}
        />} />
      </Routes>
    </BrowserRouter>
  );
}

function Feed({ posts, loading, currentPost, playing, progress, duration, handlePlay, setPlaying, setProgress, setDuration }) {
  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: "#1f1f1f" }}>

      {/* Logo */}
      <div className="flex items-center justify-center" style={{ height: "33vh" }}>
        <img
          src={logo}
          alt="Aaron Cat and Grace"
          className="h-full object-contain py-6"
        />
      </div>

      {/* Container */}
      <div
        className="mx-auto w-full max-w-xl flex flex-col"
        style={{
          height: "62vh",
          marginBottom: "2vh",
          borderRadius: "12px",
          borderTop: "none",
          borderLeft: "none",
          borderRight: "3px solid #E8A87C",
          borderBottom: "3px solid #E8A87C",
          boxShadow: "6px 6px 0px #E8A87C",
          backgroundColor: "#FAF6F0",
        }}
      >
        {/* Scrollable posts */}
        <div className="flex-1 overflow-y-auto hide-scrollbar pt-2">
          <div className="flex flex-col divide-y divide-zinc-200">
            {loading ? (
              <p className="text-zinc-400 text-sm text-center py-10">加载中...</p>
            ) : posts.length === 0 ? (
              <p className="text-zinc-400 text-sm text-center py-10">还没有帖子</p>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onPlay={handlePlay}
                  currentPostId={currentPost?.id ?? null}
                  playing={playing}
                  progress={progress}
                  duration={duration}
                />
              ))
            )}
          </div>
        </div>

        {/* Sticky player */}
        <Player
          post={currentPost}
          playing={playing}
          onPlayingChange={setPlaying}
          onProgressChange={setProgress}
          onDurationChange={setDuration}
        />
      </div>

    </div>
  );
}

