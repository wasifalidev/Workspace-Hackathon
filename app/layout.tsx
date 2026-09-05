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
  title: {
    default: "Workspace Manager — One Workspace. Every Project. Complete Control.",
    template: "%s | Workspace Manager",
  },
  description:
    "A professional collaborative project-management SaaS. Manage workspaces, projects, tasks, and your team with powerful Kanban, List, and Calendar views.",
  keywords: ["project management", "kanban", "team collaboration", "workspace", "tasks"],
  authors: [{ name: "Workspace Manager" }],
  openGraph: {
    title: "Workspace Manager",
    description: "One Workspace. Every Project. Complete Control.",
    type: "website",
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
