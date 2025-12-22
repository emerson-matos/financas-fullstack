import {
  BRAND_COLOR,
  APP_NAME,
  APP_DESCRIPTION,
  PWA_START_URL,
} from "@/lib/constants";
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_NAME,
    short_name: "Finanças",
    description: APP_DESCRIPTION,
    start_url: PWA_START_URL,
    display: "standalone",
    background_color: "#ffffff",
    theme_color: BRAND_COLOR,
    icons: [
      {
        src: "/icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/assets/Building blocks-amico.svg",
        sizes: "1280x720",
        type: "image/svg+xml",
        form_factor: "wide",
      },
      {
        src: "/assets/404 Error-rafiki.svg",
        sizes: "720x1280",
        type: "image/svg+xml",
        form_factor: "narrow",
      },
    ],
  };
}
