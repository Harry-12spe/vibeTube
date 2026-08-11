export type UploadInput = { key: string; body: Blob; contentType: string };
export type StorageProvider = {
  upload(input: UploadInput): Promise<{ key: string; url: string }>;
  signedPlaybackUrl(key: string): Promise<string>;
  delete(key: string): Promise<void>;
};

/**
 * The local provider preserves the same shape as S3/R2. Swap the implementation
 * at the composition root when storage environment variables are configured.
 */
export const localStorageProvider: StorageProvider = {
  async upload({ key }) { return { key, url: `/media/${key}` }; },
  async signedPlaybackUrl(key) { return `/media/${key}`; },
  async delete() { /* Local demo has no remote object to remove. */ },
};
