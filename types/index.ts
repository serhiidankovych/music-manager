export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  genres: string[];
  slug: string;
  coverImage: string;
  audioFile: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TrackFilters {
  search?: string;
  genre?: string;
  artist?: string;
  sort?: string;
  page: number;
  limit: number;
  order?: string;
}

export interface TrackFormData {
  title: string;
  artist: string;
  album?: string;
  coverImage?: string;
  genres: string[];
}

export interface ComponentTrackFilters {
  search: string;
  genre?: string;
  artist?: string;
  sort?: "title" | "artist" | "album" | "createdAt";
  order?: "asc" | "desc";
}
