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
    const formData = await request.formData();
    const file = formData.get("video");
    if (!(file instanceof File)) return NextResponse.json({ error: "Choose a video file to upload." }, { status: 400 });
    if (!acceptedVideoTypes.includes(file.type as (typeof acceptedVideoTypes)[number])) return NextResponse.json({ error: "Use an MP4, WebM, or MOV file." }, { status: 415 });
    if (file.size > localUploadLimit) return NextResponse.json({ error: "Local demo uploads are limited to 500 MB." }, { status: 413 });

    const extension = path.extname(file.name).toLowerCase().replace(/[^.a-z0-9]/g, "") || ".mp4";
    const objectName = `${Date.now()}-${crypto.randomUUID()}${extension}`;
    await mkdir(uploadDirectory(), { recursive: true });
    await writeFile(path.join(uploadDirectory(), objectName), Buffer.from(await file.arrayBuffer()));
    const entry: LocalUpload = { id: objectName, url: `/api/media/${objectName}`, title: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "), description: "No description added.", category: "Entertainment", visibility: "PUBLIC", createdAt: new Date().toISOString(), ownerId: owner.id, ownerName: owner.name };
    await writeCatalog([entry, ...(await readCatalog()).filter((item) => item.id !== objectName)]);

    return NextResponse.json(entry);
  } catch {
    return NextResponse.json({ error: "Upload failed. Please try a smaller compatible video." }, { status: 500 });
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
    
    const contentType = request.headers.get("content-type") || "";
    let update: Partial<LocalUpload> & { id?: string } = {};
    let thumbUrl: string | undefined = undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      update.id = formData.get("id") as string;
      update.title = formData.get("title") as string;
      update.description = formData.get("description") as string;
      update.category = formData.get("category") as string;
      update.visibility = formData.get("visibility") as string;
      
      const thumbFile = formData.get("thumbnail");
      if (thumbFile instanceof File && thumbFile.size > 0) {
        const extension = path.extname(thumbFile.name).toLowerCase().replace(/[^.a-z0-9]/g, "") || ".jpg";
        const thumbName = `thumb-${Date.now()}-${crypto.randomUUID()}${extension}`;
        await mkdir(uploadDirectory(), { recursive: true });
        await writeFile(path.join(uploadDirectory(), thumbName), Buffer.from(await thumbFile.arrayBuffer()));
        thumbUrl = `/api/media/${thumbName}`;
      }
    } else {
      update = await request.json() as Partial<LocalUpload> & { id?: string };
    }

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
      thumbnailUrl: thumbUrl || catalog[position].thumbnailUrl 
    };
    
    catalog[position] = next; 
    await writeCatalog(catalog);
    return NextResponse.json(next);
  } catch (error) { 
    console.error("PATCH error", error);
    return NextResponse.json({ error: "Could not save video details." }, { status: 500 }); 
  }
}
