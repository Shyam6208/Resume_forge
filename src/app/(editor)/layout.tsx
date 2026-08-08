import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Resume Editor — ResumeForge",
  description: "Build and customize your professional resume with real-time preview.",
};

export default function EditorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans antialiased overflow-hidden">
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "8px",
            background: "hsl(222.2 84% 4.9%)",
            color: "hsl(210 40% 98%)",
          },
        }}
      />
    </div>
  );
}
