import { Building2 } from "lucide-react";

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

export function BankLogo({ bankId, className = "" }: BankLogoProps) {
  const logo = bankLogos[bankId];

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
      alt={`${bankId} logo`}
      className={`object-contain rounded-lg ${className}`}
    />
  );
}
