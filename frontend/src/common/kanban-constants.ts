import type { OrderStatus } from "../types/types";

export const COLUMNS: { id: OrderStatus; title: string }[] = [
  { id: "NEW", title: "Новые" },
  { id: "IN_PROGRESS", title: "В работе" },
  { id: "INSPECTION", title: "Осмотр" },
  { id: "DEAL", title: "Сделка" },
  { id: "CLOSED", title: "Закрыто" },
];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  NEW: "Новый",
  IN_PROGRESS: "В работе",
  INSPECTION: "Осмотр",
  DEAL: "Сделка",
  CLOSED: "Закрыто",
};

export const columnColors: Record<OrderStatus, string> = {
  NEW: "bg-blue-50 border-blue-200",
  IN_PROGRESS: "bg-amber-50 border-amber-200",
  INSPECTION: "bg-purple-50 border-purple-200",
  DEAL: "bg-emerald-50 border-emerald-200",
  CLOSED: "bg-slate-50 border-slate-200",
};

export const columnHeaders: Record<OrderStatus, string> = {
  NEW: "bg-blue-500",
  IN_PROGRESS: "bg-amber-500",
  INSPECTION: "bg-purple-500",
  DEAL: "bg-emerald-500",
  CLOSED: "bg-slate-500",
};

export const statusColors: Record<OrderStatus, string> = {
  NEW: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-amber-100 text-amber-800",
  INSPECTION: "bg-purple-100 text-purple-800",
  DEAL: "bg-emerald-100 text-emerald-800",
  CLOSED: "bg-slate-100 text-slate-800",
};

export const statusChangeColorMap: Record<OrderStatus, string> = {
  NEW: "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200",
  IN_PROGRESS:
    "bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200",
  INSPECTION:
    "bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200",
  DEAL: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200",
  CLOSED: "bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-200",
};

export function formatBudget(budget: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(budget);
}

export function formatMileage(km: number): string {
  return new Intl.NumberFormat("ru-RU").format(km) + " км";
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
