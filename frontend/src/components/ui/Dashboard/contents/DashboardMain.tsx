function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-muted/50 rounded-lg ${className || ""}`}
    />
  );
}

export function MainDashboardTitle() {
  return <h1 className="text-xl font-bold text-accent/80">Dashboard</h1>;
}

export function MainDashboardContent() {
  return (
    <div className="dashboard-content w-full h-full flex items-center justify-center pb-4 gap-4">
      <div className="dashboard-content-left bg-card/50 border border-border/50 w-1/2 h-full flex flex-col relative rounded-2xl p-5 gap-4">
        <Skeleton className="w-1/3 h-6" />
        <Skeleton className="w-full h-32" />
        <Skeleton className="w-full h-24" />
        <Skeleton className="w-2/3 h-20" />
        <Skeleton className="w-full h-40" />
      </div>
      <div className="dashboard-content-right bg-card/50 border border-border/50 w-1/2 h-full flex flex-col relative rounded-2xl p-5 gap-4">
        <Skeleton className="w-1/4 h-6" />
        <div className="flex gap-3">
          <Skeleton className="w-24 h-24 rounded-xl" />
          <Skeleton className="w-24 h-24 rounded-xl" />
          <Skeleton className="w-24 h-24 rounded-xl" />
        </div>
        <Skeleton className="w-full h-20" />
        <Skeleton className="w-3/4 h-16" />
        <Skeleton className="w-full h-32" />
      </div>
    </div>
  );
}
