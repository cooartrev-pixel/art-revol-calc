import { useParams, Navigate } from "react-router-dom";
import ProgramCalculatorContent from "@/components/calculator/ProgramCalculator";
import { getProgramById } from "@/lib/programs-data";

const ProgramCalculatorPage = () => {
  const { programId } = useParams<{ programId: string }>();
  
  if (!programId) {
    return <Navigate to="/" replace />;
  }
  
  const program = getProgramById(programId);
  
  if (!program) {
    return <Navigate to="/" replace />;
  }
  
  return <ProgramCalculatorContent program={program} />;
};

export default ProgramCalculatorPage;
