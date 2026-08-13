"use client";

import { Captions, Expand, LoaderCircle, Maximize, Pause, PictureInPicture2, Play, Settings2, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type VideoQuality = { label: string; url: string };
type VibePlayerProps = { src: string; poster?: string; title: string; viewerId?: string; autoPlay?: boolean; qualities?: VideoQuality[] };

const time = (value: number) => {
  if (!Number.isFinite(value)) return "0:00";
  const minutes = Math.floor(value / 60); const seconds = Math.floor(value % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

export function VibePlayer({ src, poster, title, viewerId = "guest", autoPlay = false, qualities }: VibePlayerProps) {
  const player = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const progressKey = useMemo(() => `vibetube-progress-${viewerId.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, [title, viewerId]);
  const options = qualities?.length ? qualities : [{ label: "Original", url: src }];
  const [quality, setQuality] = useState(options[0]);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [rate, setRate] = useState(1);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showQuality, setShowQuality] = useState(false);
  const [showSpeed, setShowSpeed] = useState(false);
  const [hasCaptions, setHasCaptions] = useState(false);
  const [captionsOn, setCaptionsOn] = useState(false);
  const [resumeAt, setResumeAt] = useState(0);

  useEffect(() => { setQuality(options[0]); }, [src]);
  useEffect(() => {
    if (!video.current) return;
    video.current.volume = volume;
    video.current.muted = muted;
  }, [volume, muted]);
  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      const element = event.target as HTMLElement;
      if (element?.tagName === "INPUT" || element?.tagName === "TEXTAREA" || !video.current) return;
      if (event.key === " ") { event.preventDefault(); toggle(); }
      if (event.key === "ArrowRight") seek(video.current.currentTime + 5);
      if (event.key === "ArrowLeft") seek(video.current.currentTime - 5);
      if (event.key.toLowerCase() === "m") setMuted((value) => !value);
      if (event.key.toLowerCase() === "f") void fullscreen();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const toggle = () => {
    if (!video.current) return;
    if (video.current.paused) void video.current.play().catch(() => setPlaying(false));
    else video.current.pause();
  };
  const seek = (next: number) => { if (video.current) video.current.currentTime = Math.max(0, Math.min(next, duration || next)); };
  const fullscreen = async () => { if (player.current && document.fullscreenElement !== player.current) await player.current.requestFullscreen().catch(() => undefined); else await document.exitFullscreen().catch(() => undefined); };
  const pip = async () => { if (!video.current || !document.pictureInPictureEnabled) return; if (document.pictureInPictureElement) await document.exitPictureInPicture(); else await video.current.requestPictureInPicture(); };
  const changeQuality = (option: VideoQuality) => {
    if (!video.current || option.url === quality.url) { setSettingsOpen(false); return; }
    const at = video.current.currentTime; const shouldPlay = !video.current.paused;
    setQuality(option); setSettingsOpen(false);
    window.setTimeout(() => { if (!video.current) return; video.current.currentTime = at; if (shouldPlay) void video.current.play().catch(() => undefined); }, 100);
  };
  const toggleCaptions = () => {
    const track = video.current?.textTracks[0];
    if (!track) return;
    track.mode = captionsOn ? "disabled" : "showing"; setCaptionsOn(!captionsOn);
  };
  const loaded = () => {
    if (!video.current) return;
    const saved = Number(window.localStorage.getItem(progressKey) ?? 0);
    setDuration(video.current.duration); setHasCaptions(video.current.textTracks.length > 0);
    if (saved > 5 && saved < video.current.duration - 10) { video.current.currentTime = saved; setResumeAt(saved); }
  };
  const handleDoubleClick = (e: React.MouseEvent<HTMLVideoElement>) => {
    if (!video.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    seek(video.current.currentTime + (clickX < rect.width / 2 ? -10 : 10));
  };
  return <div className="vibe-player" ref={player}>
    <video ref={video} poster={poster} autoPlay={autoPlay} preload="metadata" onLoadedMetadata={loaded} onDoubleClick={handleDoubleClick} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onTimeUpdate={() => { if (video.current) { setCurrent(video.current.currentTime); window.localStorage.setItem(progressKey, String(video.current.currentTime)); } }} onEnded={() => { window.localStorage.removeItem(progressKey); setPlaying(false); }}>
      <source src={quality.url} type={quality.url.endsWith(".webm") ? "video/webm" : "video/mp4"} />
      Your browser does not support video playback.
    </video>
    {!playing && <button className="player-center-play" onClick={toggle} aria-label="Play video"><Play size={28} fill="currentColor" /></button>}
    {resumeAt > 0 && current < resumeAt + 2 && <span className="player-resume">Resume from {time(resumeAt)}</span>}
    <div className="player-controls">
      <input className="seekbar" type="range" min="0" max={duration || 0} value={current} onChange={(event) => seek(Number(event.target.value))} style={{ "--progress": `${duration ? current / duration * 100 : 0}%` } as React.CSSProperties} aria-label="Seek video" />
      <div className="controls-row"><div className="controls-left"><button onClick={toggle} aria-label={playing ? "Pause" : "Play"}>{playing ? <Pause size={19} fill="currentColor" /> : <Play size={19} fill="currentColor" />}</button><button onClick={() => seek(current - 10)} aria-label="Back 10 seconds"><SkipBack size={18} /></button><button onClick={() => seek(current + 10)} aria-label="Forward 10 seconds"><SkipForward size={18} /></button><button onClick={() => setMuted(!muted)} aria-label={muted ? "Unmute" : "Mute"}>{muted || volume === 0 ? <VolumeX size={19} /> : <Volume2 size={19} />}</button><input className="volume-slider" type="range" min="0" max="1" step="0.05" value={muted ? 0 : volume} onChange={(event) => { const value = Number(event.target.value); setVolume(value); setMuted(value === 0); if (video.current) video.current.volume = value; }} aria-label="Volume" /><span className="player-time">{time(current)} / {time(duration)}</span></div><div className="controls-right">{hasCaptions && <button className={captionsOn ? "control-active" : ""} onClick={toggleCaptions} aria-label="Toggle captions"><Captions size={19} /></button>}<div className="settings-wrap"><button onClick={() => { setSettingsOpen(!settingsOpen); setShowQuality(false); setShowSpeed(false); }} aria-label="Player settings"><Settings2 size={19} /></button>{settingsOpen && <div className="player-menu"><button onClick={() => { setShowSpeed(!showSpeed); setShowQuality(false); }}>Playback speed <b>{rate}×</b></button>{showSpeed && <div className="menu-options">{[0.5, 0.75, 1, 1.25, 1.5, 2].map((value) => <button className={rate === value ? "selected" : ""} onClick={() => { setRate(value); if (video.current) video.current.playbackRate = value; setSettingsOpen(false); }} key={value}>{value}×</button>)}</div>}<button onClick={() => { setShowQuality(!showQuality); setShowSpeed(false); }}>Quality <b>{quality.label}</b></button>{showQuality && <div className="menu-options">{options.map((option) => <button className={quality.label === option.label ? "selected" : ""} onClick={() => changeQuality(option)} key={option.label}>{option.label}</button>)}</div>}</div>}</div><button onClick={() => void pip()} aria-label="Picture in picture"><PictureInPicture2 size={19} /></button><button onClick={() => void fullscreen()} aria-label="Fullscreen"><Maximize size={19} /></button></div></div>
    </div>
  </div>;
}
