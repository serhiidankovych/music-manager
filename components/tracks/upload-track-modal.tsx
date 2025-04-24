import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Track } from "@/types";
import { api } from "@/lib/api";
import { Upload, X, FileAudio, Trash } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface UploadTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track;
  onSuccess: () => void;
}

export function UploadTrackModal({
  isOpen,
  onClose,
  track,
  onSuccess,
}: UploadTrackModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    if (track?.audioFile) {
      setAudioUrl(api.getTrackAudioUrl(track.audioFile));
    } else {
      setAudioUrl(null);
    }
  }, [track]);

  const resetState = () => {
    setIsUploading(false);
    setIsRemoving(false);
    setUploadProgress(0);
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const simulateProgress = () => {
    setUploadProgress(0);
    const timer = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(timer);
          return prev;
        }
        return prev + 5;
      });
    }, 150);
    return timer;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedMimeTypes = [
        "audio/mpeg",
        "audio/wav",
        "audio/mp3",
        "audio/x-wav",
      ];

      if (!allowedMimeTypes.includes(file.type)) {
        toast.error("Invalid file type", {
          description: "Please upload an MP3 or WAV file only.",
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      setSelectedFile(file);
      setUploadProgress(0);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleClearSelection = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !track?.id) return;

    let progressTimer: NodeJS.Timeout | null = null;
    setIsUploading(true);

    try {
      progressTimer = simulateProgress();

      console.log("Uploading file:", {
        trackId: track.id,
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
      });

      const response = await api.uploadTrackAudio(track.id, selectedFile);
      const updatedTrack = await response.json();

      console.log("Updated track:", updatedTrack);

      setUploadProgress(100);

      if (progressTimer) clearInterval(progressTimer);

      toast.success("Upload successful", {
        description: `Audio file "${selectedFile.name}" has been uploaded.`,
      });

      setTimeout(() => {
        resetState();
        onSuccess();
      }, 800);
    } catch (error) {
      if (progressTimer) clearInterval(progressTimer);
      setUploadProgress(0);

      console.error("Failed to upload audio file:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unknown error occurred during upload.";

      toast.error("Upload failed", {
        description: errorMessage,
      });

      setIsUploading(false);
    }
  };

  const handleRemoveFile = async () => {
    if (!track?.id) return;

    setIsRemoving(true);

    try {
      await api.removeTrackAudio(track.id);

      toast.success("File removed", {
        description: "The audio file has been removed from this track.",
      });

      setAudioUrl(null);
      resetState();
      onSuccess();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unknown error occurred while removing the file.";

      toast.error("Failed to remove file", {
        description: errorMessage,
      });
    } finally {
      setIsRemoving(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      if (!isUploading && !isRemoving) {
        resetState();
        onClose();
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Audio File</DialogTitle>
          <DialogDescription>
            Upload or remove the audio file for {track?.title || "this track"}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="audio/*"
            className="hidden"
            disabled={isUploading || isRemoving}
          />

          {audioUrl && !selectedFile && (
            <div className="flex items-center justify-between p-4 border rounded-md">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-md">
                  <FileAudio className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Current audio file</p>
                  <p className="text-sm text-muted-foreground truncate max-w-[280px]">
                    {track.audioFile}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemoveFile}
                disabled={isRemoving || isUploading}
              >
                {isRemoving ? (
                  "Removing..."
                ) : (
                  <>
                    <Trash className="h-4 w-4 mr-2" />
                    Remove
                  </>
                )}
              </Button>
            </div>
          )}

          {!selectedFile && (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center ${
                isUploading || isRemoving
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer hover:border-primary/50"
              }`}
              onClick={
                isUploading || isRemoving ? undefined : handleBrowseClick
              }
            >
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                <h3 className="font-medium text-lg">
                  {audioUrl
                    ? "Upload a new audio file"
                    : "Upload an audio file"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Click to browse or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Supports MP3, WAV (max 10MB)
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBrowseClick();
                  }}
                  disabled={isUploading || isRemoving}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Browse files
                </Button>
              </div>
            </div>
          )}

          {selectedFile && (
            <div className="border rounded-md p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-md">
                    <FileAudio className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium truncate max-w-[250px]">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
                {!isUploading && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClearSelection}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {uploadProgress > 0 && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-sm text-right text-muted-foreground">
                    {uploadProgress}%
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="space-x-2">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isUploading || isRemoving}
          >
            Cancel
          </Button>

          {selectedFile && (
            <Button
              onClick={handleUpload}
              disabled={isUploading || uploadProgress >= 95}
            >
              {isUploading
                ? "Uploading..."
                : audioUrl
                ? "Replace File"
                : "Upload File"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
