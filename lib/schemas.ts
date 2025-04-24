import { z } from "zod";

export const trackFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  artist: z.string().min(1, "Artist is required"),
  album: z.string().optional(),
  genres: z.array(z.string()),
  coverImage: z.string().optional(),
});

export type TrackFormData = z.infer<typeof trackFormSchema>;
