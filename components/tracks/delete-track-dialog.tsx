import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Track } from "@/types";
import { api } from "@/lib/api";

interface DeleteTrackDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tracksToDelete: Track[];
  onSuccess: () => void;
}

export function DeleteTrackDialog({
  isOpen,
  onClose,
  tracksToDelete,
  onSuccess,
}: DeleteTrackDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const isMultiple = tracksToDelete.length > 1;
  const trackIdsToDelete = tracksToDelete.map((t) => t.id);

  const handleDelete = async () => {
    if (trackIdsToDelete.length === 0) {
      onClose();
      return;
    }

    setIsDeleting(true);
    try {
      if (isMultiple) {
        console.log(
          `Attempting to delete ${trackIdsToDelete.length} tracks:`,
          trackIdsToDelete
        );

        const result = await api.multipleDeleteTracks(trackIdsToDelete);
        console.log("Multiple delete result:", result);

        if (result.failed && result.failed.length > 0) {
          toast.warning(
            `${result.success.length} tracks deleted, ${result.failed.length} failed.`,
            {
              description: `Failed IDs: ${result.failed.join(", ")}`,
            }
          );
        } else {
          toast.success(`${trackIdsToDelete.length} Tracks deleted`, {
            description: `The selected tracks have been deleted successfully.`,
          });
        }
      } else {
        const singleTrackId = trackIdsToDelete[0];
        const singleTrackTitle = tracksToDelete[0]?.title || "this track";
        console.log(`Attempting to delete single track ID: ${singleTrackId}`);
        await api.deleteTrack(singleTrackId);
        toast.success("Track deleted", {
          description: `"${singleTrackTitle}" has been deleted successfully.`,
        });
      }

      onSuccess();
    } catch (error) {
      console.error(`Failed to delete track(s)`, error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";

      toast.error("Delete failed", {
        description: errorMessage,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isDeleting) {
      onClose();
    }
  };

  const dialogTitle = isMultiple
    ? `Delete ${tracksToDelete.length} Tracks?`
    : `Delete Track?`;
  const dialogDescription = isMultiple
    ? `Are you sure you want to delete these ${tracksToDelete.length} tracks? This action cannot be undone.`
    : `Are you sure you want to delete "${
        tracksToDelete[0]?.title || "this track"
      }"? This action cannot be undone.`;

  return (
    <AlertDialog
      open={isOpen && tracksToDelete.length > 0}
      onOpenChange={handleOpenChange}
    >
      <AlertDialogContent data-testid="confirm-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
          <AlertDialogDescription>{dialogDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isDeleting}
            onClick={onClose}
            data-testid="cancel-delete"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive"
            data-testid="confirm-delete"
          >
            {isDeleting
              ? "Deleting..."
              : isMultiple
              ? `Delete ${tracksToDelete.length} Tracks`
              : "Delete Track"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
