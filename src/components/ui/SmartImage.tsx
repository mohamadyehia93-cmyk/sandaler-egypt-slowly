import { useState, ImgHTMLAttributes } from "react";
import { Camera } from "lucide-react";
import { cn } from "@/lib/utils";

interface SmartImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt: string;
  /** Wrapper className (controls size/aspect). Image fills wrapper. */
  wrapperClassName?: string;
}

/**
 * Image with teal-tinted placeholder + camera icon shown on load and on error.
 * Lazy loads by default. Pass wrapperClassName to size the box.
 */
const SmartImage = ({
  src,
  alt,
  className,
  wrapperClassName,
  loading = "lazy",
  onLoad,
  onError,
  ...rest
}: SmartImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const showFallback = errored || !src;

  return (
    <div className={cn("relative w-full h-full overflow-hidden bg-primary/10", wrapperClassName)}>
      {(!loaded || showFallback) && (
        <div className="absolute inset-0 flex items-center justify-center bg-primary/10 animate-pulse">
          <Camera className="w-8 h-8 text-primary/50" strokeWidth={1.5} />
        </div>
      )}
      {!showFallback && (
        <img
          src={src}
          alt={alt}
          loading={loading}
          onLoad={(e) => {
            setLoaded(true);
            onLoad?.(e);
          }}
          onError={(e) => {
            setErrored(true);
            onError?.(e);
          }}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            loaded ? "opacity-100" : "opacity-0",
            className
          )}
          {...rest}
        />
      )}
    </div>
  );
};

export default SmartImage;
