import { open, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/local-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type UploadRecord = { id: string; visibility: string; ownerId: string };
const mediaDirectory = () => path.join(process.cwd(), "data", "uploads");
const catalogFile = () => path.join(mediaDirectory(), "catalog.json");
const contentType = (id: string) => id.endsWith(".webm") ? "video/webm" : id.endsWith(".mov") ? "video/quicktime" : "video/mp4";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-zA-Z0-9._-]+\.(mp4|webm|mov)$/i.test(id)) return new NextResponse("Not found", { status: 404 });
  try {
    const uploads = JSON.parse(await readFile(catalogFile(), "utf8")) as UploadRecord[];
    const upload = uploads.find((item) => item.id === id);
    const session = getSession(request);
    if (!upload || (upload.visibility === "PRIVATE" && upload.ownerId !== session?.id)) return new NextResponse("Not found", { status: 404 });
    const filePath = path.join(mediaDirectory(), id);
    const fileStats = await stat(filePath);
    const range = request.headers.get("range");
    const type = contentType(id);
    if (!range) return new NextResponse(await readFile(filePath), { headers: { "Content-Type": type, "Content-Length": String(fileStats.size), "Accept-Ranges": "bytes", "Cache-Control": "private, max-age=0" } });
    const [startText, endText] = range.replace("bytes=", "").split("-");
    const start = Math.max(0, Number(startText) || 0); const end = Math.min(fileStats.size - 1, endText ? Number(endText) : fileStats.size - 1);
    if (start > end) return new NextResponse(null, { status: 416, headers: { "Content-Range": `bytes */${fileStats.size}` } });
    const length = end - start + 1; const handle = await open(filePath, "r"); const chunk = Buffer.alloc(length);
    await handle.read(chunk, 0, length, start); await handle.close();
    return new NextResponse(chunk, { status: 206, headers: { "Content-Type": type, "Content-Length": String(length), "Content-Range": `bytes ${start}-${end}/${fileStats.size}`, "Accept-Ranges": "bytes", "Cache-Control": "private, max-age=0" } });
  } catch { return new NextResponse("Not found", { status: 404 }); }
}
