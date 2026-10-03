import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Historieloftet – finn gamle spor",
  description: "Utforsk bilder, museumsgjenstander, aviser, bøker og lyd fra tre historiske arkiver.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nb">
      <body className="antialiased">{children}</body>
    </html>
  );
}
