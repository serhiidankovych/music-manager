import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  X,
  Plus,
  FileImage,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TrackFormData } from "@/lib/schemas";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { trackFormSchema } from "@/lib/schemas";

interface TrackFormProps {
  initialData?: Partial<TrackFormData>;
  onSubmit: (data: TrackFormData) => void | Promise<void>;
  isSubmitting?: boolean;
  submitButtonText?: string;
  onCancel?: () => void;
  id?: string;
}

export function TrackForm({
  initialData = {},
  onSubmit,
  isSubmitting = false,
  id,
}: TrackFormProps) {
  const form = useForm<TrackFormData>({
    resolver: zodResolver(trackFormSchema),
    defaultValues: {
      title: initialData.title || "",
      artist: initialData.artist || "",
      album: initialData.album || "",
      genres: initialData.genres || [],
      coverImage: initialData.coverImage || "",
    },
    mode: "onChange",
  });

  const [genreInput, setGenreInput] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    initialData.genres || []
  );
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const [isLoadingGenres, setIsLoadingGenres] = useState(false);

  const [imagePreviewError, setImagePreviewError] = useState(false);
  const [isVerifyingImage, setIsVerifyingImage] = useState(false);
  const [isImageVerified, setIsImageVerified] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const coverImageUrl = form.watch("coverImage");

  useEffect(() => {
    const hasInitialImage =
      !!initialData?.coverImage && initialData.coverImage === coverImageUrl;

    if (hasInitialImage) {
      setShowPreview(true);
    } else if (!coverImageUrl) {
      setShowPreview(false);
      setIsImageVerified(false);
      setImagePreviewError(false);
    } else {
      setIsImageVerified(false);
      setImagePreviewError(false);

      setShowPreview(isImageVerified);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coverImageUrl, initialData?.coverImage]);

  const verifyImageUrl = useCallback(async (url: string): Promise<boolean> => {
    if (!url) return false;

    return new Promise((resolve) => {
      const img = new window.Image();
      const timeoutId = setTimeout(() => {
        img.src = "";
        resolve(false);
      }, 5000);

      img.onload = () => {
        clearTimeout(timeoutId);
        resolve(true);
      };

      img.onerror = () => {
        clearTimeout(timeoutId);
        resolve(false);
      };

      const cacheBuster = `?cb=${Date.now()}`;
      img.src = url.includes("?")
        ? `${url}&_cb=${Date.now()}`
        : `${url}${cacheBuster}`;
    });
  }, []);

  const handleVerifyImage = async () => {
    const url = form.getValues("coverImage");
    if (!url || isVerifyingImage) return;

    setIsVerifyingImage(true);
    setIsImageVerified(false);

    try {
      const isValid = await verifyImageUrl(url);

      if (isValid) {
        setIsImageVerified(true);
        setShowPreview(true);
        setImagePreviewError(false);
        form.clearErrors("coverImage");
      } else {
        setImagePreviewError(true);
        setShowPreview(false);
        form.setError("coverImage", {
          type: "manual",
          message: "Unable to load image from this URL",
        });
      }
    } catch (error) {
      console.error("Image verification error:", error);
      setImagePreviewError(true);
      setShowPreview(false);
      form.setError("coverImage", {
        type: "manual",
        message: "Verification failed",
      });
    } finally {
      setIsVerifyingImage(false);
    }
  };

  useEffect(() => {
    if (!coverImageUrl || isVerifyingImage) return;

    if (isImageVerified || imagePreviewError) return;

    const timer = setTimeout(() => {
      const imageUrlPattern = /\.(jpeg|jpg|gif|png|webp|svg|avif)(\?.*)?$/i;
      if (imageUrlPattern.test(coverImageUrl)) {
        handleVerifyImage();
      }
    }, 800);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coverImageUrl, isVerifyingImage, isImageVerified, imagePreviewError]);

  const handleClearImage = () => {
    form.setValue("coverImage", "", { shouldValidate: true });
    setShowPreview(false);
    setIsImageVerified(false);
    setImagePreviewError(false);
  };

  useEffect(() => {
    const fetchGenres = async () => {
      setIsLoadingGenres(true);
      try {
        const genresData = await api.getGenres();
        setAvailableGenres(genresData || []);
      } catch (error) {
        console.error("Failed to fetch genres:", error);
      } finally {
        setIsLoadingGenres(false);
      }
    };
    fetchGenres();
  }, []);

  const filteredGenres = availableGenres.filter(
    (genre) =>
      !selectedGenres.includes(genre) &&
      genre.toLowerCase().includes(genreInput.toLowerCase())
  );

  const handleAddCustomGenre = () => {
    if (genreInput.trim() && !selectedGenres.includes(genreInput.trim())) {
      const newGenres = [...selectedGenres, genreInput.trim()];
      setSelectedGenres(newGenres);
      form.setValue("genres", newGenres, { shouldValidate: true });
      setGenreInput("");
    }
  };

  const toggleGenre = (genre: string) => {
    let newGenres: string[];
    if (selectedGenres.includes(genre)) {
      newGenres = selectedGenres.filter((g) => g !== genre);
    } else {
      newGenres = [...selectedGenres, genre];
    }
    setSelectedGenres(newGenres);
    form.setValue("genres", newGenres, { shouldValidate: true });
  };

  const handleRemoveGenre = (genre: string) => {
    const newGenres = selectedGenres.filter((g) => g !== genre);
    setSelectedGenres(newGenres);
    form.setValue("genres", newGenres, { shouldValidate: true });
  };

  const handleSubmit = (data: TrackFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form
        id={id}
        data-testid="track-form"
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Track Title<span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter track title"
                      {...field}
                      disabled={isSubmitting}
                      data-testid="input-title"
                    />
                  </FormControl>
                  <FormMessage data-testid="error-title" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="artist"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Artist<span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter artist name"
                      {...field}
                      disabled={isSubmitting}
                      data-testid="input-artist"
                    />
                  </FormControl>
                  <FormMessage data-testid="error-artist" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="album"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Album</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter album name (optional)"
                      {...field}
                      disabled={isSubmitting}
                      data-testid="input-album"
                    />
                  </FormControl>
                  <FormMessage data-testid="error-album" />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-2">
            <FormField
              control={form.control}
              name="coverImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Image URL</FormLabel>
                  <div className="flex items-start gap-2">
                    <FormControl className="flex-grow">
                      <Input
                        placeholder="Enter image URL (optional)"
                        {...field}
                        value={field.value ?? ""}
                        disabled={isSubmitting || isVerifyingImage}
                        type="url"
                        data-testid="input-cover-image"
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleVerifyImage}
                      disabled={
                        !field.value || isSubmitting || isVerifyingImage
                      }
                      aria-label="Verify Image URL"
                      data-testid="verify-url-button"
                      className={isImageVerified ? "border-green-500" : ""}
                    >
                      {isVerifyingImage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isImageVerified ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>

                  <div className="h-5 mt-1">
                    {isVerifyingImage && (
                      <p className="text-xs text-muted-foreground flex items-center">
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Verifying image URL...
                      </p>
                    )}
                    {!isVerifyingImage && isImageVerified && (
                      <p className="text-xs text-green-600 flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Image URL verified successfully
                      </p>
                    )}
                    {!isVerifyingImage && imagePreviewError && (
                      <p className="text-xs text-destructive flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Could not load image from this URL
                      </p>
                    )}
                  </div>

                  <FormDescription className="text-xs pt-1">
                    Enter a valid image URL (JPG, PNG, GIF, etc.) and click to
                    verify
                  </FormDescription>
                  <FormMessage data-testid="error-cover-image" />

                  {/* Image Preview Area */}
                  <div className="mt-3 flex items-center justify-center bg-accent p-4 min-h-[120px] border-dashed border-2 border-border rounded-md">
                    {showPreview && coverImageUrl ? (
                      <div className="relative group">
                        <div className="rounded border border-muted shadow-sm overflow-hidden">
                          <Image
                            src={coverImageUrl}
                            alt="Cover preview"
                            width={100}
                            height={100}
                            className="object-cover transition-all"
                            onError={() => {
                              setImagePreviewError(true);
                              setIsImageVerified(false);
                              setShowPreview(false);
                              form.setError("coverImage", {
                                type: "manual",
                                message: "Failed to load image",
                              });
                            }}
                            unoptimized
                          />
                        </div>

                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded">
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            className="h-7 w-7"
                            onClick={handleClearImage}
                            aria-label="Clear image URL"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-md flex flex-col items-center justify-center text-muted-foreground text-center">
                        <FileImage className="h-10 w-10 mb-1" />
                        <span className="text-xs leading-tight">
                          {coverImageUrl && imagePreviewError
                            ? "Invalid image URL"
                            : coverImageUrl && !isImageVerified
                            ? "Verification needed"
                            : "No image preview"}
                        </span>
                      </div>
                    )}
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="genres"
          render={() => (
            <FormItem>
              <FormLabel>Genres</FormLabel>
              <div className="border p-4 rounded-md bg-card">
                {selectedGenres.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2 text-muted-foreground">
                      Selected Genres:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedGenres.map((genre) => (
                        <Badge
                          key={genre}
                          variant="default"
                          className="px-2.5 py-0.5 rounded-full text-xs"
                        >
                          {genre}
                          <button
                            type="button"
                            className="ml-1.5 -mr-0.5 rounded-full hover:bg-primary/80 focus:outline-none p-0.5"
                            onClick={() => handleRemoveGenre(genre)}
                            disabled={isSubmitting}
                            aria-label={`Remove ${genre}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Search or add a custom genre"
                    value={genreInput}
                    onChange={(e) => setGenreInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomGenre();
                      }
                    }}
                    disabled={isSubmitting}
                    className="flex-grow"
                    data-testid="genre-selector"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={handleAddCustomGenre}
                    disabled={isSubmitting || !genreInput.trim()}
                    aria-label="Add Genre"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2 text-muted-foreground">
                    Available Genres:
                  </p>
                  {isLoadingGenres ? (
                    <div className="flex items-center text-sm text-muted-foreground py-2">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading genres...
                    </div>
                  ) : filteredGenres.length > 0 ? (
                    <ScrollArea className="h-24 w-full rounded-md border">
                      <div className="flex flex-wrap gap-1.5 p-3">
                        {filteredGenres.map((genre) => (
                          <Badge
                            key={genre}
                            variant="outline"
                            className="px-2.5 py-0.5 text-xs cursor-pointer hover:bg-accent transition-colors rounded-full"
                            onClick={() => toggleGenre(genre)}
                          >
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <p className="text-sm text-muted-foreground py-2 px-1">
                      {availableGenres.length === 0 && !genreInput
                        ? "No genres loaded."
                        : genreInput
                        ? "No matching genres found."
                        : "All available genres selected."}
                    </p>
                  )}
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
