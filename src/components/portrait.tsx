import { cn } from "@/lib/utils";

export function Portrait({
  src,
  initials,
  alt,
  className,
}: {
  src?: string | null;
  initials: string;
  alt: string;
  className?: string;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn("object-cover", className)}
        decoding="async"
        loading="lazy"
      />
    );
  }
  return (
    <span
      className={cn(
        "grid place-items-center bg-elevated font-display text-accent",
        className,
      )}
    >
      {initials}
    </span>
  );
}
