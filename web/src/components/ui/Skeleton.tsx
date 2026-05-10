export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-slate-300/30 dark:bg-slate-700/50 ${className ?? ""}`}
    />
  );
}

export function CurrentWeatherSkeleton() {
  return <Skeleton className="h-48 w-full" />;
}

export function HourlyForecastSkeleton() {
  return <Skeleton className="h-28 w-full" />;
}

export function DailyForecastSkeleton() {
  return <Skeleton className="h-64 w-full" />;
}

export function WeatherDetailsSkeleton() {
  return <Skeleton className="h-36 w-full" />;
}
