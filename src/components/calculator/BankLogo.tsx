import { Building2 } from "lucide-react";

interface BankLogoProps {
  bankId: string;
  className?: string;
}

// Bank brand colors based on official branding
const bankBrands: Record<string, { 
  primary: string; 
  secondary?: string; 
  textColor: string; 
  shortName: string;
  gradient?: boolean;
}> = {
  oschadbank: { 
    primary: "#00a651", 
    textColor: "#ffffff", 
    shortName: "О",
  },
  privatbank: { 
    primary: "#1a4731", 
    secondary: "#44b78b",
    textColor: "#ffffff", 
    shortName: "П",
    gradient: true,
  },
  ukrgasbank: { 
    primary: "#006837", 
    secondary: "#8dc63f",
    textColor: "#ffffff", 
    shortName: "У",
    gradient: true,
  },
  globus: { 
    primary: "#0066b3", 
    textColor: "#ffffff", 
    shortName: "G",
  },
  skybank: { 
    primary: "#00a0e3", 
    secondary: "#0066a1",
    textColor: "#ffffff", 
    shortName: "S",
    gradient: true,
  },
  sensebank: { 
    primary: "#ff6600", 
    textColor: "#ffffff", 
    shortName: "S",
  },
  creditdnipro: { 
    primary: "#003366", 
    secondary: "#0066cc",
    textColor: "#ffffff", 
    shortName: "К",
    gradient: true,
  },
  tascombank: { 
    primary: "#1e3a5f", 
    secondary: "#3a6ea5",
    textColor: "#ffffff", 
    shortName: "Т",
    gradient: true,
  },
  bisbank: { 
    primary: "#f7941d", 
    textColor: "#ffffff", 
    shortName: "B",
  },
  radabank: { 
    primary: "#0033a0", 
    secondary: "#0066cc",
    textColor: "#ffffff", 
    shortName: "Р",
    gradient: true,
  },
};

export function BankLogo({ bankId, className = "" }: BankLogoProps) {
  const brand = bankBrands[bankId];

  if (!brand) {
    return (
      <div className={`flex items-center justify-center rounded-lg bg-muted ${className}`}>
        <Building2 className="h-5 w-5 text-muted-foreground" />
      </div>
    );
  }

  const backgroundStyle = brand.gradient && brand.secondary
    ? { 
        background: `linear-gradient(135deg, ${brand.primary} 0%, ${brand.secondary} 100%)`,
        color: brand.textColor 
      }
    : { 
        backgroundColor: brand.primary, 
        color: brand.textColor 
      };

  return (
    <div
      className={`flex items-center justify-center rounded-lg font-bold text-lg shadow-sm ${className}`}
      style={backgroundStyle}
    >
      {brand.shortName}
    </div>
  );
}
