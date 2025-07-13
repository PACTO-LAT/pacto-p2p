import { cn } from "@/lib/utils";

interface TokenIconProps {
  token: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function TokenIcon({ token, size = "md", className }: TokenIconProps) {
  const getTokenColor = (token: string) => {
    switch (token.toUpperCase()) {
      case "CRCX":
        return "bg-green-500";
      case "MXNX":
        return "bg-red-500";
      case "USDC":
        return "bg-emerald-600";
      default:
        return "bg-emerald-600";
    }
  };

  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-12 h-12 text-lg",
  };

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold text-white",
        getTokenColor(token),
        sizeClasses[size],
        className
      )}
    >
      {token.slice(0, 2)}
    </div>
  );
}
