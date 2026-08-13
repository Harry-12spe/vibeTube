"use client";

import {
  Bell, Bookmark, Check, ChevronDown, ChevronLeft, ChevronRight, Clapperboard,
  Clock3, Compass, Download, Heart, Home, ListPlus, Menu, MessageCircle,
  MoreHorizontal, Play, Plus, Search, Send, Share2, Sparkles, ThumbsDown,
  ThumbsUp, UserRound, Volume2, X
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { catalog, ContentItem, getById, hero, rows } from "@/lib/catalog";
import { VibePlayer } from "@/components/vibe-player";

const navItems = ["Home", "Movies", "Short Films", "Series", "Trending", "Categories"];
const mobileItems = [{ label: "Home", icon: Home }, { label: "Explore", icon: Compass }, { label: "Subscriptions", icon: Heart }, { label: "Profile", icon: UserRound }];

function Avatar({ src, name, size = "normal" }: { src: string; name: string; size?: "normal" | "small" }) {
  if (!src || src.includes("photo-1494790108377-be9c29b29330")) {
    return <span className={`avatar avatar-initials ${size}`} aria-label={`${name} avatar`}>{name.trim().slice(0, 1).toUpperCase() || "V"}</span>;
  }
  return <img className={`avatar ${size}`} src={src} alt={`${name} avatar`} />;
}

function VibeTubeLogo({ originals = false }: { originals?: boolean }) {
  return (
    <span className={originals ? "originals-lockup" : "vibetube-logo"} aria-label={originals ? "VibeTube Originals" : "VibeTube"}>
      <span className="brand-letters">VIBE<span>TUBE</span>{originals && <small>ORIGINALS</small>}</span>
    </span>
  );
}

function ContentCard({ item, onWatch, onSave }: { item: ContentItem; onWatch: (item: ContentItem) => void; onSave: (item: ContentItem) => void }) {
  return (
    <article className="content-card" tabIndex={0} onKeyDown={(event) => event.key === "Enter" && onWatch(item)}>
      <button className="poster" aria-label={`Play ${item.title}`} onClick={() => onWatch(item)}>
        {item.streamUrl ? <video src={item.streamUrl} muted preload="metadata" aria-hidden="true" /> : <img src={item.image} alt="" />}
        <span className="poster-shade" />
        {item.badge && <span className="mini-badge">{item.badge}</span>}
        <span className="duration">{item.duration}</span>
        <span className="card-play"><Play size={17} fill="currentColor" /></span>
        {item.progress !== undefined && <span className="progress"><i style={{ width: `${item.progress}%` }} /></span>}
      </button>
      <div className="card-meta">
        <Avatar src={item.avatar} name={item.creator} size="small" />
        <div className="card-copy">
          <button className="card-title" onClick={() => onWatch(item)}>{item.title}</button>
          <p>{item.creator}</p>
          <p>{item.views} <span>•</span> {item.year}</p>
        </div>
        <button className="icon-button subtle" aria-label={`More options for ${item.title}`} onClick={() => onSave(item)}><MoreHorizontal size={18} /></button>
      </div>
    </article>
  );
}

function Row({ title, subtitle, items, onWatch, onSave }: { title: string; subtitle: string; items: ContentItem[]; onWatch: (item: ContentItem) => void; onSave: (item: ContentItem) => void }) {
  const scroller = useRef<HTMLDivElement>(null);
  const scroll = (direction: number) => scroller.current?.scrollBy({ left: direction * 700, behavior: "smooth" });
  return (
    <section className="shelf" aria-label={title}>
      <div className="shelf-heading">
        <div><h2>{title} <span>›</span></h2><p>{subtitle}</p></div>
        <div className="shelf-actions"><button onClick={() => scroll(-1)} aria-label="Previous items"><ChevronLeft size={19} /></button><button onClick={() => scroll(1)} aria-label="Next items"><ChevronRight size={19} /></button></div>
      </div>
      <div className="card-scroller" ref={scroller}>{items.map((item) => <ContentCard key={item.id} item={item} onWatch={onWatch} onSave={onSave} />)}</div>
    </section>
  );
}

function PlayerOverlay({ item, onClose, onSaved, viewerId }: { item: ContentItem; onClose: () => void; onSaved: () => void; viewerId: string }) {
  const [liked, setLiked] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  return (
    <div className="watch-overlay" role="dialog" aria-modal="true" aria-label={`Watch ${item.title}`}>
      <div className="watch-shell">
        <button className="close-player" onClick={onClose} aria-label="Close video player"><X size={22} /></button>
        <div className="player-wrap"><VibePlayer title={item.title} viewerId={viewerId} poster={item.image} src={item.streamUrl ?? "https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4"} /></div>
        <div className="watch-layout">
          <main className="watch-main">
            <div className="watch-kicker">{item.type.toUpperCase()} <span>•</span> {item.genre}</div>
            <h1>{item.title}</h1>
            <div className="watch-stats">{item.views} <span>•</span> {item.year} <span>•</span> {item.duration} {item.rating && <><span>•</span> <b>★ {item.rating}</b></>}</div>
            <div className="watch-actions">
              <button className={liked ? "engagement active" : "engagement"} onClick={() => setLiked(!liked)}><ThumbsUp size={18} fill={liked ? "currentColor" : "none"} /> {liked ? "Liked" : "Like"}</button>
              <button className="engagement"><ThumbsDown size={18} /> Dislike</button>
              <button className="engagement"><Share2 size={18} /> Share</button>
              <button className="engagement" onClick={onSaved}><Bookmark size={18} /> Save</button>
              <button className="engagement"><Download size={18} /> Download</button>
            </div>
            <div className="creator-panel">
              <Avatar src={item.avatar} name={item.creator} />
              <div><h3>{item.creator} <Check size={15} fill="currentColor" /></h3></div>
              <button className={subscribed ? "subscribe subscribed" : "subscribe"} onClick={() => setSubscribed(!subscribed)}>{subscribed ? "Subscribed" : "Subscribe"}</button>
            </div>
            <div className="description"><b>{item.type} · {item.genre}</b><p>{item.description}</p><button>Show more <ChevronDown size={15} /></button></div>
          </main>
          <aside className="up-next"><div className="upnext-head"><h2>Up next</h2><label className="autoplay">Autoplay <i /></label></div>{catalog.filter((entry) => entry.id !== item.id).slice(0, 4).map((entry) => <button className="next-card" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} key={entry.id}><img src={entry.image} alt="" /><span><b>{entry.title}</b><small>{entry.creator}</small><small>{entry.views} • {entry.duration}</small></span></button>)}</aside>
        </div>
      </div>
    </div>
  );
}

