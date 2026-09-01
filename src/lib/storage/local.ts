import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { StorageProvider, StoredFile } from "@/lib/storage/types";

const STORAGE_DIR = path.resolve(process.env.LOCAL_STORAGE_DIR ?? "./storage/uploads");
const PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? "/media";

function sanitizeExtension(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  // Whitelist stricte pour éviter l'upload de scripts déguisés en médias.
  const allowed = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".pdf", ".mp4", ".webm"];
  return allowed.includes(ext) ? ext : "";
}

export const localStorageProvider: StorageProvider = {
  async upload({ buffer, filename, mimeType }) {
    void mimeType;
    await mkdir(STORAGE_DIR, { recursive: true });

    const extension = sanitizeExtension(filename);
    const key = `${randomUUID()}${extension}`;
    const destination = path.join(STORAGE_DIR, key);

    await writeFile(destination, buffer);

    return {
      key,
      url: `${PUBLIC_BASE_URL}/${key}`,
    } satisfies StoredFile;
  },

  async delete(key) {
    const destination = path.join(STORAGE_DIR, key);
    try {
      await unlink(destination);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  },
};
