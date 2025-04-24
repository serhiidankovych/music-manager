

import { Music, Edit, Upload, Trash2, List } from "lucide-react";
import { JSX } from "react";

type Feature = {
  icon: JSX.Element;
  title: string;
  description: string;
};

export const features: Feature[] = [
  {
    icon: <Music className="h-6 w-6" />,
    title: "Create Tracks",
    description:
      "Add track metadata including title, artist, album, and multiple genres without requiring an initial file upload.",
  },
  {
    icon: <Edit className="h-6 w-6" />,
    title: "Edit Metadata",
    description:
      "Easily modify your track information with pre-filled forms and see changes reflect immediately.",
  },
  {
    icon: <Upload className="h-6 w-6" />,
    title: "Upload Audio Files",
    description:
      "Add MP3 or WAV files to existing tracks with built-in validation for file type and size.",
  },
  {
    icon: <Trash2 className="h-6 w-6" />,
    title: "Remove Tracks",
    description:
      "Delete tracks from both the view and backend with a simple click.",
  },
  {
    icon: <List className="h-6 w-6" />,
    title: "Advanced Track Management",
    description:
      "Browse tracks with pagination, sorting, filtering, and debounced search functionality.",
  },
  {
    icon: <Music className="h-6 w-6" />,
    title: "Audio Player",
    description: "Play, pause, and seek tracks with a built-in audio player.",
  },
];
