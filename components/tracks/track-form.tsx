import { useState, useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Loader2, X, Plus, FileImage } from "lucide-react";
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

  const coverImageUrl = form.watch("coverImage");

  const filteredGenres = availableGenres.filter(
    (genre) =>
      !selectedGenres.includes(genre) &&
      genre.toLowerCase().includes(genreInput.toLowerCase())
  );

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
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Track Title<span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter track title"
                      {...field}
                      disabled={isSubmitting}
                      className="focus-visible:ring-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="artist"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Artist<span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter artist name"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div>
            <FormField
              control={form.control}
              name="coverImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Image</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter cover image URL (optional)"
                      {...field}
                      disabled={isSubmitting}
                      type="url"
                      onChange={(e) => {
                        field.onChange(e);
                        setImagePreviewError(false);
                      }}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Enter a valid URL for the track&apos;s cover image
                  </FormDescription>
                  <FormMessage />

                  <div className="flex items-center justify-center bg-accent p-4  border-dashed border-4 rounded-md">
                    {coverImageUrl &&
                    !form.formState.errors.coverImage &&
                    !imagePreviewError ? (
                      <div className="relative group">
                        <Image
                          src={coverImageUrl}
                          alt="Cover preview"
                          width={100}
                          height={100}
                          className="object-cover rounded-md border border-muted shadow-sm transition-all"
                          onError={() => setImagePreviewError(true)}
                        />
                        <div className="absolute inset-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all rounded-md">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="opacity-0 group-hover:opacity-100"
                            onClick={() => form.setValue("coverImage", "")}
                          >
                            <X className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-md flex flex-col items-center justify-center text-muted-foreground">
                        <FileImage className="h-8 w-8" />
                        <span className="text-sm">No image</span>
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
              <div className="p-4">
                {selectedGenres.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Selected Genres:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedGenres.map((genre) => (
                        <Badge
                          key={genre}
                          variant="default"
                          className="px-3 py-1 rounded-full flex items-center gap-1"
                        >
                          {genre}
                          <button
                            type="button"
                            className="ml-1 rounded-full hover:bg-primary-foreground/20 focus:outline-none p-1"
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
                  />
                  <Button
                    type="button"
                    size="icon"
                    onClick={handleAddCustomGenre}
                    disabled={isSubmitting || !genreInput.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Available Genres:</p>
                  {isLoadingGenres ? (
                    <div className="flex items-center text-sm text-muted-foreground py-2">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading genres...
                    </div>
                  ) : filteredGenres.length > 0 ? (
                    <ScrollArea className="h-24 w-full rounded-md border">
                      <div className="flex flex-wrap gap-2 p-3">
                        {filteredGenres.map((genre) => (
                          <Badge
                            key={genre}
                            variant="outline"
                            className="px-3 py-1 cursor-pointer hover:bg-secondary transition-colors"
                            onClick={() => toggleGenre(genre)}
                          >
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <p className="text-sm text-muted-foreground py-2">
                      {genreInput
                        ? "No matching genres found"
                        : "No more genres available"}
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
