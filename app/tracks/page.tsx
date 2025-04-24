"use client";
import { useState, useMemo } from "react";
import { TrackList } from "@/components/tracks/track-list";
import { TrackFilters } from "@/components/tracks/track-filters";
import { AudioPlayer } from "@/components/tracks/audio-player";
import { Pagination } from "@/components/pagination";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle, Loader2, Trash2, CopyX } from "lucide-react";
import { useTracks } from "@/hooks/use-tracks";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { TrackModal } from "@/components/tracks/track-modal";
import { DeleteTrackDialog } from "@/components/tracks/delete-track-dialog";
import { UploadTrackModal } from "@/components/tracks/upload-track-modal";
import { Track } from "@/types";
export default function TracksPage() {
  const {
    tracks,
    isLoading,
    isRefreshing,
    error,
    totalTracks,
    currentPage,
    filters,
    fetchTracks,
    handlePageChange,
    updateFilters,
    ITEMS_PER_PAGE,
  } = useTracks();
  const { currentTrack, isPlaying, handlePlay, closePlayer } = useAudioPlayer();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTrackToEdit, setSelectedTrackToEdit] = useState<Track | null>(
    null
  );
  const [tracksToDelete, setTracksToDelete] = useState<Track[]>([]);
  const [selectedTrackToUpload, setSelectedTrackToUpload] =
    useState<Track | null>(null);
  const [selectedTrackIds, setSelectedTrackIds] = useState<Set<string>>(
    new Set()
  );

  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const visibleTrackIds = useMemo(() => tracks.map((t) => t.id), [tracks]);

  const handleRetry = () => fetchTracks();

  const handleAddTrack = () => {
    setSelectedTrackIds(new Set());
    setIsAddModalOpen(true);
  };

  const handleUploadTrack = (trackToUpload: Track) => {
    setSelectedTrackIds(new Set());
    setSelectedTrackToUpload(trackToUpload);
    setIsUploadModalOpen(true);
    closePlayer();
  };

  const handleEditTrack = (trackToEdit: Track) => {
    setSelectedTrackIds(new Set());
    setSelectedTrackToEdit(trackToEdit);
    setIsEditModalOpen(true);
    closePlayer();
  };

  const handleDeleteTrack = (trackToDelete: Track) => {
    setSelectedTrackIds(new Set());
    setTracksToDelete([trackToDelete]);
    setIsDeleteDialogOpen(true);
    closePlayer();
  };

  const handleTriggerMultipleDelete = () => {
    if (selectedTrackIds.size === 0) return;
    const tracksToConfirmDelete = tracks.filter((track) =>
      selectedTrackIds.has(track.id)
    );
    if (tracksToConfirmDelete.length > 0) {
      setTracksToDelete(tracksToConfirmDelete);
      setIsDeleteDialogOpen(true);
      closePlayer();
    }
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      setSelectedTrackIds(new Set());
    }
  };

  const handleSelectionChange = (trackId: string, isSelected: boolean) => {
    setSelectedTrackIds((prevSelectedIds) => {
      const newSelectedIds = new Set(prevSelectedIds);
      if (isSelected) {
        newSelectedIds.add(trackId);
      } else {
        newSelectedIds.delete(trackId);
      }
      return newSelectedIds;
    });
  };

  const handleSelectAllChange = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedTrackIds(new Set(visibleTrackIds));
    } else {
      setSelectedTrackIds(new Set());
    }
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setTimeout(() => setTracksToDelete([]), 150);
  };

  const handleDeleteSuccess = () => {
    handleCloseDeleteDialog();
    setSelectedTrackIds(new Set());
    fetchTracks();
  };

  return (
    <div className="container mx-auto max-w-6xl p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold" data-testid="tracks-header">
          Tracks
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant={isSelectionMode ? "secondary" : "outline"}
            onClick={toggleSelectionMode}
            data-testid="select-mode-toggle"
            size="sm"
          >
            <CopyX className="mr-2 h-4 w-4" />
            {isSelectionMode ? "Exit Selection" : "Select Tracks"}
          </Button>

          {selectedTrackIds.size > 0 && (
            <Button
              variant="destructive"
              onClick={handleTriggerMultipleDelete}
              data-testid="bulk-delete-button"
              size="sm"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected ({selectedTrackIds.size})
            </Button>
          )}
          <Button
            onClick={handleAddTrack}
            data-testid="create-track-button"
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Track
          </Button>
        </div>
      </div>
      <div className="mb-6">
        <TrackFilters filters={filters} updateFilters={updateFilters} />
      </div>
      <div className="mb-4 flex flex-col-reverse items-center justify-between sm:flex-row">
        <div className="text-sm text-muted-foreground">
          {isLoading || isRefreshing ? (
            <span
              className="flex items-center"
              data-testid="loading-indicator"
              data-loading={isLoading}
            >
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              {isRefreshing ? "Updating results..." : "Loading tracks..."}
            </span>
          ) : (
            <>
              {totalTracks === 0
                ? "No tracks found"
                : `Showing ${Math.min(
                    (currentPage - 1) * ITEMS_PER_PAGE + 1,
                    totalTracks
                  )}-${Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    totalTracks
                  )} of ${totalTracks} track${totalTracks !== 1 ? "s" : ""}`}
            </>
          )}
        </div>
        {!isLoading && totalTracks > ITEMS_PER_PAGE && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalTracks / ITEMS_PER_PAGE)}
            onPageChange={(page) => {
              setSelectedTrackIds(new Set());
              handlePageChange(page);
            }}
          />
        )}
      </div>
      {error && (
        <div className="mb-4 p-4 border rounded-md bg-destructive/10 text-destructive flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span>Error loading tracks: {error}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            className="text-xs"
          >
            Retry
          </Button>
        </div>
      )}
      <TrackList
        tracks={tracks}
        isLoading={isLoading}
        onEdit={handleEditTrack}
        onDelete={handleDeleteTrack}
        onUpload={handleUploadTrack}
        onPlay={handlePlay}
        currentTrackId={currentTrack?.id}
        isPlaying={isPlaying}
        selectedTrackIds={selectedTrackIds}
        onSelectionChange={handleSelectionChange}
        onSelectAllChange={handleSelectAllChange}
        isSelectionMode={isSelectionMode}
      />
      {!isLoading && tracks.length === 0 && !error && (
        <div className="text-center py-12 border rounded-md bg-muted/50">
          <p className="text-lg font-medium mb-2">No tracks found</p>
          <p className="text-sm text-muted-foreground">
            {filters.search || filters.genre || filters.artist
              ? "Try adjusting your filters or clear them to see more results."
              : "Add your first track to get started."}
          </p>
        </div>
      )}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background shadow-lg">
          <AudioPlayer
            track={currentTrack}
            handlePlay={handlePlay}
            onClose={closePlayer}
            isPlaying={isPlaying}
          />
        </div>
      )}
      <TrackModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          fetchTracks();
        }}
        mode="create"
      />
      <TrackModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => {
          setIsEditModalOpen(false);
          fetchTracks();
        }}
        track={selectedTrackToEdit}
        mode="edit"
      />
      <DeleteTrackDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        tracksToDelete={tracksToDelete}
        onSuccess={handleDeleteSuccess}
      />
      {selectedTrackToUpload && (
        <UploadTrackModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          track={selectedTrackToUpload}
          onSuccess={() => {
            setIsUploadModalOpen(false);
            fetchTracks();
          }}
        />
      )}
    </div>
  );
}
