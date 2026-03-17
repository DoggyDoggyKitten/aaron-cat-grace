import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import cameraCat from "../avatars/camera-cat.png";
import cameraAaron from "../avatars/cameraAaron.png";
import cameraGrace from "../avatars/cameraGrace.png";
import headphoneCat from "../avatars/headphone-cat.png";
import headphoneAaron from "../avatars/headphoneAaron.png";
import headphoneGrace from "../avatars/headphoneGrace.png";

const CAMERA_ICON = { Aaron: cameraAaron, Cat: cameraCat, Grace: cameraGrace };
const HEADPHONE_ICON = { Aaron: headphoneAaron, Cat: headphoneCat, Grace: headphoneGrace };

const HOSTS = ["Aaron", "Cat", "Grace"];
const HOST_COLOR = {
  Aaron: "#E8A87C",
  Cat: "#5B9BD5",
  Grace: "#2D6A4F",
};

function LoginWall({ onUnlock }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input === process.env.REACT_APP_ADMIN_PASSWORD) {
      sessionStorage.setItem("admin_authed", "1");
      onUnlock();
    } else {
      setError(true);
      setInput("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: "#1f1f1f" }}>
      <div
        className="w-full max-w-sm p-6 rounded-xl"
        style={{
          backgroundColor: "#FAF6F0",
          border: "3px solid #E8A87C",
          boxShadow: "6px 6px 0px #E8A87C",
        }}
      >
        <h1 className="text-xl font-bold mb-1" style={{ color: "#1f1f1f" }}>Admin</h1>
        <p className="text-xs text-zinc-400 mb-6">请输入密码继续</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="password"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(false); }}
            placeholder="密码"
            autoFocus
            className="w-full rounded-lg px-3 py-2 text-sm text-zinc-800 outline-none"
            style={{
              backgroundColor: "#f0ebe3",
              border: `1.5px solid ${error ? "#ef4444" : "#d4cfc8"}`,
            }}
          />
          {error && <p className="text-xs text-red-500">密码错误</p>}
          <button
            type="submit"
            className="py-2 rounded-lg font-bold text-white"
            style={{ backgroundColor: "#E8A87C", border: "2px solid #1f1f1f" }}
          >
            进入
          </button>
        </form>
      </div>
    </div>
  );
}

