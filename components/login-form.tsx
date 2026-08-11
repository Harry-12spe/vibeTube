"use client";

import { ArrowRight, Eye, EyeOff, Play, UserRound } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (mode === "signup" && name.trim().length < 2) {
      setError("Please enter your name.");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Enter a password with at least 6 characters.");
      return;
    }
    try {
      const response = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: mode, name, email, password }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) { setError(result.error ?? "Could not sign in."); return; }
      router.push("/profile"); router.refresh();
    } catch { setError("Could not connect to local sign in service."); }
  };

  const demo = async () => {
    setError("");
    const body = { action: "signup", name: "Maya Rao", email: "maya@vibetube.local", password: "vibetube" };
    let response = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (response.status === 409) response = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, action: "login" }) });
    if (!response.ok) { const result = await response.json() as { error?: string }; setError(result.error ?? "Could not open demo account."); return; }
    router.push("/profile"); router.refresh();
  };

  return (
    <main className="login-page">
      <section className="login-poster" aria-hidden="true"><img src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1500&q=85" alt="" /><div /></section>
      <section className="login-panel">
        <button className="login-brand" onClick={() => router.push("/")} aria-label="VibeTube home"><span>VIBE<i>TUBE</i></span></button>
        <div className="login-copy"><p>{mode === "login" ? "WELCOME BACK" : "START STREAMING"}</p><h1>{mode === "login" ? "Your next great story is waiting." : "Create your VibeTube account."}</h1><span>Watch originals, follow creators, and keep every story in one place.</span></div>
        <div className="auth-toggle"><button className={mode === "login" ? "selected" : ""} onClick={() => setMode("login")}>Sign in</button><button className={mode === "signup" ? "selected" : ""} onClick={() => setMode("signup")}>Create account</button></div>
        <form onSubmit={submit} className="auth-form">
          {mode === "signup" && <label>Full name<input required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" /></label>}
          <label>Email address<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>
          <label>Password<span className="password-wrap"><input required minLength={6} type={showPassword ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label>
          {error && <p className="auth-error">{error}</p>}
          <button className="auth-submit" type="submit">{mode === "login" ? "Sign in to VibeTube" : "Create account"}<ArrowRight size={18} /></button>
        </form>
        <div className="auth-divider"><span>OR</span></div>
        <button className="demo-account" onClick={demo}><UserRound size={18} /><span><b>Use demo account</b><small>Maya Rao · maya@vibetube.local</small></span><Play size={15} fill="currentColor" /></button>
        <p className="auth-note">This local demo creates a server-side account with your email and a protected browser session. Use at least 6 characters for the password.</p>
      </section>
    </main>
  );
}
