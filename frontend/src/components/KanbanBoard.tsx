import { useState, type FormEvent } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { Phone, Wallet, FileText, Clock, User, Plus, X } from "lucide-react";
import type { Order, OrderStatus } from "../types/types";
import {
  useOrders,
  useCreateOrder,
  useUpdateOrderStatus,
} from "../hooks/useOrders";

const COLUMNS: { id: OrderStatus; title: string }[] = [
  { id: "NEW", title: "Новые" },
  { id: "IN_PROGRESS", title: "В работе" },
  { id: "INSPECTION", title: "Осмотр" },
  { id: "DEAL", title: "Сделка" },
  { id: "CLOSED", title: "Закрыто" },
];

const STATUS_LABELS: Record<OrderStatus, string> = {
  NEW: "Новый",
  IN_PROGRESS: "В работе",
  INSPECTION: "Осмотр",
  DEAL: "Сделка",
  CLOSED: "Закрыто",
};

const columnColors: Record<OrderStatus, string> = {
  NEW: "bg-blue-50 border-blue-200",
  IN_PROGRESS: "bg-amber-50 border-amber-200",
  INSPECTION: "bg-purple-50 border-purple-200",
  DEAL: "bg-emerald-50 border-emerald-200",
  CLOSED: "bg-slate-50 border-slate-200",
};

const columnHeaders: Record<OrderStatus, string> = {
  NEW: "bg-blue-500",
  IN_PROGRESS: "bg-amber-500",
  INSPECTION: "bg-purple-500",
  DEAL: "bg-emerald-500",
  CLOSED: "bg-slate-500",
};

const statusColors: Record<OrderStatus, string> = {
  NEW: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-amber-100 text-amber-800",
  INSPECTION: "bg-purple-100 text-purple-800",
  DEAL: "bg-emerald-100 text-emerald-800",
  CLOSED: "bg-slate-100 text-slate-800",
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatBudget(budget: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(budget);
}

function KanbanCard({ order, index }: { order: Order; index: number }) {
  return (
    <Draggable draggableId={order.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 transition-all ${
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

function AddOrderModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [requirements, setRequirements] = useState("");

  const createOrder = useCreateOrder();

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (
      !clientName.trim() ||
      !clientPhone.trim() ||
      !budgetMax.trim() ||
      !requirements.trim()
    ) {
      return;
    }

    try {
      await createOrder.mutateAsync({
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        budgetMax: Number(budgetMax),
        requirements: requirements.trim(),
      });

      setClientName("");
      setClientPhone("");
      setBudgetMax("");
      setRequirements("");
      onClose();
    } catch (err) {
      console.error("Error creating order:", err);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Новая заявка</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Имя клиента <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Например, Иван Петров"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Телефон <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              placeholder="+375(29)123-45-67"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Максимальный бюджет ($) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={budgetMax}
              onChange={(e) => setBudgetMax(e.target.value)}
              placeholder="Например, 250000"
              required
              min={0}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Требования к автомобилю <span className="text-red-500">*</span>
            </label>
            <textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Седан, не старше 3 лет, пробег до 50 000 км"
              required
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={createOrder.isPending}
              className="px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-60"
            >
              {createOrder.isPending ? "Сохранение..." : "Добавить заявку"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function KanbanBoard() {
  const { data: orders = [], isLoading, isError } = useOrders();
  const updateStatus = useUpdateOrderStatus();
  const [modalOpen, setModalOpen] = useState(false);
  const [mobileColumn, setMobileColumn] = useState<OrderStatus>("NEW");

  function onDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as OrderStatus;

    updateStatus.mutate({ id: draggableId, status: newStatus });
  }

  function getColumnOrders(status: OrderStatus) {
    return orders.filter((o) => o.status === status);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 pt-16 sm:pt-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <User size={20} className="text-indigo-600 shrink-0" />
              <span>CRM Автоподбор</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 hidden sm:block">
              Перетаскивайте карточки между колонками для изменения статуса
              заявки
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm w-full sm:w-auto justify-center"
          >
            <Plus size={18} />
            Добавить заявку
          </button>
        </div>

        {/* Mobile column tabs */}
        <div className="flex sm:hidden gap-1 mb-4 overflow-x-auto pb-1 scrollbar-hide">
          {COLUMNS.map((column) => {
            const isActive = mobileColumn === column.id;
            const count = getColumnOrders(column.id).length;
            return (
              <button
                key={column.id}
                type="button"
                onClick={() => setMobileColumn(column.id)}
                className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {column.title} ({count})
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-400 text-lg">Загрузка заявок...</div>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-red-400 text-lg">Ошибка загрузки заявок</div>
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {COLUMNS.map((column) => {
                const columnOrders = getColumnOrders(column.id);
                // On mobile: only show the selected column
                const isHidden = mobileColumn !== column.id;
                return (
                  <div
                    key={column.id}
                    className={`rounded-xl border-2 ${columnColors[column.id]} flex flex-col ${
                      isHidden ? "hidden sm:flex" : "flex"
                    }`}
                  >
                    <div
                      className={`${columnHeaders[column.id]} text-white text-sm font-semibold px-4 py-2.5 rounded-t-xl flex items-center justify-between`}
                    >
                      <span>{column.title}</span>
                      <span className="bg-white/25 rounded-full px-2 py-0.5 text-xs">
                        {columnOrders.length}
                      </span>
                    </div>

                    <Droppable droppableId={column.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`flex-1 p-3 min-h-[200px] transition-colors ${
                            snapshot.isDraggingOver ? "bg-black/5" : ""
                          }`}
                        >
                          {columnOrders.length === 0 &&
                            !snapshot.isDraggingOver && (
                              <div className="flex items-center justify-center h-full text-gray-400 text-xs italic">
                                Нет заявок
                              </div>
                            )}
                          {columnOrders.map((order, index) => (
                            <KanbanCard
                              key={order.id}
                              order={order}
                              index={index}
                            />
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
          </DragDropContext>
        )}
      </div>

      <AddOrderModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
