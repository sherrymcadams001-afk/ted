import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tedlyns — Indulge Yourself",
    short_name: "Tedlyns",
    description:
      "Abuja's premier culinary logistics. Corporate catering, artisan bakes, and curated gifting.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#D4AF37",
    orientation: "portrait-primary",
    categories: ["food", "business", "lifestyle"],
    icons: [
      {
        src: "/favicon.ico",
        sizes: "64x64",
        type: "image/x-icon",
      },
      {
        src: "/icon",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
