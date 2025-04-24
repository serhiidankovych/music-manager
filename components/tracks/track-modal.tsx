import { useState } from "react";
import { TrackForm } from "./track-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Track, TrackFormData } from "@/types";
import { api } from "@/lib/api";
import { Loader2, AlertCircle, Pencil, PlusCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  track?: Track | null;
  onSuccess: (track: Track) => void;
  mode: "create" | "edit";
}

export function TrackModal({
  isOpen,
  onClose,
  track,
  onSuccess,
  mode,
}: TrackModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = mode === "edit";
  const formId = isEditMode ? "edit-track-form" : "create-track-form";

  const handleSubmit = async (data: TrackFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (isEditMode) {
        if (!track) {
          toast.error("Cannot update: Track data missing.");
          return;
        }
        const updatedTrackData = { ...track, ...data };
        await api.updateTrack(track.id, data);
        toast.success("Track updated", {
          description: `"${data.title}" saved successfully.`,
          duration: 3000,
        });
        onSuccess(updatedTrackData as Track);
      } else {
        const newTrack = await api.createTrack(data);
        toast.success("Track Created", {
          description: `"${data.title}" was added successfully.`,
          duration: 3000,
        });
        onSuccess(newTrack);
      }
    } catch (err) {
      console.error(
        isEditMode
          ? `Failed to update track ID: ${track?.id}`
          : "Failed to create track:",
        err
      );
      const errorMessage =
        err instanceof Error
          ? err.message
          : `An unknown error occurred during ${
              isEditMode ? "update" : "creation"
            }.`;
      setError(errorMessage);
      toast.error(isEditMode ? "Update failed" : "Creation Failed", {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInteractOutside = (event: Event) => {
    if (isSubmitting) {
      event.preventDefault();
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isSubmitting) {
      onClose();
    }
  };

  if (isEditMode && !track && isOpen) {
    return null;
  }

  const initialData = isEditMode
    ? track
    : {
        title: "",
        description: "",
        audioUrl: "",
        artist: "",
        album: "",
        genres: [],
      };
  const icon = isEditMode ? (
    <Pencil className="h-5 w-5 text-muted-foreground" />
  ) : (
    <PlusCircle className="h-5 w-5 text-muted-foreground" />
  );

  const title = isEditMode ? "Edit Track Details" : "Create New Track";
  const description = isEditMode
    ? `Make changes to ${track?.title || "this track"}. Current ID: ${
        track?.id
      }`
    : "Add a new track to your collection";

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-3xl max-h-[90vh] flex flex-col"
        onInteractOutside={handleInteractOutside}
        onEscapeKeyDown={handleInteractOutside}
      >
        <DialogHeader className="pr-6">
          <div className="flex items-center space-x-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              {icon}
            </span>
            <div>
              <DialogTitle className="text-lg">{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mt-4 flex-shrink-0">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <ScrollArea className="h-[400px] p-4">
          <TrackForm
            id={formId}
            initialData={initialData as Track}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </ScrollArea>

        <DialogFooter className="pt-4 border-t flex-shrink-0 sm:justify-between">
          <div className="text-xs text-muted-foreground hidden sm:block">
            {isEditMode && track?.updatedAt
              ? `Last updated: ${new Date(track.updatedAt).toLocaleString()}`
              : ""}
          </div>
          <div className="flex space-x-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              form={formId}
              disabled={isSubmitting}
              data-testid="submit-button"
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmitting
                ? "Saving..."
                : isEditMode
                ? "Save Changes"
                : "Create Track"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
