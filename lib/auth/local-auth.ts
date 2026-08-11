import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const sessionCookieName = "vibetube-session";
const sessionSecret = process.env.AUTH_SECRET || "vibetube-local-development-secret-change-me";
const dataDirectory = () => path.join(process.cwd(), "data");
const usersPath = () => path.join(dataDirectory(), "users.json");

export type LocalUser = { id: string; name: string; email: string; passwordHash: string; avatar: string; createdAt: string };
export type SessionUser = Pick<LocalUser, "id" | "name" | "email" | "avatar">;
type SessionPayload = SessionUser & { exp: number };

export async function getUsers(): Promise<LocalUser[]> {
  try { return JSON.parse(await readFile(usersPath(), "utf8")) as LocalUser[]; }
  catch { return []; }
}
export async function saveUsers(users: LocalUser[]) {
  await mkdir(dataDirectory(), { recursive: true });
  await writeFile(usersPath(), JSON.stringify(users, null, 2), "utf8");
}
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${hash.toString("hex")}`;
}
export async function verifyPassword(password: string, stored: string) {
  const [salt, original] = stored.split(":");
  if (!salt || !original) return false;
  const candidate = (await scrypt(password, salt, 64)) as Buffer;
  const originalBuffer = Buffer.from(original, "hex");
  return originalBuffer.length === candidate.length && timingSafeEqual(originalBuffer, candidate);
}
const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");
const sign = (value: string) => createHmac("sha256", sessionSecret).update(value).digest("base64url");
export function sessionToken(user: SessionUser) {
  const payload = encode({ ...user, exp: Date.now() + 1000 * 60 * 60 * 24 * 14 });
  return `${payload}.${sign(payload)}`;
}
export function getSession(request: Request): SessionUser | null {
  const cookie = request.headers.get("cookie") ?? "";
  const token = cookie.split(";").map((item) => item.trim()).find((item) => item.startsWith(`${sessionCookieName}=`))?.slice(sessionCookieName.length + 1);
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || signature.length !== sign(payload).length || !timingSafeEqual(Buffer.from(signature), Buffer.from(sign(payload)))) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionPayload;
    if (session.exp < Date.now()) return null;
    return { id: session.id, name: session.name, email: session.email, avatar: session.avatar };
  } catch { return null; }
}
export function attachSession<T extends Response>(response: T, user: SessionUser) {
  response.headers.append("Set-Cookie", `${sessionCookieName}=${sessionToken(user)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=1209600${process.env.NODE_ENV === "production" ? "; Secure" : ""}`);
  return response;
}
export function clearSession<T extends Response>(response: T) {
  response.headers.append("Set-Cookie", `${sessionCookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
  return response;
}
