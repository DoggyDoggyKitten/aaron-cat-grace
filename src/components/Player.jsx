import { useRef, useEffect, useState } from "react";

const HOST_CONFIG = {
  Aaron: { color: "#E8A87C" },
  Grace: { color: "#2D6A4F" },
  Cat:   { color: "#5B9BD5" },
};

function formatTime(s) {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

export default function Player({ post, playing, onPlayingChange, onProgressChange, onDurationChange }) {
  const audioRef = useRef(null);
  const config = HOST_CONFIG[post?.host] || HOST_CONFIG.Aaron;
  const audioSrc = post?.audio_url;
  const [volume, setVolume] = useState(1);
  const [showVolume, setShowVolume] = useState(false);

  // Load new src when post changes
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (audioSrc) {
      el.src = audioSrc;
      el.load();
    }
  }, [post?.id, audioSrc]);

  // Sync play/pause
  useEffect(() => {
    const el = audioRef.current;
    if (!el || !audioSrc) return;
    if (playing) { el.play().catch(() => {}); }
    else { el.pause(); }
  }, [playing, audioSrc]);

  // Report progress back to App
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onTimeUpdate = () => {
      onProgressChange(el.currentTime / (el.duration || 1));
    };
    const onEnded = () => onPlayingChange(false);
    const onLoaded = () => onDurationChange(el.duration);
    el.addEventListener("timeupdate", onTimeUpdate);
    el.addEventListener("ended", onEnded);
    el.addEventListener("loadedmetadata", onLoaded);
    return () => {
      el.removeEventListener("timeupdate", onTimeUpdate);
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("loadedmetadata", onLoaded);
    };
  }, [onProgressChange, onPlayingChange]);

  const handleVolume = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  const handleSeek = (e) => {
    const el = audioRef.current;
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    if (el && el.duration) el.currentTime = ratio * el.duration;
    onProgressChange(ratio);
  };

  const duration = audioRef.current?.duration || 0;
  const currentTime = (audioRef.current?.currentTime) || 0;

  return (
    <div
      className="flex flex-col gap-2 px-4 py-3 flex-shrink-0"
      style={{
        backgroundColor: "#FAF6F0",
        borderTop: "2px solid #e5e0d8",
        borderBottomLeftRadius: "10px",
        borderBottomRightRadius: "10px",
      }}
    >
      <audio ref={audioRef} />

      {/* Top row */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onPlayingChange(!playing)}
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-transform active:scale-90"
          style={{ backgroundColor: config.color, border: "2px solid #1f1f1f" }}
        >
          <span className="text-white text-xs font-bold" style={{ marginLeft: playing ? 0 : 2 }}>
            {playing ? "⏸" : "▶"}
          </span>
        </button>

        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-xs font-bold truncate" style={{ color: config.color }}>
            {post?.host || "—"}
          </span>
          <span className="text-xs text-zinc-400 truncate">
            {audioSrc ? (post?.episode_id || "podcast") : "选择一集开始收听"}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-zinc-400 tabular-nums">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <div className="relative flex items-center">
            <button
              onClick={() => setShowVolume(v => !v)}
              className="flex items-center justify-center"
              style={{ width: 20, height: 20 }}
            >
              {volume === 0 ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={config.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
              ) : volume < 0.5 ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={config.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={config.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
              )}
            </button>
            {showVolume && (
              <div
                className="absolute bottom-7 right-0 flex flex-col items-center gap-1 px-2 py-2 rounded-lg"
                style={{ backgroundColor: "#FAF6F0", border: "1.5px solid #e5e0d8", boxShadow: "2px 2px 0px #e5e0d8" }}
              >
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.02"
                  value={volume}
                  onChange={handleVolume}
                  className="h-20 cursor-pointer"
                  style={{
                    writingMode: "vertical-lr",
                    direction: "rtl",
                    appearance: "slider-vertical",
                    accentColor: config.color,
                    width: 4,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div
        className="relative h-2 rounded-full cursor-pointer"
        style={{ backgroundColor: "#e5e0d8" }}
        onClick={handleSeek}
      >
        <div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{
            width: `${(currentTime / (duration || 1)) * 100}%`,
            backgroundColor: config.color,
          }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full"
          style={{
            left: `calc(${(currentTime / (duration || 1)) * 100}% - 7px)`,
            backgroundColor: "#FAF6F0",
            border: `2.5px solid ${config.color}`,
            boxShadow: "1px 1px 0px #1f1f1f",
          }}
        />
      </div>
    </div>
  );
}
