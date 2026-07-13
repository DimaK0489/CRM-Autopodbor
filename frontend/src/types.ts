export type OrderStatus =
  | "NEW"
  | "IN_PROGRESS"
  | "INSPECTION"
  | "DEAL"
  | "CLOSED";

export interface Order {
  id: string;
  clientName: string;
  clientPhone: string;
  budgetMax: number;
  requirements: string;
  status: OrderStatus;
  createdAt: string;
}
