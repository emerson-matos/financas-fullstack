import { cn } from "@/lib/utils";
import Logo from "@/public/assets/tophat.svg";
import Image, { type ImageProps } from "next/image";
type TopHatLogoProps = Omit<ImageProps, "src" | "alt"> & {
  className?: string;
};
export function TopHatLogo({ className, ...props }: TopHatLogoProps) {
  return (
    <Image
      src={Logo}
      alt="TopHat Logo"
      className={cn("size-8", className)}
      {...props}
    />
  );
}
