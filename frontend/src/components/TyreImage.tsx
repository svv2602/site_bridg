import Image from "next/image";
import { Car, Truck } from "lucide-react";

interface TyreImageProps {
  imageUrl?: string;
  name: string;
  className?: string;
  iconSize?: "sm" | "md" | "lg";
  vehicleType?: "passenger" | "suv" | "lcv";
}

const iconSizes = {
  sm: "h-12 w-12",
  md: "h-20 w-20",
  lg: "h-40 w-40",
};

export function TyreImage({
  imageUrl,
  name,
  className = "",
  iconSize = "md",
  vehicleType = "passenger",
}: TyreImageProps) {
  const IconComponent = vehicleType === "lcv" ? Truck : Car;

  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={`Шина ${name}`}
        fill
        className={`object-contain p-4 ${className}`}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    );
  }

  // Fallback icon when no image
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <IconComponent className={`${iconSizes[iconSize]} text-primary/40`} />
    </div>
  );
}
