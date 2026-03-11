import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-12 w-auto", className)}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="NexusHub Official Logo"
    >
      {/* Outer Glow / Base */}
      <circle cx="256" cy="256" r="220" fill="currentColor" fillOpacity="0.03" className="text-primary" />
      
      {/* Open Book Symbol */}
      <path
        d="M256 380C256 380 180 360 100 360V160C180 160 256 180 256 180M256 380C256 380 332 360 412 360V160C332 160 256 180 256 180"
        stroke="currentColor"
        strokeWidth="16"
        strokeLinejoin="round"
        strokeLinecap="round"
        className="text-foreground"
      />
      
      {/* Book Internal Pages (Subtle Details) */}
      <path d="M130 200H230M130 240H230M130 280H200" stroke="currentColor" strokeWidth="8" strokeLinecap="round" opacity="0.1" className="text-foreground" />
      <path d="M382 200H282M382 240H282M382 280H312" stroke="currentColor" strokeWidth="8" strokeLinecap="round" opacity="0.1" className="text-foreground" />

      {/* Crossed Stylized Pens */}
      <g className="text-primary">
        <path
          d="M100 100L412 412"
          stroke="currentColor"
          strokeWidth="28"
          strokeLinecap="round"
          className="drop-shadow-lg"
        />
        <path
          d="M412 100L100 412"
          stroke="currentColor"
          strokeWidth="28"
          strokeLinecap="round"
          className="drop-shadow-lg"
        />
        
        {/* Pen Nibs Details */}
        <path d="M85 85L115 115L125 105L95 75L85 85Z" fill="currentColor" />
        <path d="M427 85L397 115L387 105L417 75L427 85Z" fill="currentColor" />
      </g>

      {/* Central Nexus Core */}
      <circle cx="256" cy="256" r="40" fill="currentColor" className="text-primary" stroke="currentColor" strokeWidth="10" className="text-stone-950" />
      <circle cx="256" cy="256" r="20" fill="currentColor" className="text-stone-950" />
      
      {/* Dynamic Accents */}
      <circle cx="100" cy="360" r="10" fill="currentColor" className="text-primary" />
      <circle cx="412" cy="360" r="10" fill="currentColor" className="text-primary" />
    </svg>
  );
}
