import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/components/providers/StoreProvider";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://wasifworkspace.vercel.app'),
  title: {
    default: "Wasif's Workspace — One Workspace. Every Project. Complete Control.",
    template: "%s | Wasif's Workspace",
  },
  description:
    "Wasif's Workspace: The professional collaborative project-management SaaS. Manage workspaces, projects, tasks, and teams with powerful Kanban, List, and Calendar views.",
  keywords: ["project management", "kanban", "team collaboration", "workspace", "tasks", "Wasif's Workspace"],
  authors: [{ name: "Wasif's Workspace" }],
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Wasif's Workspace",
    description: "One Workspace. Every Project. Complete Control.",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 800,
        alt: "Wasif's Workspace Logo",
      },
    ],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} dark`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <StoreProvider>
          {children}
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: "var(--color-surface-container-high)",
                border: "1px solid var(--color-outline-variant)",
                color: "var(--color-on-surface)",
              },
            }}
          />
        </StoreProvider>
      </body>
    </html>
  );
}
