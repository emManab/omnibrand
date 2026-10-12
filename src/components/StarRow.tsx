import { Star } from "lucide-react";

export function StarRow({ value }: { value: number }) {
  return (
    <span className="inline-flex text-amber-400">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < Math.round(value) ? "fill-amber-400" : "fill-line text-line"}
        />
      ))}
    </span>
  );
}
