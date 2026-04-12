import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  size?: "sm" | "md";
}

const StarRating = ({ rating, maxRating = 5, interactive = false, onChange, size = "sm" }: StarRatingProps) => {
  const sizeClass = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: maxRating }, (_, i) => (
        <Star
          key={i}
          className={cn(
            sizeClass,
            "transition-colors",
            i < rating ? "fill-accent text-accent" : "fill-none text-muted",
            interactive && "cursor-pointer hover:text-accent"
          )}
          onClick={interactive && onChange ? () => onChange(i + 1) : undefined}
        />
      ))}
    </div>
  );
};

export default StarRating;
