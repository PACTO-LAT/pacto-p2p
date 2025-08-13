export default function Loading() {
  return (
    <div className="container mx-auto max-w-6xl space-y-4 p-4 sm:p-6">
      <div className="grid grid-cols-3 gap-3">
        {['a', 'b', 'c'].map((k) => (
          <div key={k} className="h-24 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      <div className="h-64 animate-pulse rounded-2xl bg-muted" />
    </div>
  );
}
