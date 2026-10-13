import React, { useState } from "react";
import { cn } from "@/lib/cn";

interface MediaDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string;
  videoSrc?: string;
  alt?: string;
  poster?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  hoverPlay?: boolean;
  imgClassName?: string;
  videoClassName?: string;
}

/**
 * Universal media renderer that supports both images and real videos.
 * When videoSrc is provided, it attempts to play the video.
 * If the video fails to load (e.g. file not added to /assets yet),
 * it seamlessly and gracefully falls back to the image.
 */
export function MediaDisplay({
  src,
  videoSrc,
  alt = "",
  poster,
  autoPlay = true,
  loop = true,
  muted = true,
  playsInline = true,
  hoverPlay = false,
  imgClassName,
  videoClassName,
  className,
  ...props
}: MediaDisplayProps) {
  const [videoError, setVideoError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const shouldPlayVideo = Boolean(videoSrc && !videoError && (!hoverPlay || isHovered));

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      onMouseEnter={() => hoverPlay && setIsHovered(true)}
      onMouseLeave={() => hoverPlay && setIsHovered(false)}
      {...props}
    >
      {shouldPlayVideo ? (
        <video
          src={videoSrc}
          poster={poster || src}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          playsInline={playsInline}
          onError={() => setVideoError(true)}
          className={cn(
            "h-full w-full object-cover transition-transform duration-500",
            videoClassName
          )}
        />
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={cn(
            "h-full w-full object-cover transition-transform duration-500",
            imgClassName
          )}
        />
      )}
    </div>
  );
}
