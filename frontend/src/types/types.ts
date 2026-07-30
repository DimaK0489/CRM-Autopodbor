export type OrderStatus =
  | "NEW"
  | "IN_PROGRESS"
  | "INSPECTION"
  | "DEAL"
  | "CLOSED";

export type InspectionStatus = "RECOMMENDED" | "REJECTED" | "PENDING";

export interface CarInspection {
  id: string;
  carModel: string;
  year: number;
  price: number;
  link?: string | null;
  report: string;
  status: InspectionStatus;
  createdAt: string;
  orderId: string;
}

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
  inspections?: CarInspection[];
  isArchived: boolean;
}
