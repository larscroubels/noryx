import type { BadgeTone } from "@/components/ui/badge";
import type { Database } from "@/types/database";

export type OrderStatus = Database["public"]["Enums"]["order_status"];
export type OrderPaymentStatus = Database["public"]["Enums"]["order_payment_status"];

/** Badge tones per status; labels live in the dictionaries under `retail.orders`. */
export const ORDER_STATUS_TONE: Record<OrderStatus, BadgeTone> = {
  pending: "warning",
  confirmed: "info",
  ready: "brand",
  completed: "success",
  cancelled: "neutral",
};

export const PAYMENT_STATUS_TONE: Record<OrderPaymentStatus, BadgeTone> = {
  unpaid: "outline",
  paid: "success",
  refunded: "neutral",
};

/** Next fulfilment step offered to the salon. Cancelling is handled separately (it restocks). */
export const NEXT_ORDER_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "confirmed",
  confirmed: "ready",
  ready: "completed",
};
