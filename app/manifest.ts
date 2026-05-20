import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Casino Ledger",
    short_name: "Ledger",
    description: "カジノ収支を上品に記録する、大人のためのプレイヤー帳簿。",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0a0e0d",
    theme_color: "#0a0e0d",
    lang: "ja",
    categories: ["finance", "lifestyle", "utilities"],
    icons: [
      { src: "/icon", sizes: "any", type: "image/png", purpose: "any" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png", purpose: "any" },
    ],
  };
}