function ImageUploader({ images, onAdd, onRemove, host }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const MAX_IMAGES = 5;

  const addFiles = (files) => {
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      onAdd({ file, preview: URL.createObjectURL(file) });
    });
  };

  const isFull = images.length >= MAX_IMAGES;

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (!isFull) addFiles(e.dataTransfer.files);
  };

  // Empty state: full drop zone
  if (images.length === 0) {
    return (
      <div>
        <label className="text-xs font-bold text-zinc-500 mb-2 block">图片（可选）</label>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
        <div
          onClick={() => inputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className="flex flex-col items-center justify-center gap-2 rounded-xl py-6 cursor-pointer transition-all"
          style={{
            border: `2px dashed ${dragging ? "#E8A87C" : "#d4cfc8"}`,
            backgroundColor: dragging ? "#f5efe6" : "#f0ebe3",
          }}
        >
          <img src={CAMERA_ICON[host]} alt="" className="w-24 h-24 object-contain" />
        </div>
      </div>
    );
  }

  // Has images: show preview grid
  return (
    <div>
      <label className="text-xs font-bold text-zinc-500 mb-2 block">图片（可选）</label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
      />
      <div
        className="flex flex-wrap gap-2 p-2 rounded-xl"
        style={{ backgroundColor: "#f0ebe3", border: "1.5px solid #d4cfc8" }}
        onDragOver={(e) => { e.preventDefault(); if (!isFull) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        {images.map((img, i) => (
          <div key={i} className="relative flex-shrink-0" style={{ width: 80, height: 80 }}>
            <img
              src={img.preview}
              alt=""
              className="w-full h-full object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: "#1f1f1f", fontSize: 10, lineHeight: 1 }}
            >
              ✕
            </button>
          </div>
        ))}

        {/* Add more button — hidden when full */}
        {!isFull && (
          <div
            onClick={() => inputRef.current.click()}
            className="flex-shrink-0 flex items-center justify-center rounded-lg cursor-pointer transition-all"
            style={{
              width: 80,
              height: 80,
              border: `2px dashed ${dragging ? "#E8A87C" : "#c4bfb8"}`,
              backgroundColor: dragging ? "#f5efe6" : "transparent",
            }}
          >
            <span className="text-zinc-400 text-xl">+</span>
          </div>
        )}
      </div>
    </div>
  );
}

function AudioDropZone({ file, onFile, onClear, host }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) onFile(dropped);
  };

  return (
    <div>
      <label className="text-xs font-bold text-zinc-500 mb-2 block">音频 MP3（可选）</label>
      <input
        ref={inputRef}
        type="file"
        accept="audio/mp3,audio/*"
        className="hidden"
        onChange={(e) => e.target.files[0] && onFile(e.target.files[0])}
      />

      {!file ? (
        <div
          onClick={() => inputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className="flex flex-col items-center justify-center gap-2 rounded-xl py-6 cursor-pointer transition-all"
          style={{
            border: `2px dashed ${dragging ? "#E8A87C" : "#d4cfc8"}`,
            backgroundColor: dragging ? "#f5efe6" : "#f0ebe3",
          }}
        >
          <img src={HEADPHONE_ICON[host]} alt="" className="w-24 h-24 object-contain" />
        </div>
      ) : (
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3"
          style={{ backgroundColor: "#f0ebe3", border: "1.5px solid #d4cfc8" }}
        >
          <span className="text-xl">🎙️</span>
          <span className="text-xs text-zinc-600 flex-1 truncate">{file.name}</span>
          <button
            type="button"
            onClick={onClear}
            className="text-zinc-400 text-sm font-bold flex-shrink-0"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(sessionStorage.getItem("admin_authed") === "1");
  const [host, setHost] = useState("Aaron");
  const [text, setText] = useState("");
  const [images, setImages] = useState([]); // [{ file, preview }]
  const [audioFile, setAudioFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  if (!authed) return <LoginWall onUnlock={() => setAuthed(true)} />;

  const handleAddImage = (img) => setImages((prev) => [...prev, img]);

  const handleRemoveImage = (index) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadFile = async (file, bucket) => {
    const ext = file.name.split(".").pop();
    const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(filename, file);
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(filename);
    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text && images.length === 0 && !audioFile) {
      setMessage({ type: "error", text: "至少填写文字、图片或音频其中一项" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      let audio_url = null;
      if (audioFile) audio_url = await uploadFile(audioFile, "episodes");

      const image_urls = images.length > 0
        ? await Promise.all(images.map((img) => uploadFile(img.file, "images")))
        : null;
      const { error } = await supabase.from("posts").insert({
        host,
        text: text || null,
        image_urls,
        audio_url,
      });
      if (error) throw error;

      images.forEach((img) => URL.revokeObjectURL(img.preview));
      setTimeout(() => navigate("/"), 300);
      setText("");
      setImages([]);
      setAudioFile(null);
    } catch (err) {
      setMessage({ type: "error", text: `发帖失败：${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: "#1f1f1f" }}>
      <div
        className="w-full max-w-lg p-6 rounded-xl"
        style={{
          backgroundColor: "#FAF6F0",
          border: "3px solid #E8A87C",
          boxShadow: "6px 6px 0px #E8A87C",
        }}
      >
        <h1 className="text-xl font-bold mb-6" style={{ color: "#1f1f1f" }}>发新帖子</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Host selector */}
          <div>
            <label className="text-xs font-bold text-zinc-500 mb-2 block">主播</label>
            <div className="flex gap-2">
              {HOSTS.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHost(h)}
                  className="flex-1 py-2 rounded-lg text-sm font-bold transition-all"
                  style={{
                    backgroundColor: host === h ? HOST_COLOR[h] : "#f0ebe3",
                    color: host === h ? "white" : "#666",
                    border: `2px solid ${HOST_COLOR[h]}`,
                  }}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          {/* Text */}
          <div>
            <label className="text-xs font-bold text-zinc-500 mb-2 block">文字内容（可选）</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              placeholder="写点什么..."
              className="w-full rounded-lg px-3 py-2 text-sm text-zinc-800 resize-none outline-none"
              style={{ backgroundColor: "#f0ebe3", border: "1.5px solid #d4cfc8" }}
            />
          </div>

          {/* Image upload with preview */}
          <ImageUploader
            images={images}
            onAdd={handleAddImage}
            onRemove={handleRemoveImage}
            host={host}
          />

          {/* Audio upload */}
          <AudioDropZone
            file={audioFile}
            onFile={setAudioFile}
            onClear={() => setAudioFile(null)}
            host={host}
          />

          {/* Message */}
          {message && (
            <p className={`text-sm font-medium ${message.type === "success" ? "text-green-600" : "text-red-500"}`}>
              {message.text}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="py-3 rounded-lg font-bold text-white transition-opacity"
            style={{
              backgroundColor: HOST_COLOR[host],
              border: "2px solid #1f1f1f",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "发布中..." : "发帖"}
          </button>

        </form>
      </div>
    </div>
  );
}
