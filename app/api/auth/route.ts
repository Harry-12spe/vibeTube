import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { attachSession, clearSession, getSession, hashPassword, verifyPassword, LocalUser } from "@/lib/auth/local-auth";
import { prisma } from "@/lib/prisma";

const publicUser = (user: { id: string; profile?: { displayName: string; avatarUrl?: string | null } | null; email: string }) => ({ 
  id: user.id, 
  name: user.profile?.displayName || "User", 
  email: user.email, 
  avatar: user.profile?.avatarUrl || "" 
});

export async function GET(request: Request) {
  const session = getSession(request);
  if (!session) return NextResponse.json({ user: null });
  const user = await prisma.user.findUnique({ where: { id: session.id }, include: { profile: true } });
  return NextResponse.json({ user: user ? publicUser(user) : null });
}

export async function POST(request: Request) {
  try {
    const { action, email, password, name } = await request.json() as { action?: "login" | "signup"; email?: string; password?: string; name?: string };
    const normalizedEmail = email?.trim().toLowerCase() ?? "";
    if (!normalizedEmail.includes("@") || !password || password.length < 6) return NextResponse.json({ error: "Use a valid email and a password of at least 6 characters." }, { status: 400 });
    
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail }, include: { profile: true } });
    
    if (action === "signup") {
      if (!name?.trim() || name.trim().length < 2) return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
      if (existing) return NextResponse.json({ error: "An account with this email already exists. Sign in instead." }, { status: 409 });
      
      const user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash: await hashPassword(password),
          profile: {
            create: {
              displayName: name.trim(),
              username: name.trim().toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(Math.random() * 1000)
            }
          }
        },
        include: { profile: true }
      });
      return attachSession(NextResponse.json({ user: publicUser(user) }), publicUser(user));
    }
    
    if (!existing || !existing.passwordHash || !(await verifyPassword(password, existing.passwordHash))) return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
    return attachSession(NextResponse.json({ user: publicUser(existing) }), publicUser(existing));
  } catch (error) { 
    console.error("Auth error", error);
    return NextResponse.json({ error: "Could not complete sign in. Please try again." }, { status: 500 }); 
  }
}

export async function PUT(request: Request) {
  const session = getSession(request);
  if (!session) return NextResponse.json({ error: "Sign in to edit your profile." }, { status: 401 });
  
  const { name, avatar } = await request.json() as { name?: string; avatar?: string };
  const user = await prisma.user.findUnique({ where: { id: session.id }, include: { profile: true } });
  if (!user) return NextResponse.json({ error: "Account not found." }, { status: 404 });
  if (name !== undefined && name.trim().length < 2) return NextResponse.json({ error: "Name must have at least 2 characters." }, { status: 400 });
  
  const updatedUser = await prisma.user.update({
    where: { id: session.id },
    data: {
      profile: {
        update: {
          displayName: name?.trim() || user.profile?.displayName,
          avatarUrl: typeof avatar === "string" ? avatar : user.profile?.avatarUrl
        }
      }
    },
    include: { profile: true }
  });
  
  return attachSession(NextResponse.json({ user: publicUser(updatedUser) }), publicUser(updatedUser));
}

export async function DELETE() { return clearSession(NextResponse.json({ ok: true })); }

