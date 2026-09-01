import type { StorageProvider } from "@/lib/storage/types";
import { localStorageProvider } from "@/lib/storage/local";
import { s3StorageProvider } from "@/lib/storage/s3";

export function getStorageProvider(): StorageProvider {
  const driver = process.env.STORAGE_DRIVER ?? "local";
  return driver === "s3" ? s3StorageProvider : localStorageProvider;
}

export * from "@/lib/storage/types";
