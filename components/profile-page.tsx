"use client";

import { ArrowLeft, Check, Clock3, Heart, ListVideo, Pencil, Play, Settings2, UserRound } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Profile = { name: string; email: string; avatar: string };
export function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(() => {
    void fetch("/api/auth", { cache: "no-store" }).then(async (response) => {
      const data = await response.json() as { user: Profile | null };
      if (!data.user) { router.replace("/login"); return; }
      setProfile(data.user); setName(data.user.name);
    }).catch(() => router.replace("/login"));
  }, [router]);
  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!profile || name.trim().length < 2) return;
    const response = await fetch("/api/auth", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name.trim(), avatar: profile.avatar }) });
    const result = await response.json() as { user?: Profile; error?: string };
    if (!response.ok || !result.user) { setNotice(result.error ?? "Could not save profile"); return; }
    setProfile(result.user); setEditing(false); setNotice("Profile saved"); window.setTimeout(() => setNotice(""), 2200);
  };
  const signOut = async () => { await fetch("/api/auth", { method: "DELETE" }); router.push("/login"); router.refresh(); };
  const uploadAvatar = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;
    if (!file.type.startsWith("image/")) { setNotice("Choose an image file for your profile photo"); return; }
    const reader = new FileReader();
    reader.onload = async () => {
      const response = await fetch("/api/auth", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ avatar: String(reader.result) }) });
      const result = await response.json() as { user?: Profile; error?: string };
      if (!response.ok || !result.user) { setNotice(result.error ?? "Could not update profile photo"); return; }
      setProfile(result.user); setNotice("Profile photo updated"); window.setTimeout(() => setNotice(""), 2200);
    };
    reader.readAsDataURL(file);
  };
  if (!profile) return <main className="profile-loading">Loading your profile…</main>;
  return <main className="profile-page">
    <header className="profile-nav"><button className="login-brand" onClick={() => router.push("/")}>VIBE<i>TUBE</i></button><button className="back-home" onClick={() => router.push("/")}><ArrowLeft size={17} /> Back to home</button></header>
    <section className="profile-hero"><div className="profile-cover" /><div className="profile-identity">{profile.avatar ? <img src={profile.avatar} alt={`${profile.name} profile`} /> : <span className="profile-initial">{profile.name.slice(0, 1).toUpperCase()}</span>}<div><p>YOUR VIBETUBE</p><h1>{profile.name}</h1><span>{profile.email}</span></div><button className="edit-profile" onClick={() => setEditing(!editing)}><Pencil size={16} /> {editing ? "Cancel" : "Edit profile"}</button></div></section>
    <section className="profile-content">
      {editing && <form className="edit-card" onSubmit={save}><h2>Edit your profile</h2><label>Profile photo<input type="file" accept="image/*" onChange={uploadAvatar} /></label><label>Display name<input value={name} onChange={(event) => setName(event.target.value)} /></label><label>Email address<input value={profile.email} disabled /></label><button type="submit"><Check size={16} /> Save changes</button></form>}
      <div className="profile-stats"><div><b>12</b><span>Saved videos</span></div><div><b>4</b><span>Playlists</span></div><div><b>28</b><span>Following</span></div></div>
      <div className="profile-grid"><section><h2><Clock3 size={19} /> Continue watching</h2><div className="empty-profile"><Play size={22} fill="currentColor" /><p>Your recently watched videos will appear here.</p><button onClick={() => router.push("/")}>Browse VibeTube</button></div></section><section><h2><ListVideo size={19} /> Your playlists</h2><div className="empty-profile"><Heart size={22} fill="currentColor" /><p>Create playlists to save your favorite stories.</p><button onClick={() => router.push("/")}>Explore content</button></div></section></div>
      <div className="profile-actions"><button><Settings2 size={17} /> Account settings</button><button className="sign-out" onClick={signOut}><UserRound size={17} /> Switch or sign out</button></div>
    </section>
    {notice && <div className="toast"><Check size={17} /> {notice}</div>}
  </main>;
}
