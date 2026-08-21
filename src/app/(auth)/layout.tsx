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
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Animated gradient orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-indigo-950/50 blur-[120px] animate-pulse" />
      <div
        className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[50%] rounded-full bg-violet-950/40 blur-[100px]"
        style={{ animationDelay: "2s", animationDuration: "4s" }}
      />
      <div className="absolute top-[40%] left-[60%] w-[25%] h-[30%] rounded-full bg-purple-950/30 blur-[80px] animate-pulse" style={{ animationDelay: "1s" }} />

      {/* Noise texture */}
      <div
        className="pointer-events-none fixed inset-0 z-[1] opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Subtle grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
