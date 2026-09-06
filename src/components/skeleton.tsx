/** Shimmering placeholder block (see .skeleton in globals.css). */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden />;
}

/** Loading placeholder that mirrors a data page's shape (title + metric grid). */
export function PageSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-5 w-40 rounded-full" />
      <Skeleton className="mt-4 h-12 w-72 max-w-full" />
      <Skeleton className="mt-6 h-20 w-full max-w-3xl" />
      <Skeleton className="mt-4 h-6 w-56 rounded-full" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="pop-card p-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-4 h-9 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
