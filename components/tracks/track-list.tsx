"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Track } from "@/types";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Upload,
  Play,
  Pause,
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";

interface TrackListProps {
  tracks: Track[];
  isLoading: boolean;
  onEdit: (track: Track) => void;
  onDelete: (track: Track) => void;
  onUpload: (track: Track) => void;
  onPlay: (track: Track) => void;
  currentTrackId?: string;
  isPlaying: boolean;
  error?: { message: string } | null;
  selectedTrackIds: Set<string>;
  onSelectionChange: (trackId: string, isSelected: boolean) => void;
  onSelectAllChange: (isSelected: boolean) => void;
  isSelectionMode?: boolean;
}

const SKELETON_ROWS = 5;

export function TrackList({
  tracks,
  isLoading,
  error,
  onEdit,
  onDelete,
  onUpload,
  onPlay,
  currentTrackId,
  isPlaying,
  selectedTrackIds,
  onSelectionChange,
  onSelectAllChange,
  isSelectionMode = false,
}: TrackListProps) {
  const numSelected = selectedTrackIds.size;
  const numVisible = tracks.length;
  const allVisibleSelected =
    numVisible > 0 &&
    numSelected === numVisible &&
    tracks.every((t) => selectedTrackIds.has(t.id));
  const someVisibleSelected = numSelected > 0 && !allVisibleSelected;

  const headerCheckboxState = useMemo(() => {
    if (allVisibleSelected) return true;
    if (someVisibleSelected) return "indeterminate";
    return false;
  }, [allVisibleSelected, someVisibleSelected]);

  if (isLoading) {
    return (
      <div
        className="rounded-md border"
        data-testid="loading-tracks"
        data-loading={isLoading}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px] pl-4">
                <Skeleton className="h-4 w-4" />
              </TableHead>
              <TableHead className="w-[60px]"></TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Artist</TableHead>
              <TableHead className="hidden md:table-cell">Album</TableHead>
              <TableHead className="hidden sm:table-cell">Genres</TableHead>
              <TableHead className="text-right w-[80px] pr-4">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: SKELETON_ROWS }).map((_, index) => (
              <TableRow key={`skeleton-${index}`}>
                <TableCell className="pl-4">
                  <Skeleton className="h-4 w-4" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-10 w-10 rounded" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell className="text-right pr-4">
                  <Skeleton className="h-8 w-8 ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex justify-center items-center h-40 border rounded-md bg-destructive/10 text-destructive"
        data-testid="track-list-error"
      >
        <p>Error loading tracks: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border" data-testid="track-list-data">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px] pl-4">
              {tracks.length > 0 && isSelectionMode && (
                <Checkbox
                  checked={headerCheckboxState}
                  onCheckedChange={(checked) =>
                    onSelectAllChange(Boolean(checked))
                  }
                  aria-label="Select all rows"
                  data-testid="select-all"
                />
              )}
            </TableHead>
            <TableHead className="w-[60px]"></TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Artist</TableHead>
            <TableHead className="hidden md:table-cell">Album</TableHead>
            <TableHead className="hidden sm:table-cell">Genres</TableHead>
            <TableHead className="text-right w-[80px] pr-4">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tracks.map((track) => {
            const isCurrentTrack = currentTrackId === track.id;
            const isCurrentlyPlaying = isCurrentTrack && isPlaying;
            const hasAudio = Boolean(track.audioFile);
            const isSelected = selectedTrackIds.has(track.id);

            return (
              <TableRow
                key={track.id}
                data-testid={`track-item-${track.id}`}
                className={`${isCurrentTrack ? "bg-accent/20" : ""} ${
                  isSelected ? "bg-blue-100 dark:bg-blue-900/30" : ""
                }`}
                data-state={isSelected ? "selected" : undefined}
              >
                <TableCell className="pl-4">
                  {isSelectionMode && (
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) =>
                        onSelectionChange(track.id, Boolean(checked))
                      }
                      aria-label={`Select row for ${track.title}`}
                      data-testid={`track-checkbox-${track.id}`}
                    />
                  )}
                </TableCell>
                <TableCell className="pl-0">
                  <div className="relative h-10 w-10 rounded overflow-hidden">
                    {track.coverImage ? (
                      <Image
                        src={track.coverImage}
                        alt={`${track.title} cover`}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-muted flex items-center justify-center">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    {hasAudio && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute inset-0 bg-black/40 hover:bg-black/60 transition-colors h-full w-full rounded-none"
                        onClick={() => onPlay(track)}
                        title={
                          isCurrentlyPlaying ? "Pause track" : "Play track"
                        }
                        data-testid={`play-button-${track.id}`}
                      >
                        {isCurrentlyPlaying ? (
                          <Pause className="h-4 w-4 text-white" />
                        ) : (
                          <Play className="h-4 w-4 text-white" />
                        )}
                      </Button>
                    )}
                  </div>
                </TableCell>
                <TableCell
                  className="font-medium"
                  data-testid={`track-item-${track.id}-title`}
                >
                  {track.title}
                </TableCell>
                <TableCell data-testid={`track-item-${track.id}-artist`}>
                  {track.artist}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {track.album || "-"}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {track.genres && track.genres.length > 0
                    ? track.genres.join(", ")
                    : "-"}
                </TableCell>
                <TableCell className="text-right pr-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        data-testid={`actions-trigger-${track.id}`}
                      >
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => onEdit(track)}
                        data-testid={`edit-track-${track.id}`}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit Details</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onUpload(track)}
                        data-testid={`upload-track-${track.id}`}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        <span>
                          {hasAudio ? "Update Audio" : "Upload Audio"}
                        </span>
                      </DropdownMenuItem>
                      {hasAudio && (
                        <DropdownMenuItem
                          onClick={() => onPlay(track)}
                          data-testid={`play-track-${track.id}`}
                        >
                          {isCurrentlyPlaying ? (
                            <>
                              <Pause className="mr-2 h-4 w-4" />
                              <span>Pause Track</span>
                            </>
                          ) : (
                            <>
                              <Play className="mr-2 h-4 w-4" />
                              <span>Play Track</span>
                            </>
                          )}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(track)}
                        className="text-red-600 focus:text-red-600 "
                        data-testid={`delete-track-${track.id}`}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete Track</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
