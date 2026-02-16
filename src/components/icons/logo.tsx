import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-8 w-auto text-primary", className)}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="NexusHub Logo"
    >
      <path
        d="M50 10C27.9086 10 10 27.9086 10 50C10 72.0914 27.9086 90 50 90"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M50 90C72.0914 90 90 72.0914 90 50C90 27.9086 72.0914 10 50 10"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray="5 25"
      />
      <path
        d="M35 35C43.2843 35 50 41.7157 50 50C50 58.2843 43.2843 65 35 65"
        stroke="hsl(var(--accent))"
        strokeWidth="8"
        strokeLinecap="round"
      />
    </svg>
  );
}
