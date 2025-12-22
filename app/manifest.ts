import {
  BRAND_COLOR,
  APP_NAME,
  APP_DESCRIPTION,
  PWA_START_URL,
} from "@/lib/constants";
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/dashboard",
    icons: [
      {
        src: "/assets/tophat.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/assets/tophat.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/assets/building-blocks-amico.svg",
        sizes: "1280x720",
        type: "image/svg+xml",
        form_factor: "wide",
      },
      {
        src: "/assets/404-error-rafiki.svg",
        sizes: "720x1280",
        type: "image/svg+xml",
        form_factor: "narrow",
      },
    ],
  };
}
