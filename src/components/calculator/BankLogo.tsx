import { Building2 } from "lucide-react";
import { banks } from "@/lib/banks-data";

// Import bank logos
import oschadbankLogo from "@/assets/banks/oschadbank.svg";
import privatbankLogo from "@/assets/banks/privatbank.svg";
import ukrgasbankLogo from "@/assets/banks/ukrgasbank.svg";
import globusLogo from "@/assets/banks/globus.svg";
import skybankLogo from "@/assets/banks/skybank.svg";
import sensebankLogo from "@/assets/banks/sensebank.svg";
import creditdniproLogo from "@/assets/banks/creditdnipro.svg";
import tascombankLogo from "@/assets/banks/tascombank.svg";
import bisbankLogo from "@/assets/banks/bisbank.svg";
import radabankLogo from "@/assets/banks/radabank.svg";

interface BankLogoProps {
  bankId: string;
  className?: string;
  clickable?: boolean;
}

const bankLogos: Record<string, string> = {
  oschadbank: oschadbankLogo,
  privatbank: privatbankLogo,
  ukrgasbank: ukrgasbankLogo,
  globus: globusLogo,
  skybank: skybankLogo,
  sensebank: sensebankLogo,
  creditdnipro: creditdniproLogo,
  tascombank: tascombankLogo,
  bisbank: bisbankLogo,
  radabank: radabankLogo,
};

export function BankLogo({ bankId, className = "", clickable = false }: BankLogoProps) {
  const logo = bankLogos[bankId];
  const bank = banks.find(b => b.id === bankId);

  const renderLogo = () => {
    if (!logo) {
      return (
        <div className={`flex items-center justify-center rounded-lg bg-muted ${className}`}>
          <Building2 className="h-5 w-5 text-muted-foreground" />
        </div>
      );
    }

    return (
      <img
        src={logo}
        alt={bank?.name || `${bankId} logo`}
        className={`object-contain rounded-lg ${className}`}
        loading="lazy"
        decoding="async"
      />
    );
  };

  if (clickable && bank?.website) {
    return (
      <a
        href={bank.website}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
        aria-label={`Перейти на сайт ${bank.name}`}
      >
        {renderLogo()}
      </a>
    );
  }

  return renderLogo();
}
