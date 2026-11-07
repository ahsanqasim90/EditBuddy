import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Xenvora Digital by Edit Buddy — Captions in motion",
  description: "Transcribe, style and export scroll-stopping captions with multilingual support, word timings and browser MP4 export.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
