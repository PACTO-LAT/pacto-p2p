import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return { variant: "default" as const, text: "Activo", classes: "bg-green-100 text-green-800 border-green-200" }
      case "pending":
        return {
          variant: "secondary" as const,
          text: "Pendiente",
          classes: "bg-yellow-100 text-yellow-800 border-yellow-200",
        }
      case "awaiting_payment":
        return {
          variant: "secondary" as const,
          text: "Esperando Pago",
          classes: "bg-orange-100 text-orange-800 border-orange-200",
        }
      case "payment_confirmed":
        return {
          variant: "default" as const,
          text: "Pago Confirmado",
          classes: "bg-primary-100 text-primary-800 border-primary-200",
        }
      case "completed":
        return {
          variant: "default" as const,
          text: "Completado",
          classes: "bg-green-100 text-green-800 border-green-200",
        }
      default:
        return { variant: "secondary" as const, text: status, classes: "" }
    }
  }

  const badgeConfig = getStatusBadge(status)

  return <Badge className={cn(badgeConfig.classes, className)}>{badgeConfig.text}</Badge>
}
