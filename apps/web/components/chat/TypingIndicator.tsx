'use client';

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1 text-xs text-muted-foreground">
      <span>typing</span>
      <span className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </span>
    </div>
  );
}
