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
  track: Track;
  onSuccess: () => void;
}

export function DeleteTrackDialog({
  isOpen,
  onClose,
  track,
  onSuccess,
}: DeleteTrackDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      console.log(`Attempting to delete track ID: ${track.id}`);
      await api.deleteTrack(track.id);

      toast.success("Track deleted", {
        description: `"${track.title}" has been deleted successfully.`,
      });

      onSuccess();
    } catch (error) {
      console.error(`Failed to delete track ID: ${track.id}`, error);
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

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent data-testid="confirm-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Track</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete {track?.title || "this track"}? This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting} data-testid="cancel-delete">
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
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
