import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { acceptedVideoTypes } from "@/lib/validation/video";
import { getSession } from "@/lib/auth/local-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const localUploadLimit = 500 * 1024 * 1024;
type LocalUpload = { id: string; url: string; title: string; description: string; category: string; visibility: string; createdAt: string; ownerId: string; ownerName: string; thumbnailUrl?: string; };

const uploadDirectory = () => path.join(process.cwd(), "data", "uploads");
const catalogPath = () => path.join(uploadDirectory(), "catalog.json");
async function readCatalog(): Promise<LocalUpload[]> {
  try {
    const entries = JSON.parse(await readFile(catalogPath(), "utf8")) as Array<Partial<LocalUpload>>;
    return entries.map((entry) => ({ ...entry, ownerId: entry.ownerId ?? "legacy", ownerName: entry.ownerName ?? "Local creator" })) as LocalUpload[];
  }
  catch { return []; }
}
async function writeCatalog(catalog: LocalUpload[]) {
  await writeFile(catalogPath(), JSON.stringify(catalog.slice(0, 50), null, 2), "utf8");
}

export async function POST(request: Request) {
  try {
    const owner = getSession(request);
    if (!owner) return NextResponse.json({ error: "Sign in before uploading a video." }, { status: 401 });
    
    // Accept JSON from the client-side blob upload
    const { url, title } = (await request.json()) as { url: string; title: string };
    if (!url) return NextResponse.json({ error: "Missing video URL." }, { status: 400 });

    const objectName = url.split('/').pop() || `${Date.now()}-${crypto.randomUUID()}.mp4`;
    
    // Ensure catalog directory exists
    await mkdir(uploadDirectory(), { recursive: true });
    
    const entry: LocalUpload = { 
      id: objectName, 
      url: url, // Use the direct blob URL
      title: title || "Untitled Video", 
      description: "No description added.", 
      category: "Entertainment", 
      visibility: "PUBLIC", 
      createdAt: new Date().toISOString(), 
      ownerId: owner.id, 
      ownerName: owner.name 
    };
    
    await writeCatalog([entry, ...(await readCatalog()).filter((item) => item.id !== objectName)]);

    return NextResponse.json(entry);
  } catch {
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = getSession(request);
    const scope = new URL(request.url).searchParams.get("scope") ?? "public";
    await mkdir(uploadDirectory(), { recursive: true });
    const catalog = await readCatalog();
    const visibleCatalog = scope === "mine" ? (session ? catalog.filter((item) => item.ownerId === session.id) : []) : catalog.filter((item) => item.visibility === "PUBLIC");
    if (catalog.length) return NextResponse.json({ uploads: visibleCatalog });
    const legacyDirectory = path.join(process.cwd(), "public", "uploads");
    const files = await readdir(legacyDirectory).catch(() => [] as string[]);
    const recovered = files.filter((name) => /\.(mp4|webm|mov)$/i.test(name)).map((id) => ({ id, url: `/uploads/${id}`, title: id.replace(/^\d+-[\w-]+/, "My uploaded video").replace(/\.[^/.]+$/, ""), description: "Recovered local upload.", category: "Entertainment", visibility: "PUBLIC", createdAt: new Date().toISOString(), ownerId: "legacy", ownerName: "Local creator" }));
    if (recovered.length) await writeCatalog(recovered);
    return NextResponse.json({ uploads: recovered });
  } catch { return NextResponse.json({ uploads: [] }); }
}

export async function PATCH(request: Request) {
  try {
    const session = getSession(request);
    if (!session) return NextResponse.json({ error: "Sign in to edit your upload." }, { status: 401 });
    
    const update = await request.json() as Partial<LocalUpload> & { id?: string };

    if (!update.id) return NextResponse.json({ error: "Missing upload identifier." }, { status: 400 });
    const catalog = await readCatalog();
    const position = catalog.findIndex((item) => item.id === update.id);
    if (position < 0) return NextResponse.json({ error: "Upload was not found." }, { status: 404 });
    if (catalog[position].ownerId !== session.id) return NextResponse.json({ error: "You can only edit your own uploads." }, { status: 403 });
    
    const next: LocalUpload = { 
      ...catalog[position], 
      title: update.title?.trim() || catalog[position].title, 
      description: update.description?.trim() || catalog[position].description, 
      category: update.category || catalog[position].category, 
      visibility: update.visibility || catalog[position].visibility,
      thumbnailUrl: update.thumbnailUrl || catalog[position].thumbnailUrl 
    };
    
    catalog[position] = next; 
    await writeCatalog(catalog);
    return NextResponse.json(next);
  } catch (error) { 
    console.error("PATCH error", error);
    return NextResponse.json({ error: "Could not save video details." }, { status: 500 }); 
  }
}
