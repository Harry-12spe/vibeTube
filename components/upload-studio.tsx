"use client";

import { ArrowLeft, CheckCircle2, FileVideo2, Film, LoaderCircle, Play, UploadCloud } from "lucide-react";
import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { upload as blobUpload } from "@vercel/blob/client";

type UploadStage = "select" | "uploading" | "details" | "publishing";

export function UploadStudio() {
  const router = useRouter();
  const [stage, setStage] = useState<UploadStage>("select");
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Other");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [visibility, setVisibility] = useState("PUBLIC");
  const [videoUrl, setVideoUrl] = useState("");
  const [uploadId, setUploadId] = useState("");
  const [error, setError] = useState("");

  const chooseFile = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    if (!['video/mp4', 'video/webm', 'video/quicktime'].includes(selected.type)) { setError("Choose an MP4, WebM, or MOV video file."); return; }
    if (selected.size > 500 * 1024 * 1024) { setError("For the local demo, keep your video under 500 MB."); return; }
    setFile(selected);
    setTitle(selected.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
    setError("");
  };

  const upload = async () => {
    if (!file) { setError("Choose a video first."); return; }
    setStage("uploading"); setError("");
    
    try {
      const extension = file.name.split('.').pop() || "mp4";
      const newBlob = await blobUpload(`${Date.now()}-${crypto.randomUUID()}.${extension}`, file, {
        access: 'public',
        handleUploadUrl: '/api/blob',
      });
      
      setVideoUrl(newBlob.url);
      
      // Still notify our backend to record the partial upload state so we get an ID
      const body = { url: newBlob.url, title: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ") };
      const response = await fetch("/api/uploads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const payload = await response.json() as { id?: string; error?: string };
      
      setUploadId(payload.id ?? ""); setStage("details");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed."); setStage("select");
    }
  };

  const publish = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !videoUrl) { setError("Add a title and finish uploading your video."); return; }
    setStage("publishing"); setError("");
    try {
      if (uploadId) {
        let thumbnailUrl = "";
        if (thumbnail) {
          const extension = thumbnail.name.split('.').pop() || "jpg";
          const thumbBlob = await blobUpload(`thumb-${Date.now()}-${crypto.randomUUID()}.${extension}`, thumbnail, {
            access: 'public',
            handleUploadUrl: '/api/blob',
          });
          thumbnailUrl = thumbBlob.url;
        }

        const body = JSON.stringify({
          id: uploadId,
          title,
          description,
          category,
          visibility,
          thumbnailUrl
        });
        
        const response = await fetch("/api/uploads", { method: "PATCH", headers: { "Content-Type": "application/json" }, body });
        if (!response.ok) throw new Error("Video uploaded, but its details could not be saved.");
      }
      window.localStorage.setItem("vibetube-local-upload", JSON.stringify({ title: title.trim(), description: description.trim() || "No description added.", category, visibility, url: videoUrl, filename: file?.name }));
      router.push("/watch/local-upload");
    } catch (publishError) { setError(publishError instanceof Error ? publishError.message : "Could not publish video."); setStage("details"); }
  };

  return <main className="upload-page">
    <header className="upload-nav"><button className="login-brand" onClick={() => router.push("/")}>VIBE<i>TUBE</i></button><button onClick={() => router.push("/")}><ArrowLeft size={17} /> Back to home</button></header>
    <section className="upload-shell"><div className="upload-heading"><p>CREATOR STUDIO</p><h1>Upload a video</h1><span>Share your story with the VibeTube community.</span></div><div className="upload-steps"><b className={stage === "select" || stage === "uploading" ? "current" : "done"}>1 <span>Video file</span></b><i /><b className={stage === "details" || stage === "publishing" ? "current" : ""}>2 <span>Details</span></b><i /><b className={stage === "publishing" ? "current" : ""}>3 <span>Publish</span></b></div>
      {(stage === "select" || stage === "uploading") && <section className="upload-drop"><FileVideo2 size={42} /><h2>{file ? file.name : "Select your video"}</h2><p>{file ? `${(file.size / 1024 / 1024).toFixed(1)} MB · ready to upload` : "MP4, WebM, or MOV · maximum 500 MB for local demo"}</p><label className="pick-video"><UploadCloud size={18} /> {file ? "Choose another file" : "Choose video"}<input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={chooseFile} /></label>{error && <small className="upload-error">{error}</small>}<button className="continue-upload" disabled={!file || stage === "uploading"} onClick={upload}>{stage === "uploading" ? <><LoaderCircle className="spin" size={18} /> Uploading video…</> : <>Continue <Play size={16} fill="currentColor" /></>}</button></section>}
      {(stage === "details" || stage === "publishing") && <form className="video-details" onSubmit={publish}><div className="upload-preview"><video src={videoUrl} controls preload="metadata" /><span><CheckCircle2 size={16} /> Upload complete</span></div><div className="detail-fields"><label>Title<input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} /></label><label>Description<textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={5000} placeholder="Tell viewers about your video" /></label><label>Thumbnail<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setThumbnail(e.target.files?.[0] ?? null)} /></label><div className="select-row"><label>Type<select value={category} onChange={(event) => setCategory(event.target.value)}><option>Movie</option><option>Song</option><option>Music Video</option><option>Other</option></select></label><label>Visibility<select value={visibility} onChange={(event) => setVisibility(event.target.value)}><option value="PUBLIC">Public</option><option value="UNLISTED">Unlisted</option><option value="PRIVATE">Private</option></select></label></div><button type="submit" disabled={stage === "publishing"}>{stage === "publishing" ? <><LoaderCircle className="spin" size={17} /> Publishing…</> : <><Film size={17} /> Publish video</>}</button>{error && <small className="upload-error">{error}</small>}</div></form>}
    </section>
  </main>;
}
