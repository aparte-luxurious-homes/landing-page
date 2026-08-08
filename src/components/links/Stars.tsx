interface StarsProps {
  rating: number;
  count?: number;
  className?: string;
}

export default function Stars({ rating, count, className = "" }: StarsProps) {
  if (!count) return null;
  return (
    <span className={`inline-flex items-center gap-1 text-sm ${className}`}>
      <span aria-hidden className="text-accent">★</span>
      <span className="font-medium">{rating.toFixed(1)}</span>
      <span className="text-neutral-500">· {count} review{count === 1 ? "" : "s"}</span>
    </span>
  );
}
