export default function Loading() {
  return (
    <div className="container mx-auto max-w-6xl space-y-4 p-4 sm:p-6">
      <div className="h-40 w-full animate-pulse rounded-2xl bg-muted" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {['a', 'b', 'c', 'd', 'e'].map((k) => (
          <div key={k} className="h-20 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-56 animate-pulse rounded-2xl bg-muted" />
        <div className="h-56 animate-pulse rounded-2xl bg-muted" />
      </div>
      <div className="h-40 animate-pulse rounded-2xl bg-muted" />
    </div>
  );
}
