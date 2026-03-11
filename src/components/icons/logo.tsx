import { cn } from "@/lib/utils";

/**
 * Logo officiel de NexusHub - Version Symbole Uniquement.
 * Représente le livre ouvert et les plumes croisées.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-12 w-auto", className)}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="NexusHub Official Symbol"
    >
      {/* Halo de lueur dorée en arrière-plan */}
      <circle cx="256" cy="256" r="220" fill="currentColor" fillOpacity="0.05" className="text-primary" />
      
      {/* Le Livre Ouvert (Symbole du Savoir et du Récit) */}
      <path
        d="M256 380C256 380 180 360 100 360V160C180 160 256 180 256 180M256 380C256 380 332 360 412 360V160C332 160 256 180 256 180"
        stroke="currentColor"
        strokeWidth="16"
        strokeLinejoin="round"
        strokeLinecap="round"
        className="text-foreground"
      />
      
      {/* Plumes Croisées (Symbole de la Création et de l'Art) */}
      <g className="text-primary">
        <path
          d="M120 120L392 392"
          stroke="currentColor"
          strokeWidth="24"
          strokeLinecap="round"
          className="drop-shadow-lg"
        />
        <path
          d="M392 120L120 392"
          stroke="currentColor"
          strokeWidth="24"
          strokeLinecap="round"
          className="drop-shadow-lg"
        />
        
        {/* Détails des pointes de plumes */}
        <path d="M105 105L135 135L145 125L115 95L105 105Z" fill="currentColor" />
        <path d="M407 105L377 135L367 125L397 95L407 105Z" fill="currentColor" />
      </g>

      {/* Cœur du Nexus (Point de convergence) */}
      <circle cx="256" cy="256" r="30" fill="currentColor" className="text-primary" />
      <circle cx="256" cy="256" r="15" fill="currentColor" className="text-stone-950" />
    </svg>
  );
}
