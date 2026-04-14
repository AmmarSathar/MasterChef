import { XCircle, CheckCircle2 } from "lucide-react";

interface PasswordRequirementsProps {
  requirements: Array<{
    complete: boolean;
    label: string;
  }>;
  show: boolean;
}

export default function PasswordRequirements({
  requirements,
  show,
}: PasswordRequirementsProps) {
  return (
    <div
      className={`PopoverContent absolute w-auto h-auto max-md:w-full max-md:fixed max-md:bottom-0 z-100 overflow-hidden p-6 bg-card/60 shadow-lg shadow-border rounded-2xl border-2 border-border/50 flex flex-col gap-5 transition-all duration-300 delay-150 pointer-events-none ${!show ? "-translate-y-5 opacity-0" : "translate-y-0 opacity-100"}`}
    >
      <div className="flex flex-col gap-7 max-md:gap-6 relative w-auto max-md:items-center max-md:justify-center">
        <span className="Text mb-3 max-md:mb-0 font-extrabold text-lg text-left text-accent text-shadow-sm text-shadow-foreground/10">
          Password Requirements
        </span>
        {requirements.map((req, index) => (
          <div
            className="flex gap-3 relative w-auto items-center justify-baseline p-0 m-0"
            key={index}
          >
            {req.complete ? (
              <CheckCircle2 color="#10b981" size={18} />
            ) : (
              <XCircle color="#ef4444" size={18}/>
            )}
            <span
              className={`Label relative whitespace-nowrap font-bold text-sm ${!req.complete && requirements.slice(0, index).every((r) => r.complete) ? "underline" : ""}`}
            >
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
