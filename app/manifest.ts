import {
  BRAND_COLOR,
  APP_NAME,
  APP_DESCRIPTION,
  PWA_START_URL,
} from "@/lib/constants";
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Finanças Fullstack",
    short_name: "Finanças",
    description: APP_DESCRIPTION,
    start_url: PWA_START_URL,
    display: "standalone",
    background_color: "#ffffff",
    theme_color: BRAND_COLOR,
    icons: [
      {
        src: "/assets/tophat.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/assets/tophat.svg",
        sizes: "192x192",
        type: "image/svg+xml",
      },
      {
        src: "/assets/tophat.svg",
        sizes: "512x512",
        type: "image/svg+xml",
      },
    ],
  };
}
