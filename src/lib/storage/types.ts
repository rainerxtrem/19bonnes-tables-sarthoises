export interface StoredFile {
  /** Clé interne stable, indépendante du provider (stockée en base). */
  key: string;
  /** URL publique utilisable directement dans le frontend. */
  url: string;
}

export interface StorageProvider {
  upload(params: { buffer: Buffer; filename: string; mimeType: string }): Promise<StoredFile>;
  delete(key: string): Promise<void>;
}
