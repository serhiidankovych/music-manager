import { Track, TrackFilters, TrackFormData, PaginatedResponse } from "@/types";

const API_BASE_URL = "http://localhost:8000/api";
const SERVER_BASE_URL = "http://localhost:8000";
const STATIC_FILES_PREFIX = "/api/files/";

class ApiError extends Error {
  constructor(
    public message: string,
    public status?: number,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");

  if (!response.ok) {
    const errorData = isJson ? await response.json() : null;
    throw new ApiError(
      errorData?.message || response.statusText,
      response.status,
      errorData
    );
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return isJson ? response.json() : (response.text() as unknown as T);
}

function buildQueryParams(filters: TrackFilters): string {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  });

  return params.toString();
}

export const api = {
  async getTracks(filters: TrackFilters): Promise<PaginatedResponse<Track>> {
    const query = buildQueryParams(filters);
    const response = await fetch(`${API_BASE_URL}/tracks?${query}`);
    return handleResponse<PaginatedResponse<Track>>(response);
  },

  async getTrack(slugOrId: string): Promise<Track> {
    const response = await fetch(`${API_BASE_URL}/tracks/${slugOrId}`);
    return handleResponse<Track>(response);
  },

  async createTrack(data: TrackFormData): Promise<Track> {
    const response = await fetch(`${API_BASE_URL}/tracks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<Track>(response);
  },

  async updateTrack(id: string, data: Partial<TrackFormData>): Promise<Track> {
    const response = await fetch(`${API_BASE_URL}/tracks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<Track>(response);
  },

  async deleteTrack(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/tracks/${id}`, {
      method: "DELETE",
    });
    await handleResponse<void>(response);
  },

  getTrackAudioUrl(audioFileName: string | null): string | null {
    if (!audioFileName) return null;
    const encodedFileName = encodeURIComponent(audioFileName);
    return `${SERVER_BASE_URL}${STATIC_FILES_PREFIX}${encodedFileName}`;
  },

  async uploadTrackAudio(id: string, file: File): Promise<Response> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`${API_BASE_URL}/tracks/${id}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Upload error details:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(
        `Upload failed: ${response.status} ${response.statusText}`
      );
    }

    return response;
  },

  async removeTrackAudio(id: string): Promise<Track> {
    const response = await fetch(`${API_BASE_URL}/tracks/${id}/file`, {
      method: "DELETE",
    });
    return handleResponse<Track>(response);
  },

  async getArtists(): Promise<string[]> {
    try {
      const response = await this.getTracks({
        limit: 999,
        page: 1,
      });
      const artists = new Set<string>();
      response.data.forEach(
        (track) => track.artist && artists.add(track.artist)
      );
      return Array.from(artists).sort();
    } catch (error) {
      console.error("Failed to get artists:", error);
      return [];
    }
  },

  async getGenres(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/genres`);
    return handleResponse<string[]>(response);
  },

  async bulkDeleteTracks(
    ids: string[]
  ): Promise<{ success: string[]; failed: string[] }> {
    const response = await fetch(`${API_BASE_URL}/tracks/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    return handleResponse<{ success: string[]; failed: string[] }>(response);
  },
};
