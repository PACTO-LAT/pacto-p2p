export const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-500";
    case "pending":
      return "bg-yellow-500";
    case "awaiting_payment":
      return "bg-orange-500";
    case "payment_confirmed":
      return "bg-emerald-600";
    case "completed":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

export const formatAmount = (amount: number) => {
  return amount.toLocaleString();
};

export const formatCurrency = (amount: number, currency: string) => {
  return `${amount.toLocaleString()} ${currency}`;
}; 