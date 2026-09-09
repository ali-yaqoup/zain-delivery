"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  src: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
};

const FALLBACK =
  "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=400&q=60";

function canOptimize(src: string) {
  if (src.startsWith("/")) return true;
  try {
    const host = new URL(src).hostname;
    return (
      host === "storage.googleapis.com" ||
      host === "king-pizza-menu.vercel.app" ||
      host === "images.unsplash.com"
    );
  } catch {
    return false;
  }
}

export function ProductImage({
  src,
  alt = "",
  className = "",
  width = 112,
  height = 112,
  sizes = "112px",
  priority = false,
}: Props) {
  const [failed, setFailed] = useState(false);
  const finalSrc = failed || !src ? FALLBACK : src;

  if (!canOptimize(finalSrc)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={finalSrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={className}
      />
    );
  }

  return (
    <Image
      src={finalSrc}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
