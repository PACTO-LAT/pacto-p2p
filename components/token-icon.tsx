import { cn } from "@/lib/utils"

interface TokenIconProps {
  token: string
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

export function TokenIcon({ token, size = "md", className }: TokenIconProps) {
  const getTokenColor = (token: string) => {
    switch (token) {
      case "CRCX":
        return "bg-green-500"
      case "MXNX":
        return "bg-red-500"
      case "USDC":
        return "bg-primary"
      default:
        return "bg-gray-500"
    }
  }

  const getSizeClasses = (size: string) => {
    switch (size) {
      case "sm":
        return "w-8 h-8 text-sm"
      case "md":
        return "w-12 h-12 text-lg"
      case "lg":
        return "w-16 h-16 text-xl"
      case "xl":
        return "w-20 h-20 text-2xl"
      default:
        return "w-12 h-12 text-lg"
    }
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center text-white font-bold",
        getTokenColor(token),
        getSizeClasses(size),
        className,
      )}
    >
      {token}
    </div>
  )
}
