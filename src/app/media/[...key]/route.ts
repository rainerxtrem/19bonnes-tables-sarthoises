import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";

const STORAGE_DIR = path.resolve(process.env.LOCAL_STORAGE_DIR ?? "./storage/uploads");

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

/**
 * Sert les fichiers stockés localement (driver "local"). En production avec
 * le driver "s3", les médias sont servis directement par le bucket et cette
 * route n'est jamais sollicitée.
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  const filename = key.join("/");

  // Empêche toute évasion du dossier de stockage (path traversal).
  if (filename.includes("..") || path.isAbsolute(filename)) {
    return NextResponse.json({ error: "Chemin invalide" }, { status: 400 });
  }

  const filePath = path.join(STORAGE_DIR, filename);
  if (!filePath.startsWith(STORAGE_DIR)) {
    return NextResponse.json({ error: "Chemin invalide" }, { status: 400 });
  }

  try {
    await stat(filePath);
    const buffer = await readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();
    const contentType = CONTENT_TYPES[extension] ?? "application/octet-stream";

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Média introuvable" }, { status: 404 });
  }
}
