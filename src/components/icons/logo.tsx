import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-10 w-auto", className)}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="NexusHub Official Logo"
    >
      {/* Background Book Structure */}
      <path
        d="M40 120C40 110 50 105 60 105H100V150H60C50 150 40 145 40 135V120Z"
        fill="currentColor"
        className="text-stone-900"
      />
      <path
        d="M160 120C160 110 150 105 140 105H100V150H140C150 150 160 145 160 135V120Z"
        fill="currentColor"
        className="text-stone-900"
      />
      
      {/* Book Pages Highlights */}
      <path
        d="M60 110H95V145H60C55 145 50 142 50 135V120C50 115 55 110 60 110Z"
        fill="white"
        fillOpacity="0.1"
      />
      <path
        d="M140 110H105V145H140C145 145 150 142 150 135V120C150 115 145 110 140 110Z"
        fill="white"
        fillOpacity="0.1"
      />

      {/* Gold Book Edges */}
      <path
        d="M40 135C40 145 50 150 60 150H100M160 135C160 145 150 150 140 150H100"
        stroke="hsl(var(--primary))"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Crossed Fountain Pens */}
      {/* Pen 1 (Top Left to Bottom Right) */}
      <g transform="rotate(-45 100 100)">
        <rect x="60" y="95" width="80" height="10" rx="2" fill="currentColor" className="text-stone-200" />
        <path d="M140 100L155 100L160 95L160 105L155 100Z" fill="currentColor" className="text-stone-200" />
        <rect x="70" y="95" width="40" height="10" fill="hsl(var(--primary))" />
      </g>

      {/* Pen 2 (Top Right to Bottom Left) */}
      <g transform="rotate(45 100 100)">
        <rect x="60" y="95" width="80" height="10" rx="2" fill="currentColor" className="text-stone-200" />
        <path d="M140 100L155 100L160 95L160 105L155 100Z" fill="currentColor" className="text-stone-200" />
        <rect x="70" y="95" width="40" height="10" fill="hsl(var(--primary))" />
      </g>

      {/* Center Focus Circle */}
      <circle
        cx="100"
        cy="100"
        r="12"
        fill="hsl(var(--primary))"
        stroke="currentColor"
        strokeWidth="3"
        className="text-stone-950"
      />
      
      {/* Small Decorative Dots */}
      <circle cx="65" cy="125" r="4" fill="hsl(var(--primary))" />
      <circle cx="135" cy="125" r="4" fill="hsl(var(--primary))" />
    </svg>
  );
}
