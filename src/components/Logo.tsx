import Link from "next/link";

interface LogoProps {
  size?: "small" | "medium" | "large";
  className?: string;
}

export default function Logo({ size = "medium", className = "" }: LogoProps) {
  const sizes = {
    small: {
      image: "w-16 h-16",
      text: "text-2xl",
      gap: "gap-3",
    },
    medium: {
      image: "w-20 h-20",
      text: "text-3xl",
      gap: "gap-4",
    },
    large: {
      image: "w-24 h-24",
      text: "text-4xl",
      gap: "gap-4",
    },
  };

  const sizeClasses = sizes[size];

  return (
    <Link href="/" className={`inline-flex items-center ${sizeClasses.gap} justify-center ${className}`}>
      <img
        src="/img/butterfly.png"
        alt="Butterfly"
        className={`${sizeClasses.image} object-contain`}
      />
      <h1 className={`${sizeClasses.text} font-bold text-gray-900 dark:text-gray-100 hover:text-lime-500 dark:hover:text-lime-400 transition-colors cursor-pointer`}>
        Butterfly
      </h1>
    </Link>
  );
}
