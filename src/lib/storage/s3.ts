import { randomUUID } from "node:crypto";
import path from "node:path";
import type { StorageProvider, StoredFile } from "@/lib/storage/types";

/**
 * Provider S3 (ou compatible : OVH Object Storage, Scaleway, MinIO, R2...).
 * Le SDK n'est importé qu'à l'usage pour ne pas alourdir le driver "local"
 * par défaut.
 */
export const s3StorageProvider: StorageProvider = {
  async upload({ buffer, filename, mimeType }) {
    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");

    const bucket = requireEnv("S3_BUCKET");
    const client = new S3Client({
      region: process.env.S3_REGION || "auto",
      endpoint: process.env.S3_ENDPOINT || undefined,
      credentials: {
        accessKeyId: requireEnv("S3_ACCESS_KEY_ID"),
        secretAccessKey: requireEnv("S3_SECRET_ACCESS_KEY"),
      },
    });

    const extension = path.extname(filename);
    const key = `${randomUUID()}${extension}`;

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      })
    );

    const publicBase = requireEnv("S3_PUBLIC_URL").replace(/\/$/, "");

    return {
      key,
      url: `${publicBase}/${key}`,
    } satisfies StoredFile;
  },

  async delete(key) {
    const { S3Client, DeleteObjectCommand } = await import("@aws-sdk/client-s3");
    const bucket = requireEnv("S3_BUCKET");
    const client = new S3Client({
      region: process.env.S3_REGION || "auto",
      endpoint: process.env.S3_ENDPOINT || undefined,
      credentials: {
        accessKeyId: requireEnv("S3_ACCESS_KEY_ID"),
        secretAccessKey: requireEnv("S3_SECRET_ACCESS_KEY"),
      },
    });
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  },
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variable d'environnement manquante pour le stockage S3 : ${name}`);
  }
  return value;
}
