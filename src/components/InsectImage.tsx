import { useState } from "react";
import { Bug } from "lucide-react";
import { getInsectImage, type InsectStage } from "@/lib/insectImages";

interface Props {
  id: string;
  name: string;
  stage?: InsectStage;
  className?: string;
  imgClassName?: string;
  fallbackClassName?: string;
  rounded?: boolean;
}

/**
 * Displays a photo of an insect from public/assets/images/.
 * Falls back to a Bug lucide icon when no image is registered or the file 404s.
 */
export function InsectImage({
  id,
  name,
  stage = "adult",
  className = "",
  imgClassName = "h-full w-full object-cover",
  fallbackClassName = "h-1/2 w-1/2 text-primary/70",
  rounded = true,
}: Props) {
  const src = getInsectImage(id, stage);
  const [errored, setErrored] = useState(false);
  const shape = rounded ? "rounded-xl" : "";
  if (!src || errored) {
    return (
      <div className={`flex items-center justify-center overflow-hidden bg-gradient-to-br from-secondary/40 via-accent/30 to-primary/15 ${shape} ${className}`}>
        <Bug className={fallbackClassName} strokeWidth={1.25} />
      </div>
    );
  }
  return (
    <div className={`overflow-hidden bg-muted ${shape} ${className}`}>
      <img
        src={src}
        alt={name}
        loading="lazy"
        className={imgClassName}
        onError={() => setErrored(true)}
      />
    </div>
  );
}