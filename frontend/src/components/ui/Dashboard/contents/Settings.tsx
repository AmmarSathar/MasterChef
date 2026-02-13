function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-muted/50 rounded-lg ${className || ""}`}
    />
  );
}
export function SettingsTitle() {
  return <h1 className="text-xl font-bold text-accent/80">Settings</h1>;
}

export function SettingsContent() {
  return (
    <div className="settings-content w-full h-full flex items-center justify-center pb-4 gap-4">
      <div className="settings-content-left bg-card/50 border border-border/50 w-130 h-full flex flex-col relative rounded-2xl p-5 gap-4">
        <Skeleton className="w-full h-32" /> 
        <Skeleton className="w-full h-12 mt-7" />
        <Skeleton className="w-full h-12 mt-3" />
        <Skeleton className="w-full h-12 mt-3" />
        <Skeleton className="w-full h-12 mt-3" />
        <Skeleton className="w-full h-12 mt-3" />
        <Skeleton className="w-full h-12 mt-3" />
        <Skeleton className="w-full h-12 mt-3" />
      </div>
      <div className="settings-content-right bg-card/50 border border-border/50 w-full h-full flex flex-col relative rounded-2xl p-5 gap-4">
        <Skeleton className="w-1/3 h-14 mb-10" />
        <div className="flex gap-6 mb-5">
          <Skeleton className="w-40 h-32 rounded-xl" />
          <Skeleton className="w-40 h-32 rounded-xl" />
          <Skeleton className="w-40 h-32 rounded-xl" />
        </div>
        <Skeleton className="w-1/3 h-13 mb-5" />
        <Skeleton className="w-1/3 h-13 mb-5" />
        <Skeleton className="w-1/3 h-13 mb-5" />
        <Skeleton className="w-1/3 h-13 mb-5" />
        <Skeleton className="w-1/2 h-13" />
      </div>
    </div>
  );
}
