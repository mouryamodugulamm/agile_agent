import { cn } from "@/lib/utils"

type BrandLogoProps = {
  className?: string
  accentClassName?: string
}

export function BrandLogo({
  className,
  accentClassName,
}: BrandLogoProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold tracking-tight text-base sm:text-lg",
        className
      )}
    >
      <span className="leading-none">Agile Agent</span>
      <span
        className={cn(
          "ml-1 inline-block leading-none text-rose-500",
          accentClassName
        )}
      >
        .
      </span>
    </span>
  )
}