export function VibeTubeApp() {
  const [active, setActive] = useState("Home");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ContentItem | null>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [user, setUser] = useState<{ name: string; email: string; avatar: string } | null>(null);
  const [latestUpload, setLatestUpload] = useState<ContentItem | null>(null);
  const [serverUploads, setServerUploads] = useState<ContentItem[]>([]);
  const [publicUploads, setPublicUploads] = useState<ContentItem[]>([]);
  useEffect(() => {
    const mapUploads = (data: { uploads?: Array<{ id: string; title: string; description: string; category: string; visibility: string; url: string; createdAt: string; ownerName: string; thumbnailUrl?: string }> }) => data.uploads?.map((upload) => ({ id: upload.id, title: upload.title, creator: upload.ownerName, avatar: "", image: upload.thumbnailUrl ?? hero.image, duration: "Your upload", views: "Just published", year: new Date(upload.createdAt).getFullYear().toString(), genre: upload.category, type: (upload.category === "Movie" ? "Movie" : "Video") as any, description: upload.description, badge: upload.visibility, streamUrl: upload.url })) ?? [];
    void Promise.all([fetch("/api/auth", { cache: "no-store" }), fetch("/api/uploads?scope=mine", { cache: "no-store" }), fetch("/api/uploads", { cache: "no-store" })]).then(async ([authResponse, mineResponse, publicResponse]) => {
      const authData = await authResponse.json() as { user: { name: string; email: string; avatar: string } | null };
      setUser(authData.user);
      if (mineResponse.ok) { const uploads = mapUploads(await mineResponse.json()); setServerUploads(uploads); setLatestUpload(uploads[0] ?? null); }
      if (publicResponse.ok) setPublicUploads(mapUploads(await publicResponse.json()));
    }).catch(() => undefined);
  }, []);
  
  const uploadedMovies = publicUploads.filter(u => u.type === 'Movie');
  const uploadedVideos = publicUploads.filter(u => u.type !== 'Movie');
  const matches = useMemo(() => query.trim() ? catalog.filter((item) => `${item.title} ${item.creator} ${item.genre} ${item.type}`.toLowerCase().includes(query.toLowerCase())).slice(0, 5) : [], [query]);
  const save = (item: ContentItem) => {
    setSaved((current) => current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id]);
    setNotice(saved.includes(item.id) ? "Removed from My List" : "Added to My List");
    window.setTimeout(() => setNotice(""), 2200);
  };
  const watch = (item: ContentItem) => { setSelected(item); document.body.style.overflow = "hidden"; };
  const close = () => { setSelected(null); document.body.style.overflow = ""; };
  return (
    <div className="app-shell">
      <header className="navbar">
        <button className="brand" onClick={() => setActive("Home")} aria-label="VibeTube home"><VibeTubeLogo /></button>
        <nav className="desktop-nav" aria-label="Primary navigation">{navItems.map((label) => <button className={active === label ? "nav-active" : ""} onClick={() => setActive(label)} key={label}>{label}</button>)}</nav>
        <div className="nav-right">
          <div className="search-box"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search movies, creators & more" aria-label="Search VibeTube" />{query && <button aria-label="Clear search" onClick={() => setQuery("")}><X size={16} /></button>}
            {matches.length > 0 && <div className="search-results">{matches.map((item) => <button onClick={() => { watch(item); setQuery(""); }} key={item.id}><img src={item.image} alt="" /><span><b>{item.title}</b><small>{item.type} · {item.creator}</small></span></button>)}</div>}
          </div>
          <button className="upload-button" onClick={() => window.location.assign("/upload")}><Plus size={18} /> <span>Create</span></button>
          <button className="icon-button notification" aria-label="Notifications"><Bell size={19} /><i /></button>
          {user ? <button className="profile-avatar" onClick={() => window.location.assign("/profile")} aria-label={`${user.name} profile`} title={`${user.name} profile`}><Avatar src={user.avatar} name={user.name} /></button> : <button className="sign-in-button" onClick={() => window.location.assign("/login")}>Sign in</button>}
          <button className="menu-button" aria-label="Open menu"><Menu size={21} /></button>
        </div>
      </header>

      <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45 }}>
        <section className="hero" aria-label="Featured content">
          <img className="hero-image" src={hero.image} alt="" />
          <div className="hero-vignette" />
          <div className="hero-noise" />
          <div className="hero-content">
            <VibeTubeLogo originals />
            <h1>The Last<br /><em>Signal</em></h1>
            <p className="hero-details"><b>★ 8.8</b> <span>•</span> 2026 <span>•</span> 2h 04m <span>•</span> Sci-Fi · Thriller</p>
            <p className="hero-description">A mysterious signal changes everything. Four strangers race to uncover a secret buried beyond the stars.</p>
            <div className="hero-actions"><button className="primary-button" onClick={() => watch(hero)}><Play size={19} fill="currentColor" /> Watch now</button><button className="secondary-button" onClick={() => save(hero)}><ListPlus size={19} /> {saved.includes(hero.id) ? "In My List" : "My List"}</button></div>
          </div>
          <div className="hero-meta"><span>SCROLL TO EXPLORE</span><i /></div>
          <button className="mute" aria-label="Toggle trailer sound"><Volume2 size={18} /></button>
        </section>
        <section className="quick-filters" aria-label="Browse categories"><button className="filter-active" onClick={() => setActive("For You")}>For you <Sparkles size={14} /></button>{["Movies", "Short Films", "Tech & Education", "Music", "Gaming"].map((filter) => <button onClick={() => setActive(filter)} key={filter}>{filter}</button>)}<button className="all-filter" onClick={() => setActive("Categories")}>All categories <ChevronRight size={16} /></button></section>
        <div className="main-content">
          {active !== "Home" && <div className="active-view"><p>EXPLORE VIBETUBE</p><h2>{active}</h2><span>Hand-picked stories, creators, and releases tailored to your mood.</span></div>}
          {(serverUploads.length > 0 || latestUpload) && <Row title="Your uploads" subtitle="Only you can see Private and Unlisted videos" items={serverUploads.length ? serverUploads : [latestUpload!]} onWatch={watch} onSave={save} />}
          {uploadedMovies.length > 0 && <Row title="Movies" subtitle="Uploaded Movies" items={uploadedMovies} onWatch={watch} onSave={save} />}
          {uploadedVideos.length > 0 && <Row title="Videos" subtitle="Uploaded Videos" items={uploadedVideos} onWatch={watch} onSave={save} />}
          {rows.map((row) => <Row key={row.title} title={row.title} subtitle={row.subtitle} items={row.ids.map(getById)} onWatch={watch} onSave={save} />)}
          <section className="original-banner"><div><VibeTubeLogo originals /><h2>Coming Soon</h2><p>Our original stories are currently in production.<br />Stay tuned.</p><button className="text-link" onClick={() => setActive("Originals")}>Explore originals <ChevronRight size={18} /></button></div><img src="https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1400&q=85" alt="Film crew recording a scene" /></section>
        </div>
      </motion.main>
      <nav className="mobile-nav" aria-label="Mobile navigation">{mobileItems.slice(0, 2).map(({ label, icon: Icon }) => <button key={label} onClick={() => setActive(label)}><Icon size={20} /><span>{label}</span></button>)}<button className="create-round" onClick={() => window.location.assign("/upload")} aria-label="Create upload"><Plus size={25} /></button>{mobileItems.slice(2).map(({ label, icon: Icon }) => <button key={label} onClick={() => setActive(label)}><Icon size={20} /><span>{label}</span></button>)}</nav>
      {notice && <div className="toast"><Check size={17} /> {notice}</div>}
      {selected && <PlayerOverlay item={selected} viewerId={user?.email ?? "guest"} onClose={close} onSaved={() => save(selected)} />}
    </div>
  );
}
