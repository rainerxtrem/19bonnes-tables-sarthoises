import sharp from "sharp";
import { prisma } from "@/lib/db/prisma";
import { getStorageProvider } from "@/lib/storage";
import { ALLOWED_MIME_TYPES, MAX_UPLOAD_SIZE_BYTES, resolveMediaType } from "@/lib/media/limits";

export class UnsupportedFileError extends Error {}
export class FileTooLargeError extends Error {}

export async function uploadMedia(params: {
  file: File;
  alt?: string;
  caption?: string;
  uploadedById?: string;
}) {
  const { file, alt, caption, uploadedById } = params;

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    throw new FileTooLargeError(
      `Fichier trop volumineux (max ${Math.round(MAX_UPLOAD_SIZE_BYTES / 1024 / 1024)} Mo)`
    );
  }

  const mediaType = resolveMediaType(file.type);
  if (!mediaType) {
    throw new UnsupportedFileError(
      `Type de fichier non autorisé : ${file.type || "inconnu"}. Autorisés : ${Object.keys(ALLOWED_MIME_TYPES).join(", ")}`
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let width: number | undefined;
  let height: number | undefined;
  if (mediaType === "IMAGE" && file.type !== "image/svg+xml") {
    try {
      const metadata = await sharp(buffer).metadata();
      width = metadata.width;
      height = metadata.height;
    } catch {
      // On tolère les images dont la métadonnée n'a pas pu être lue.
    }
  }

  const storage = getStorageProvider();
  const stored = await storage.upload({
    buffer,
    filename: file.name,
    mimeType: file.type,
  });

  const media = await prisma.media.create({
    data: {
      filename: file.name,
      url: stored.url,
      storageKey: stored.key,
      type: mediaType,
      mimeType: file.type,
      size: file.size,
      width,
      height,
      alt,
      caption,
      uploadedById,
    },
  });

  return media;
}

export async function deleteMedia(id: string) {
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) return;

  const storage = getStorageProvider();
  await storage.delete(media.storageKey);
  await prisma.media.delete({ where: { id } });
}
