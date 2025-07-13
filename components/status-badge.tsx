import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return {
          label: "Pendiente",
          classes: "glass-effect text-yellow-400 border-yellow-500/30",
        };
      case "active":
        return {
          label: "Activo",
          classes: "glass-effect text-emerald-400 border-emerald-500/30",
        };
      case "completed":
        return {
          label: "Completado",
          classes: "glass-effect text-blue-400 border-blue-500/30",
        };
      case "cancelled":
        return {
          label: "Cancelado",
          classes: "glass-effect text-red-400 border-red-500/30",
        };
      case "disputed":
        return {
          label: "En Disputa",
          classes: "glass-effect text-orange-400 border-orange-500/30",
        };
      default:
        return {
          label: status,
          classes: "glass-effect text-muted-foreground border-glass-border",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge
      variant="outline"
      className={cn(config.classes, className)}
    >
      {config.label}
    </Badge>
  );
}

