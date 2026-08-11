"use client";

import { ArrowLeft, Eye, Film, Globe2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { VibePlayer } from "@/components/vibe-player";

type LocalUpload = { title: string; description: string; category: string; visibility: string; url: string; filename?: string };

export function LocalVideoWatch() {
  const router = useRouter();
  const [video, setVideo] = useState<LocalUpload | null>(null);
  const [viewerId, setViewerId] = useState("guest");
  useEffect(() => {
    const stored = window.localStorage.getItem("vibetube-local-upload"); if (stored) setVideo(JSON.parse(stored));
    void fetch("/api/auth").then(async (response) => { const data = await response.json() as { user: { email: string } | null }; if (data.user) setViewerId(data.user.email); }).catch(() => undefined);
  }, []);
  if (!video) return <main className="profile-loading">No local upload found. <button onClick={() => router.push("/upload")}>Upload a video</button></main>;
  return <main className="local-watch"><header className="upload-nav"><button className="login-brand" onClick={() => router.push("/")}>VIBE<i>TUBE</i></button><button onClick={() => router.push("/upload")}><ArrowLeft size={17} /> Upload another</button></header><section><p className="published-line"><Globe2 size={15} /> VIDEO PUBLISHED LOCALLY</p><VibePlayer src={video.url} title={video.title} viewerId={viewerId} autoPlay /><div className="local-video-info"><span><Film size={17} /> {video.category} · {video.visibility.toLowerCase()}</span><h1>{video.title}</h1><p>{video.description}</p><button onClick={() => router.push("/")}>Go to home</button></div></section></main>;
}
