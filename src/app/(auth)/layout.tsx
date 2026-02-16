import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="absolute top-8">
            <Link href="/" className="flex items-center space-x-2">
                <span className="font-display font-bold text-2xl">NexusHub<span className="text-primary">.</span></span>
            </Link>
        </div>
        {children}
    </div>
  );
}
