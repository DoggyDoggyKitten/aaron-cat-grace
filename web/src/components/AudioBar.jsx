import { useEffect, useRef, useState } from "react";

const HOST_COLOR = {
  Aaron: "#E8A87C",
  Grace: "#2D6A4F",
  Cat: "#5B9BD5",
};

function formatTime(s) {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

// Fake waveform bars (static decoration)
const BARS = Array.from({ length: 40 }, (_, i) =>
  0.3 + 0.7 * Math.abs(Math.sin(i * 0.8 + i * 0.3))
);

export default function AudioBar({ host, audio, isPlaying, progress, duration, onPlay }) {
  const probeRef = useRef(null);
  const [realDuration, setRealDuration] = useState(null);

  // Silently probe the audio file to get real duration before playback
  useEffect(() => {
    if (!audio?.src) return;
    const el = probeRef.current;
    if (!el) return;
    const onLoaded = () => setRealDuration(el.duration);
    el.addEventListener("loadedmetadata", onLoaded);
    el.src = audio.src;
    el.load();
    return () => el.removeEventListener("loadedmetadata", onLoaded);
  }, [audio?.src]);
  const color = HOST_COLOR[host] || "#E8A87C";
  const filled = Math.round(progress * BARS.length);

  // Priority: live duration from Player > probed duration > fallback from posts.js
  const displayDuration = duration || realDuration || audio.duration;

  return (
    <div
      className="flex items-center gap-2 rounded-xl px-3 py-2 mt-1"
      style={{ backgroundColor: "#f0ebe3", border: `1.5px solid ${color}` }}
    >
      <audio ref={probeRef} preload="metadata" style={{ display: "none" }} />
      {/* Play button */}
      <button
        onClick={(e) => { e.stopPropagation(); onPlay(); }}
        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-transform active:scale-90"
        style={{ backgroundColor: color, border: "1.5px solid #1f1f1f" }}
      >
        <span className="text-white font-bold" style={{ fontSize: 9, marginLeft: isPlaying ? 0 : 1 }}>
          {isPlaying ? "⏸" : "▶"}
        </span>
      </button>

      {/* Waveform */}
      <div className="flex items-center gap-px flex-1 h-6">
        {BARS.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-full transition-colors"
            style={{
              height: `${h * 100}%`,
              backgroundColor: i < filled ? color : "#d4cfc8",
            }}
          />
        ))}
      </div>

      {/* Duration */}
      <span className="tabular-nums flex-shrink-0" style={{ color, fontSize: 10 }}>
        {formatTime(displayDuration)}
      </span>
    </div>
  );
}
