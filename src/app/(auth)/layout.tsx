import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login — ResumeForge",
  description: "Sign in to ResumeForge to build your professional resume.",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent" />
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
