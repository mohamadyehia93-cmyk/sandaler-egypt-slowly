import { useEffect, useState } from "react";

/**
 * Renders an avatar image, or the person/organisation initials when the URL is
 * missing OR fails to load. Never leaves the browser showing raw alt text.
 * `className` fully controls size, radius and border.
 */
const Avatar = ({
  src,
  name,
  className = "w-14 h-14 rounded-full border-2 border-primary/20",
  onClick,
}: {
  src?: string | null;
  name?: string | null;
  className?: string;
  onClick?: () => void;
}) => {
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [src]);

  const initials =
    (name || "")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "?";

  const shared = `${className} object-cover flex-shrink-0 ${onClick ? "cursor-pointer" : ""}`;

  if (!src || broken) {
    return (
      <div
        onClick={onClick}
        aria-label={name || undefined}
        className={`${shared} bg-primary/10 text-primary font-bold flex items-center justify-center text-sm`}
      >
        {initials}
      </div>
    );
  }

  return <img src={src} alt="" onError={() => setBroken(true)} onClick={onClick} className={shared} />;
};

export default Avatar;
