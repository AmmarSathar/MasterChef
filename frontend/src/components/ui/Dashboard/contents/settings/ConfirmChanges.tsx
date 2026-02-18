import { Info } from "lucide-react";

export default function ConfirmChanges() {
  return (
    <div className="confirm-changes w-full bg-linear-to-br from-muted/80 to-muted/60 rounded-xl flex items-center justify-between z-20 px-6 py-4 transition-all duration-300">
      <div className="flex items-center justify-center gap-2">
        <Info size={18} />
        <span className="font-semibold text-sm text-foreground/90">
          Unsaved changes will be lost, Save when you can!
        </span>
      </div>

      <div className="flex items-center justify-center gap-4">
        <button type="reset" className="text-sm bg-none text-foreground font-normal hover:text-destructive hover:font-semibold transition-all duration-300 px-3 py-3">
          Cancel
        </button>
        <button type="submit" className="text-sm bg-primary brightness-110 hover:bg-primary/50 hover:font-semibold ring-primary-foreground/30 transition-all duration-300 px-5 py-3 rounded-2xl">
          Save Changes
        </button>
      </div>
    </div>
  );
}
