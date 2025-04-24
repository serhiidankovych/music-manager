import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { api } from "@/lib/api";
import { Track, ComponentTrackFilters } from "@/types";

export const ITEMS_PER_PAGE = 10;

export function useTracks() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [totalTracks, setTotalTracks] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [filters, setFilters] = useState<ComponentTrackFilters>({
    search: "",
    genre: undefined,
    artist: undefined,
    sort: undefined,
    order: undefined,
  });

  const debouncedSearch = useDebounce(filters.search, 500);

  const updateFilters = useCallback(
    (newFilters: Partial<ComponentTrackFilters>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));

      if (
        Object.keys(newFilters).some(
          (key) => key !== "search" || newFilters.search === ""
        )
      ) {
        setCurrentPage(1);
      }

      if (Object.keys(newFilters).length > 0) {
        setIsRefreshing(true);
      }
    },
    []
  );

  const fetchTracks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const apiFilters = {
        ...filters,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: debouncedSearch || undefined,
      };

      const response = await api.getTracks(apiFilters);

      if (response?.data && Array.isArray(response.data)) {
        setTracks(response.data);
        setTotalTracks(response.meta.total);
      } else {
        throw new Error("Invalid response structure");
      }
    } catch (err) {
      console.error("Failed to fetch tracks:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      setTracks([]);
      setTotalTracks(0);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [currentPage, debouncedSearch, filters]);

  useEffect(() => {
    fetchTracks();
  }, [fetchTracks]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return {
    tracks,
    isLoading,
    isRefreshing,
    error,
    currentTrack,
    totalTracks,
    currentPage,
    filters,
    ITEMS_PER_PAGE,

    fetchTracks,
    handlePageChange,
    updateFilters,
    setCurrentTrack,
  };
}
