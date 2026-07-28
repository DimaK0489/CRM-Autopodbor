import { Draggable } from "@hello-pangea/dnd";
import {
  Phone,
  Wallet,
  FileText,
  Clock,
  Car,
  Gauge,
  Calendar,
} from "lucide-react";
import type { Order } from "../types/types";
import { STATUS_LABELS, statusColors } from "../common/kanban-constants";

function formatBudget(budget: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(budget);
}

function formatMileage(km: number): string {
  return new Intl.NumberFormat("ru-RU").format(km) + " км";
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface Props {
  order: Order;
  index: number;
  onSelect: (order: Order) => void;
}

export default function KanbanCard({ order, index, onSelect }: Props) {
  return (
    <Draggable draggableId={order.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onSelect(order)}
          className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 transition-all cursor-pointer ${
            snapshot.isDragging
              ? "shadow-lg rotate-2 scale-105 ring-2 ring-indigo-400"
              : "hover:shadow-md hover:border-gray-300"
          }`}
        >
          <div className="flex flex-col gap-1 mb-3">
            <h3 className="font-bold text-gray-900 text-base leading-tight break-words pr-2">
              {order.clientName}
            </h3>
            <div className="flex">
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${
                  statusColors[order.status]
                }`}
              >
                {STATUS_LABELS[order.status]}
              </span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <Phone size={12} className="shrink-0 text-gray-400" />
              <span>{order.clientPhone}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Wallet size={12} className="shrink-0 text-gray-400" />
              <span>{formatBudget(order.budgetMax)}</span>
            </div>

            {order.carModel && (
              <div className="flex items-center gap-1.5">
                <Car size={12} className="shrink-0 text-gray-400" />
                <span className="font-semibold text-gray-700">
                  {order.carModel}
                </span>
              </div>
            )}
            {order.carYear && (
              <div className="flex items-center gap-1.5">
                <Calendar size={12} className="shrink-0 text-gray-400" />
                <span>{order.carYear} г.</span>
              </div>
            )}
            {order.carMileage !== undefined && order.carMileage !== null && (
              <div className="flex items-center gap-1.5">
                <Gauge size={12} className="shrink-0 text-gray-400" />
                <span>{formatMileage(order.carMileage)}</span>
              </div>
            )}

            <div className="flex items-start gap-1.5">
              <FileText size={12} className="shrink-0 text-gray-400 mt-0.5" />
              <span className="line-clamp-2">{order.requirements}</span>
            </div>
            <div className="flex items-center gap-1.5 pt-1 text-gray-400">
              <Clock size={11} />
              <span>{formatDate(order.createdAt)}</span>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
