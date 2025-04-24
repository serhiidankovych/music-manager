"use client";
import { useState } from "react";
import { TrackList } from "@/components/tracks/track-list";
import { TrackFilters } from "@/components/tracks/track-filters";
import { AudioPlayer } from "@/components/tracks/audio-player";
import { Pagination } from "@/components/pagination";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle, Loader2 } from "lucide-react";
import { useTracks } from "@/hooks/use-tracks";
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
    currentTrack,
    totalTracks,
    currentPage,
    filters,
    fetchTracks,
    handlePageChange,
    updateFilters,
    setCurrentTrack,
    ITEMS_PER_PAGE,
  } = useTracks();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTrackToEdit, setSelectedTrackToEdit] = useState<Track | null>(
    null
  );
  const [selectedTrackToDelete, setSelectedTrackToDelete] =
    useState<Track | null>(null);
  const [selectedTrackToUpload, setSelectedTrackToUpload] =
    useState<Track | null>(null);

  const handlePlay = (track: Track) => {
    if (currentTrack?.id === track.id) {
      setCurrentTrack(null);
    } else {
      setCurrentTrack(track);
    }
  };

  const handleRetry = () => fetchTracks();

  const handleAddTrack = () => setIsAddModalOpen(true);

  const handleUploadTrack = (trackToUpload: Track) => {
    setSelectedTrackToUpload(trackToUpload);
    setIsUploadModalOpen(true);
  };

  const handleEditTrack = (trackToEdit: Track) => {
    setSelectedTrackToEdit(trackToEdit);
    setIsEditModalOpen(true);
  };

  const handleDeleteTrack = (trackToDelete: Track) => {
    setIsDeleteDialogOpen(true);
    setSelectedTrackToDelete(trackToDelete);
  };

  return (
    <div className="container mx-auto max-w-6xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tracks</h1>
        <Button onClick={handleAddTrack} data-testid="add-track-button">
          <Plus className="mr-2 h-4 w-4" /> Add Track
        </Button>
      </div>

      <div className="mb-6">
        <TrackFilters filters={filters} updateFilters={updateFilters} />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {isLoading || isRefreshing ? (
            <span className="flex items-center">
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
            onPageChange={handlePageChange}
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
            onClose={() => setCurrentTrack(null)}
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

      {selectedTrackToDelete && (
        <DeleteTrackDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          track={selectedTrackToDelete}
          onSuccess={() => {
            setIsDeleteDialogOpen(false);
            fetchTracks();
          }}
        />
      )}

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
