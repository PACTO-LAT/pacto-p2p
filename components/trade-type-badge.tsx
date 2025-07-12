import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface TradeTypeBadgeProps {
  type: "buy" | "sell"
  className?: string
}

export function TradeTypeBadge({ type, className }: TradeTypeBadgeProps) {
  return (
    <Badge
      className={cn(
        "text-xs font-semibold px-3 py-1",
        type === "sell"
          ? "bg-red-100 text-red-700 border border-red-200"
          : "bg-green-100 text-green-700 border border-green-200",
        className,
      )}
    >
      {type === "sell" ? "VENDER" : "COMPRAR"}
    </Badge>
  )
}
