import { Logo } from "@/components/icons/logo";
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
                <Logo className="h-10 w-10"/>
                <span className="font-bold text-2xl font-headline">AfriStory Hub</span>
            </Link>
        </div>
        {children}
    </div>
  );
}
