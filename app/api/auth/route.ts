import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { attachSession, clearSession, getSession, getUsers, hashPassword, LocalUser, saveUsers, verifyPassword } from "@/lib/auth/local-auth";

const publicUser = (user: LocalUser) => ({ id: user.id, name: user.name, email: user.email, avatar: user.avatar });

export async function GET(request: Request) {
  const session = getSession(request);
  if (!session) return NextResponse.json({ user: null });
  const user = (await getUsers()).find((item) => item.id === session.id);
  return NextResponse.json({ user: user ? publicUser(user) : null });
}

export async function POST(request: Request) {
  try {
    const { action, email, password, name } = await request.json() as { action?: "login" | "signup"; email?: string; password?: string; name?: string };
    const normalizedEmail = email?.trim().toLowerCase() ?? "";
    if (!normalizedEmail.includes("@") || !password || password.length < 6) return NextResponse.json({ error: "Use a valid email and a password of at least 6 characters." }, { status: 400 });
    const users = await getUsers(); const existing = users.find((user) => user.email === normalizedEmail);
    if (action === "signup") {
      if (!name?.trim() || name.trim().length < 2) return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
      if (existing) return NextResponse.json({ error: "An account with this email already exists. Sign in instead." }, { status: 409 });
      const user: LocalUser = { id: randomUUID(), name: name.trim(), email: normalizedEmail, passwordHash: await hashPassword(password), avatar: "", createdAt: new Date().toISOString() };
      await saveUsers([...users, user]);
      return attachSession(NextResponse.json({ user: publicUser(user) }), publicUser(user));
    }
    if (!existing || !(await verifyPassword(password, existing.passwordHash))) return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
    return attachSession(NextResponse.json({ user: publicUser(existing) }), publicUser(existing));
  } catch { return NextResponse.json({ error: "Could not complete sign in. Please try again." }, { status: 500 }); }
}

export async function PUT(request: Request) {
  const session = getSession(request);
  if (!session) return NextResponse.json({ error: "Sign in to edit your profile." }, { status: 401 });
  const { name, avatar } = await request.json() as { name?: string; avatar?: string };
  const users = await getUsers(); const index = users.findIndex((user) => user.id === session.id);
  if (index < 0) return NextResponse.json({ error: "Account not found." }, { status: 404 });
  if (name !== undefined && name.trim().length < 2) return NextResponse.json({ error: "Name must have at least 2 characters." }, { status: 400 });
  users[index] = { ...users[index], name: name?.trim() || users[index].name, avatar: typeof avatar === "string" ? avatar : users[index].avatar };
  await saveUsers(users);
  return attachSession(NextResponse.json({ user: publicUser(users[index]) }), publicUser(users[index]));
}

export async function DELETE() { return clearSession(NextResponse.json({ ok: true })); }
