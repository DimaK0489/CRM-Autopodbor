import { useState, type FormEvent } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import {
  Phone,
  Wallet,
  FileText,
  Clock,
  User,
  Plus,
  X,
  Edit3,
  Trash2,
  Car,
  Gauge,
  Calendar,
  Search,
} from "lucide-react";
import type { Order, OrderStatus } from "../types/types";
import {
  useOrders,
  useCreateOrder,
  useUpdateOrderStatus,
  useUpdateOrder,
  useDeleteOrder,
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
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(budget);
}

function formatMileage(km: number): string {
  return new Intl.NumberFormat("ru-RU").format(km) + " км";
}

function KanbanCard({
  order,
  index,
  onSelect,
}: {
  order: Order;
  index: number;
  onSelect: (order: Order) => void;
}) {
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

            {/* Car info */}
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
  const [carModel, setCarModel] = useState("");
  const [carYear, setCarYear] = useState("");
  const [carMileage, setCarMileage] = useState("");

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
        carModel: carModel.trim() || undefined,
        carYear: carYear ? Number(carYear) : undefined,
        carMileage: carMileage ? Number(carMileage) : undefined,
      });

      setClientName("");
      setClientPhone("");
      setBudgetMax("");
      setRequirements("");
      setCarModel("");
      setCarYear("");
      setCarMileage("");
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

          {/* Car info */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Марка / Модель
              </label>
              <input
                type="text"
                value={carModel}
                onChange={(e) => setCarModel(e.target.value)}
                placeholder="Toyota Camry"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Год
              </label>
              <input
                type="number"
                value={carYear}
                onChange={(e) => setCarYear(e.target.value)}
                placeholder="2020"
                min={1900}
                max={2030}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Пробег (км)
            </label>
            <input
              type="number"
              value={carMileage}
              onChange={(e) => setCarMileage(e.target.value)}
              placeholder="50000"
              min={0}
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

function OrderDetailsModal({
  order,
  onClose,
  onUpdate,
}: {
  order: Order;
  onClose: () => void;
  onUpdate: (order: Order) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [clientName, setClientName] = useState(order.clientName);
  const [clientPhone, setClientPhone] = useState(order.clientPhone);
  const [budgetMax, setBudgetMax] = useState(String(order.budgetMax));
  const [requirements, setRequirements] = useState(order.requirements);
  const [carModel, setCarModel] = useState(order.carModel ?? "");
  const [carYear, setCarYear] = useState(
    order.carYear ? String(order.carYear) : "",
  );
  const [carMileage, setCarMileage] = useState(
    order.carMileage !== null && order.carMileage !== undefined
      ? String(order.carMileage)
      : "",
  );

  const [confirmDelete, setConfirmDelete] = useState(false);

  const updateOrder = useUpdateOrder();
  const updateStatus = useUpdateOrderStatus();
  const deleteOrder = useDeleteOrder();

  // Reset form fields when order changes
  if (!editing) {
    if (clientName !== order.clientName) setClientName(order.clientName);
    if (clientPhone !== order.clientPhone) setClientPhone(order.clientPhone);
    if (budgetMax !== String(order.budgetMax))
      setBudgetMax(String(order.budgetMax));
    if (requirements !== order.requirements)
      setRequirements(order.requirements);
    if (carModel !== (order.carModel ?? "")) setCarModel(order.carModel ?? "");
    if (carYear !== (order.carYear ? String(order.carYear) : ""))
      setCarYear(order.carYear ? String(order.carYear) : "");
    if (
      carMileage !==
      (order.carMileage !== null && order.carMileage !== undefined
        ? String(order.carMileage)
        : "")
    )
      setCarMileage(
        order.carMileage !== null && order.carMileage !== undefined
          ? String(order.carMileage)
          : "",
      );
  }

  function handleCancel() {
    setClientName(order.clientName);
    setClientPhone(order.clientPhone);
    setBudgetMax(String(order.budgetMax));
    setRequirements(order.requirements);
    setCarModel(order.carModel ?? "");
    setCarYear(order.carYear ? String(order.carYear) : "");
    setCarMileage(
      order.carMileage !== null && order.carMileage !== undefined
        ? String(order.carMileage)
        : "",
    );
    setEditing(false);
  }

  async function handleSave() {
    if (!clientName.trim() || !clientPhone.trim() || !budgetMax.trim()) return;

    try {
      const updated = await updateOrder.mutateAsync({
        id: order.id,
        data: {
          clientName: clientName.trim(),
          clientPhone: clientPhone.trim(),
          budgetMax: Number(budgetMax),
          requirements: requirements.trim(),
          carModel: carModel.trim() || null,
          carYear: carYear ? Number(carYear) : null,
          carMileage: carMileage ? Number(carMileage) : null,
        },
      });
      onUpdate(updated);
      setEditing(false);
    } catch (err) {
      console.error("Error updating order:", err);
    }
  }

  function handleStatusChange(newStatus: OrderStatus) {
    updateStatus.mutate(
      { id: order.id, status: newStatus },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  }

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    deleteOrder.mutate(order.id, {
      onSuccess: () => {
        setConfirmDelete(false);
        onClose();
      },
    });
  }

  const availableStatuses = COLUMNS.filter((c) => c.id !== order.status);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
              <User size={20} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {order.clientName}
              </h2>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  statusColors[order.status]
                }`}
              >
                {STATUS_LABELS[order.status]}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {!editing && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                title="Редактировать"
              >
                <Edit3 size={18} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Client Name */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
              Имя клиента
            </label>
            {editing ? (
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
              />
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                  <User size={16} className="text-indigo-600" />
                </div>
                <span className="font-medium text-base text-gray-900">
                  {order.clientName}
                </span>
              </div>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
              Телефон
            </label>
            {editing ? (
              <input
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
              />
            ) : (
              <a
                href={`tel:${order.clientPhone}`}
                className="flex items-center gap-3 text-gray-900 hover:text-indigo-600 transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                  <Phone size={16} className="text-emerald-600" />
                </div>
                <span className="font-medium text-base">
                  {order.clientPhone}
                </span>
              </a>
            )}
          </div>

          {/* Car info */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
              Марка / Модель
            </label>
            {editing ? (
              <input
                type="text"
                value={carModel}
                onChange={(e) => setCarModel(e.target.value)}
                placeholder="Toyota Camry"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
              />
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-cyan-50 flex items-center justify-center shrink-0">
                  <Car size={16} className="text-cyan-600" />
                </div>
                <span className="font-semibold text-base text-gray-900">
                  {order.carModel || "—"}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                Год выпуска
              </label>
              {editing ? (
                <input
                  type="number"
                  value={carYear}
                  onChange={(e) => setCarYear(e.target.value)}
                  min={1900}
                  max={2030}
                  placeholder="2020"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                />
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
                    <Calendar size={16} className="text-rose-600" />
                  </div>
                  <span className="font-medium text-base text-gray-900">
                    {order.carYear ? `${order.carYear} г.` : "—"}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                Пробег
              </label>
              {editing ? (
                <input
                  type="number"
                  value={carMileage}
                  onChange={(e) => setCarMileage(e.target.value)}
                  min={0}
                  placeholder="50000"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                />
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                    <Gauge size={16} className="text-orange-600" />
                  </div>
                  <span className="font-medium text-base text-gray-900">
                    {order.carMileage !== null && order.carMileage !== undefined
                      ? formatMileage(order.carMileage)
                      : "—"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
              Максимальный бюджет
            </label>
            {editing ? (
              <input
                type="number"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                min={0}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
              />
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                  <Wallet size={16} className="text-amber-600" />
                </div>
                <span className="font-bold text-xl text-gray-900">
                  {formatBudget(order.budgetMax)}
                </span>
              </div>
            )}
          </div>

          {/* Requirements */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
              Требования к автоподбору
            </label>
            {editing ? (
              <textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition resize-none"
              />
            ) : (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText size={16} className="text-blue-600" />
                  </div>
                  <div className="max-h-40 overflow-y-auto text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {order.requirements}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
              Статус заявки
            </label>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                  statusColors[order.status]
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-current" />
                {STATUS_LABELS[order.status]}
              </span>
            </div>

            {/* Mobile status change buttons */}
            <div className="mt-3 sm:hidden">
              <p className="text-xs text-gray-500 mb-2 font-medium">
                Переместить в:
              </p>
              <div className="flex flex-wrap gap-2">
                {availableStatuses.map(({ id, title }) => {
                  const colorMap: Record<OrderStatus, string> = {
                    NEW: "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200",
                    IN_PROGRESS:
                      "bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200",
                    INSPECTION:
                      "bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200",
                    DEAL: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200",
                    CLOSED:
                      "bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-200",
                  };
                  return (
                    <button
                      key={id}
                      type="button"
                      disabled={updateStatus.isPending}
                      onClick={() => handleStatusChange(id)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors disabled:opacity-50 ${
                        colorMap[id]
                      }`}
                    >
                      {title}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Created At */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
              Дата создания
            </label>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                <Clock size={16} className="text-slate-600" />
              </div>
              <span className="text-sm text-gray-700 font-medium">
                {new Date(order.createdAt).toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 pt-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          {editing ? (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={updateOrder.isPending}
                className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-60"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={updateOrder.isPending}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-60"
              >
                {updateOrder.isPending ? "Сохранение..." : "Сохранить"}
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              {confirmDelete ? (
                <>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    disabled={deleteOrder.isPending}
                    className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-60"
                  >
                    Отмена
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleteOrder.isPending}
                    className="flex-1 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-60"
                  >
                    {deleteOrder.isPending ? "Удаление..." : "Подтвердить"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors"
                  >
                    Закрыть
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-xl hover:bg-red-50 hover:border-red-300 transition-colors"
                  >
                    <Trash2 size={16} />
                    Удалить
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function KanbanBoard() {
  const { data: orders = [], isLoading, isError } = useOrders();
  const updateStatus = useUpdateOrderStatus();
  const [modalOpen, setModalOpen] = useState(false);
  const [mobileColumn, setMobileColumn] = useState<OrderStatus>("NEW");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [maxBudgetFilter, setMaxBudgetFilter] = useState<number | "">("");

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
    return filteredOrders.filter((o) => o.status === status);
  }

  const filteredOrders = orders.filter((o) => {
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        o.clientName.toLowerCase().includes(q) ||
        o.requirements.toLowerCase().includes(q) ||
        (o.carModel && o.carModel.toLowerCase().includes(q));
      if (!matchesSearch) return false;
    }
    // Budget filter
    if (maxBudgetFilter !== "") {
      if (o.budgetMax > maxBudgetFilter) return false;
    }
    return true;
  });

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

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по имени клиента или модели авто..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
            />
          </div>
          <input
            type="number"
            value={maxBudgetFilter}
            onChange={(e) =>
              setMaxBudgetFilter(
                e.target.value === "" ? "" : Number(e.target.value),
              )
            }
            placeholder="Максимальный бюджет до..."
            min={0}
            className="w-full sm:w-56 pl-3 pr-3 py-2 text-sm rounded-lg border border-gray-300 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
          />
          {(searchQuery || maxBudgetFilter !== "") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setMaxBudgetFilter("");
              }}
              className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors shrink-0"
            >
              Сбросить
            </button>
          )}
        </div>

        {/* Mobile column tabs */}
        <div className="flex sm:hidden items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none px-0 py-1 mb-2">
          {COLUMNS.map((column) => {
            const isActive = mobileColumn === column.id;
            const count = getColumnOrders(column.id).length;
            return (
              <button
                key={column.id}
                type="button"
                onClick={() => setMobileColumn(column.id)}
                className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:mt-0 mt-6">
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
                              onSelect={setSelectedOrder}
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

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdate={setSelectedOrder}
        />
      )}
    </div>
  );
}
