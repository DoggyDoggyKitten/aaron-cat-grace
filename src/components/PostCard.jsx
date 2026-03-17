import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import aaronAvatar from "../avatars/aaron.png";
import catAvatar from "../avatars/cat.png";
import graceAvatar from "../avatars/grace.png";
import AudioBar from "./AudioBar";

const HOST_CONFIG = {
  Aaron: { color: "#E8A87C", avatar: aaronAvatar },
  Grace: { color: "#2D6A4F", avatar: graceAvatar },
  Cat:   { color: "#5B9BD5", avatar: catAvatar   },
};

function ImageLightbox({ src, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
      onClick={onClose}
    >
      <img
        src={src}
        alt=""
        onClick={(e) => e.stopPropagation()}
        className="object-contain"
        style={{ maxWidth: "80vw", maxHeight: "75vh"}}
      />
    </div>,
    document.body
  );
}

function Thumb({ src, onClick, style }) {
  return (
    <div
      className="overflow-hidden rounded-lg cursor-pointer"
      style={{ ...style, backgroundColor: "#e5e0d8" }}
      onClick={() => onClick(src)}
    >
      <img src={src} alt="" className="w-full h-full object-cover hover:opacity-90 transition-opacity" />
    </div>
  );
}

function ImageGrid({ urls }) {
  const [lightbox, setLightbox] = useState(null);
  const count = urls.length;

  let grid = null;

  if (count === 1) {
    grid = (
      <Thumb src={urls[0]} onClick={setLightbox} style={{ height: 220 }} />
    );
  } else if (count === 2) {
    grid = (
      <div className="flex gap-1" style={{ height: 260 }}>
        <Thumb src={urls[0]} onClick={setLightbox} style={{ flex: 1 }} />
        <Thumb src={urls[1]} onClick={setLightbox} style={{ flex: 1 }} />
      </div>
    );
  } else if (count === 3) {
    grid = (
      <div className="flex gap-1" style={{ height: 260 }}>
        <Thumb src={urls[0]} onClick={setLightbox} style={{ flex: 1 }} />
        <div className="flex flex-col gap-1" style={{ flex: 1 }}>
          <Thumb src={urls[1]} onClick={setLightbox} style={{ flex: 1, height: "50%" }} />
          <Thumb src={urls[2]} onClick={setLightbox} style={{ flex: 1, height: "50%" }} />
        </div>
      </div>
    );
  } else if (count === 4) {
    grid = (
      <div className="flex flex-col gap-1">
        <div className="flex gap-1" style={{ height: 140 }}>
          <Thumb src={urls[0]} onClick={setLightbox} style={{ flex: 1 }} />
          <Thumb src={urls[1]} onClick={setLightbox} style={{ flex: 1 }} />
        </div>
        <div className="flex gap-1" style={{ height: 140 }}>
          <Thumb src={urls[2]} onClick={setLightbox} style={{ flex: 1 }} />
          <Thumb src={urls[3]} onClick={setLightbox} style={{ flex: 1 }} />
        </div>
      </div>
    );
  } else {
    grid = (
      <div className="flex flex-col gap-1">
        <div className="flex gap-1" style={{ height: 180 }}>
          <Thumb src={urls[0]} onClick={setLightbox} style={{ flex: 1 }} />
          <Thumb src={urls[1]} onClick={setLightbox} style={{ flex: 1 }} />
        </div>
        <div className="flex gap-1" style={{ height: 140 }}>
          <Thumb src={urls[2]} onClick={setLightbox} style={{ flex: 1 }} />
          <Thumb src={urls[3]} onClick={setLightbox} style={{ flex: 1 }} />
          <Thumb src={urls[4]} onClick={setLightbox} style={{ flex: 1 }} />
        </div>
      </div>
    );
  }

  return (
    <>
      {grid}
      {lightbox && <ImageLightbox src={lightbox} onClose={() => setLightbox(null)} />}
    </>
  );
}

export default function PostCard({ post, onPlay, currentPostId, playing, progress, duration }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const config = HOST_CONFIG[post.host];

  const isThisPost = currentPostId === post.id;
  const isThisPlaying = playing && isThisPost;
  const barProgress = isThisPost ? progress : 0;

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  // Collect all image urls (support both old image_url and new image_urls)
  const imageUrls = post.image_urls?.length > 0
    ? post.image_urls
    : post.image_url
    ? [post.image_url]
    : [];

  return (
    <div className="post-card py-4 px-5 cursor-pointer">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <img
            src={config.avatar}
            alt={post.host}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            style={{ border: "2px solid #E8A87C" }}
          />
          <div>
            <span className="font-bold text-sm" style={{ color: config.color }}>
              {post.host}
            </span>
          </div>
        </div>
        <span className="text-zinc-400 text-xs">
          {post.created_at ? new Date(post.created_at).toLocaleDateString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
        </span>
      </div>

      {/* Text */}
      {post.text && (
        <p className="text-zinc-800 text-sm leading-relaxed whitespace-pre-line mb-4">
          {post.text}
        </p>
      )}

      {/* Images */}
      {imageUrls.length > 0 && (
        <div className="mb-4">
          <ImageGrid urls={imageUrls} />
        </div>
      )}

      {/* Audio bar */}
      {post.audio_url && (
        <AudioBar
          host={post.host}
          audio={{ src: post.audio_url, duration: 0 }}
          isPlaying={isThisPlaying}
          progress={barProgress}
          duration={isThisPost ? duration : null}
          onPlay={() => onPlay(post)}
        />
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-5 mt-3 pt-3 border-t border-zinc-100">
        <button
          onClick={(e) => { e.stopPropagation(); handleLike(); }}
          className="flex items-center gap-1.5 text-sm transition-colors"
          style={{ color: liked ? "#ef4444" : "#a1a1aa" }}
        >
          <span>{liked ? "♥" : "♡"}</span>
          <span>{likeCount}</span>
        </button>
        <button
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 text-sm transition-colors"
          style={{ color: "#a1a1aa" }}
        >
          <span>↗</span>
          <span>{post.shares ?? 0}</span>
        </button>
      </div>
    </div>
  );
}
