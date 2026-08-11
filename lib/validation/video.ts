import { z } from "zod";

export const uploadVideoSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(5000),
  categoryId: z.string().cuid(),
  tags: z.array(z.string().trim().min(2).max(30)).max(12),
  language: z.string().trim().min(2).max(20),
  visibility: z.enum(["PUBLIC", "UNLISTED", "PRIVATE"]),
  ageRestricted: z.boolean().default(false),
});

export const acceptedVideoTypes = ["video/mp4", "video/webm", "video/quicktime"] as const;
export const maxVideoSizeBytes = 5 * 1024 * 1024 * 1024;

export function validateVideoFile(file: File) {
  if (!acceptedVideoTypes.includes(file.type as (typeof acceptedVideoTypes)[number])) throw new Error("Use MP4, WebM, or MOV video files.");
  if (file.size > maxVideoSizeBytes) throw new Error("Video files must be 5 GB or smaller.");
}
