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
      <circle cx="256" cy="200" r="180" fill="currentColor" fillOpacity="0.03" className="text-primary" />
      
      {/* Open Book Path */}
      <path
        d="M256 300C256 300 180 280 100 280V120C180 120 256 140 256 140M256 300C256 300 332 280 412 280V120C332 120 256 140 256 140"
        stroke="currentColor"
        strokeWidth="12"
        strokeLinejoin="round"
        className="text-foreground"
      />
      
      {/* Book Internal Pages */}
      <path d="M120 150H230M120 185H230M120 220H200" stroke="currentColor" strokeWidth="6" strokeLinecap="round" opacity="0.2" className="text-foreground" />
      <path d="M392 150H282M392 185H282M392 220H312" stroke="currentColor" strokeWidth="6" strokeLinecap="round" opacity="0.2" className="text-foreground" />

      {/* Crossed Fountain Pens */}
      <g className="text-primary">
        {/* Pen 1 */}
        <path
          d="M80 80L432 320"
          stroke="currentColor"
          strokeWidth="24"
          strokeLinecap="round"
        />
        <path d="M70 70L95 95L105 85L80 60L70 70Z" fill="currentColor" />
        
        {/* Pen 2 */}
        <path
          d="M432 80L80 320"
          stroke="currentColor"
          strokeWidth="24"
          strokeLinecap="round"
        />
        <path d="M442 70L417 95L407 85L432 60L442 70Z" fill="currentColor" />
      </g>

      {/* Central Connector Circle */}
      <circle cx="256" cy="200" r="30" fill="currentColor" className="text-primary" stroke="currentColor" strokeWidth="8" className="text-stone-950" />
      <circle cx="256" cy="200" r="15" fill="currentColor" className="text-stone-950" />

      {/* Stylized Text "NEXUSHUB" at the bottom */}
      <text
        x="256"
        y="420"
        textAnchor="middle"
        fill="currentColor"
        style={{
          fontFamily: 'var(--font-cinzel), serif',
          fontWeight: 900,
          fontSize: '72px',
          letterSpacing: '0.05em'
        }}
        className="text-foreground"
      >
        NEXUSHUB
      </text>
      
      {/* Accent Dots */}
      <circle cx="100" cy="280" r="8" fill="currentColor" className="text-primary" />
      <circle cx="412" cy="280" r="8" fill="currentColor" className="text-primary" />
    </svg>
  );
}
