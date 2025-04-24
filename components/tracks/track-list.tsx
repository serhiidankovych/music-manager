
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

interface TrackListProps {
  tracks: Track[];
  isLoading: boolean;
  error?: Error | null;
  onEdit: (track: Track) => void;
  onDelete: (track: Track) => void;
  onUpload: (track: Track) => void;
  onPlay: (track: Track) => void;
  currentTrackId?: string;
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
}: TrackListProps) {
 
  if (isLoading) {
    return (
      <div className="rounded-md border" data-testid="track-list-loading">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]"></TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Artist</TableHead>
              <TableHead className="hidden md:table-cell">Album</TableHead>
              <TableHead className="hidden sm:table-cell">Genres</TableHead>
              <TableHead className="text-right w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: SKELETON_ROWS }).map((_, index) => (
              <TableRow key={`skeleton-${index}`}>
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
                <TableCell className="text-right">
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
            <TableHead className="w-[60px]"></TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Artist</TableHead>
            <TableHead className="hidden md:table-cell">Album</TableHead>
            <TableHead className="hidden sm:table-cell">Genres</TableHead>
            <TableHead className="text-right w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tracks.map((track) => {
            const isPlaying = currentTrackId === track.id;
            const hasAudio = Boolean(track.audioFile);

            return (
              <TableRow
                key={track.id}
                data-testid={`track-row-${track.id}`}
                className={isPlaying ? "bg-accent/20" : ""}
              >
                <TableCell className="pl-4">
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
                        title={isPlaying ? "Now playing" : "Play track"}
                        data-testid={`play-button-${track.id}`}
                      >
                        {isPlaying ? (
                          <Pause className="h-4 w-4 text-white" />
                        ) : (
                          <Play className="h-4 w-4 text-white" />
                        )}
                      </Button>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{track.title}</TableCell>
                <TableCell>{track.artist}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {track.album || "-"}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {track.genres.length > 0 ? track.genres.join(", ") : "-"}
                </TableCell>
                <TableCell className="text-right">
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
                        data-testid={`edit-action-${track.id}`}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit Details</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onUpload(track)}
                        data-testid={`upload-action-${track.id}`}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        <span>
                          {hasAudio ? "Update Audio" : "Upload Audio"}
                        </span>
                      </DropdownMenuItem>
                      {hasAudio && (
                        <DropdownMenuItem
                          onClick={() => onPlay(track)}
                          data-testid={`play-action-${track.id}`}
                        >
                          <Play className="mr-2 h-4 w-4" />
                          <span>Play Track</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(track)}
                        className="text-red-600 focus:text-red-600 "
                        data-testid={`delete-action-${track.id}`}
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
