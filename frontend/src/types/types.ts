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
  carModel?: string | null;
  carYear?: number | null;
  carMileage?: number | null;
  createdAt: string;
}
