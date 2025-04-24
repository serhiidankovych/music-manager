"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { Search } from "lucide-react";

import { ComponentTrackFilters } from "@/types";

interface TrackFiltersProps {
  filters: ComponentTrackFilters;
  updateFilters: (filters: Partial<ComponentTrackFilters>) => void;
}

export function TrackFilters({ filters, updateFilters }: TrackFiltersProps) {
  const [genres, setGenres] = useState<string[]>([]);
  const [artists, setArtists] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      setIsLoading(true);
      try {
        const [genresData, artistsData] = await Promise.all([
          api.getGenres(),
          api.getArtists(),
        ]);

        setGenres(genresData || [""]);
        setArtists(artistsData || []);
      } catch (error) {
        console.error("Failed to fetch filter options:", error);
        setGenres([]);
        setArtists([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilterOptions();
  }, []);

  const sortOptions = [
    { field: "title", direction: "asc", label: "Title (A-Z)" },
    { field: "title", direction: "desc", label: "Title (Z-A)" },
    { field: "artist", direction: "asc", label: "Artist (A-Z)" },
    { field: "artist", direction: "desc", label: "Artist (Z-A)" },
    { field: "createdAt", direction: "desc", label: "Newest First" },
    { field: "createdAt", direction: "asc", label: "Oldest First" },
  ];

  const handleSimpleFilterChange = (
    key: keyof ComponentTrackFilters,
    value: string
  ) => {
    updateFilters({ [key]: value === "all" ? undefined : value });
  };

  const handleSortChange = (value: string) => {
    if (value === "default") {
      updateFilters({ sort: undefined, order: undefined });
    } else {
      const selectedOption = sortOptions.find(
        (option) => `${option.field}:${option.direction}` === value
      );

      if (selectedOption) {
        updateFilters({
          sort: selectedOption.field as ComponentTrackFilters["sort"],
          order: selectedOption.direction as ComponentTrackFilters["order"],
        });
      }
    }
  };

  const getCurrentSortValue = (): string => {
    if (filters.sort && filters.order) {
      return `${filters.sort}:${filters.order}`;
    }
    return "default";
  };

  const handleClearFilters = () => {
    updateFilters({
      search: "",
      genre: undefined,
      artist: undefined,
      sort: undefined,
      order: undefined,
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.genre ||
    filters.artist ||
    filters.sort ||
    filters.order;

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:flex-wrap">
      <div className="relative flex-grow md:flex-grow-0 md:min-w-[250px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tracks..."
          value={filters.search || ""}
          onChange={(e) => updateFilters({ search: e.target.value })}
          className="pl-9 w-full"
          data-testid="search-input"
        />
      </div>

      <div className="min-w-[150px]">
        <Select
          value={filters.genre || "all"}
          onValueChange={(value) => handleSimpleFilterChange("genre", value)}
          disabled={isLoading || genres.length === 0}
          data-testid="filter-genre"
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter by genre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Genres</SelectItem>
            {genres.map((genre) => (
              <SelectItem key={genre} value={genre}>
                {genre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[150px]">
        <Select
          value={filters.artist || "all"}
          onValueChange={(value) => handleSimpleFilterChange("artist", value)}
          disabled={isLoading || artists.length === 0}
          data-testid="filter-artist"
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter by artist" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Artists</SelectItem>
            {artists.map((artist) => (
              <SelectItem key={artist} value={artist}>
                {artist}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[180px]">
        <Select
          value={getCurrentSortValue()}
          onValueChange={handleSortChange}
          data-testid="sort-select"
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default Sorting</SelectItem>
            {sortOptions.map((option) => (
              <SelectItem
                key={`${option.field}:${option.direction}`}
                value={`${option.field}:${option.direction}`}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <button
          onClick={handleClearFilters}
          className="text-sm text-primary hover:text-primary/80 transition-colors whitespace-nowrap"
          data-testid="clear-filters"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
