import { useState } from "react";
import {
  Phone,
  Wallet,
  FileText,
  Clock,
  User,
  X,
  Edit3,
  Trash2,
  Car,
  Gauge,
  Calendar,
  Plus,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ClipboardCheck,
  Archive,
  Printer,
} from "lucide-react";
import type {
  Order,
  OrderStatus,
  CarInspection,
  InspectionStatus,
} from "../types/types";
import {
  useOrders,
  useUpdateOrderStatus,
  useUpdateOrder,
  useDeleteOrder,
  useCreateInspection,
  useArchiveOrder,
} from "../hooks/useOrders";
import {
  COLUMNS,
  STATUS_LABELS,
  statusColors,
  statusChangeColorMap,
  formatBudget,
  formatMileage,
} from "../common/kanban-constants";

interface Props {
  order: Order;
  onClose: () => void;
  onUpdate: (order: Order) => void;
}

function formatDateFull(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OrderDetailsModal({
  order: propOrder,
  onClose,
  onUpdate,
}: Props) {
  // Get fresh data from cache so inspections show up immediately
  const { data: orders } = useOrders();
  const order = orders?.find((o) => o.id === propOrder.id) ?? propOrder;
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
  const createInspection = useCreateInspection();
  const archiveOrder = useArchiveOrder();

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
        onSuccess: () => onClose(),
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

  function handleArchive() {
    archiveOrder.mutate(order.id, {
      onSuccess: () => {
        onClose();
      },
    });
  }

  const availableStatuses = COLUMNS.filter((c) => c.id !== order.status);
  const canArchive = order.status === "CLOSED" || order.status === "DEAL";

  // Inspection form state
  const [showInspectionForm, setShowInspectionForm] = useState(false);
  const [expandedInspection, setExpandedInspection] = useState<string | null>(
    null,
  );
  const [insCarModel, setInsCarModel] = useState("");
  const [insYear, setInsYear] = useState("");
  const [insPrice, setInsPrice] = useState("");
  const [insLink, setInsLink] = useState("");
  const [insReport, setInsReport] = useState("");
  const [insStatus, setInsStatus] = useState<InspectionStatus>("PENDING");

  function resetInspectionForm() {
    setInsCarModel("");
    setInsYear("");
    setInsPrice("");
    setInsLink("");
    setInsReport("");
    setInsStatus("PENDING");
  }

  async function handleAddInspection() {
    if (!insCarModel.trim() || !insYear || !insPrice || !insReport.trim())
      return;

    await createInspection.mutateAsync({
      orderId: order.id,
      data: {
        carModel: insCarModel.trim(),
        year: Number(insYear),
        price: Number(insPrice),
        link: insLink.trim() || undefined,
        report: insReport.trim(),
        status: insStatus,
      },
    });

    resetInspectionForm();
    setShowInspectionForm(false);
  }

  const inspections: CarInspection[] = order.inspections ?? [];

  function formatInspectionPrice(price: number): string {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);
  }

  const inspectionStatusLabel: Record<InspectionStatus, string> = {
    RECOMMENDED: "Рекомендовано",
    REJECTED: "Отклонено",
    PENDING: "Ожидает",
  };

  const inspectionStatusColor: Record<InspectionStatus, string> = {
    RECOMMENDED: "bg-emerald-100 text-emerald-800",
    REJECTED: "bg-red-100 text-red-800",
    PENDING: "bg-amber-100 text-amber-800",
  };

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
                {availableStatuses.map(({ id, title }) => (
                  <button
                    key={id}
                    type="button"
                    disabled={updateStatus.isPending}
                    onClick={() => handleStatusChange(id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors disabled:opacity-50 ${
                      statusChangeColorMap[id]
                    }`}
                  >
                    {title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Inspections */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                История осмотров
              </label>
              {!editing && (
                <button
                  type="button"
                  onClick={() => setShowInspectionForm(!showInspectionForm)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <Plus size={14} />
                  {showInspectionForm ? "Отмена" : "Добавить осмотр"}
                </button>
              )}
            </div>

            {/* Add inspection form */}
            {showInspectionForm && !editing && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-3 space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-gray-400 uppercase mb-1 block">
                      Модель
                    </label>
                    <input
                      type="text"
                      value={insCarModel}
                      onChange={(e) => setInsCarModel(e.target.value)}
                      placeholder="Toyota Camry"
                      className="w-full rounded-lg border border-gray-300 px-2.5 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-gray-400 uppercase mb-1 block">
                      Год
                    </label>
                    <input
                      type="number"
                      value={insYear}
                      onChange={(e) => setInsYear(e.target.value)}
                      placeholder="2020"
                      min={1900}
                      max={2030}
                      className="w-full rounded-lg border border-gray-300 px-2.5 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-gray-400 uppercase mb-1 block">
                      Цена
                    </label>
                    <input
                      type="number"
                      value={insPrice}
                      onChange={(e) => setInsPrice(e.target.value)}
                      placeholder="25000"
                      min={0}
                      className="w-full rounded-lg border border-gray-300 px-2.5 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-gray-400 uppercase mb-1 block">
                    Ссылка (av.by / encar.com)
                  </label>
                  <input
                    type="text"
                    value={insLink}
                    onChange={(e) => setInsLink(e.target.value)}
                    placeholder="https://encar.com/..."
                    className="w-full rounded-lg border border-gray-300 px-2.5 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-gray-400 uppercase mb-1 block">
                    Результат осмотра
                  </label>
                  <textarea
                    value={insReport}
                    onChange={(e) => setInsReport(e.target.value)}
                    rows={3}
                    placeholder="Комментарий подборщика..."
                    className="w-full rounded-lg border border-gray-300 px-2.5 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase">
                      Статус:
                    </span>
                    {(
                      [
                        "RECOMMENDED",
                        "REJECTED",
                        "PENDING",
                      ] as InspectionStatus[]
                    ).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setInsStatus(s)}
                        className={`px-2.5 py-1 text-[10px] font-medium rounded-full border transition-colors ${
                          insStatus === s
                            ? inspectionStatusColor[s]
                            : "border-gray-200 text-gray-500 hover:bg-gray-100"
                        }`}
                      >
                        {inspectionStatusLabel[s]}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleAddInspection}
                    disabled={createInspection.isPending}
                    className="px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60"
                  >
                    {createInspection.isPending ? "Сохранение..." : "Добавить"}
                  </button>
                </div>
              </div>
            )}

            {/* Inspection cards */}
            {inspections.length === 0 ? (
              <p className="text-gray-400 text-xs py-3 text-center bg-gray-50 rounded-xl border border-gray-100">
                Осмотры ещё не добавлялись
              </p>
            ) : (
              <div className="space-y-2">
                {inspections.map((ins) => {
                  const isExpanded = expandedInspection === ins.id;
                  return (
                    <div
                      key={ins.id}
                      className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden"
                    >
                      <div
                        onClick={() =>
                          setExpandedInspection(isExpanded ? null : ins.id)
                        }
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors cursor-pointer select-none text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center shrink-0">
                          <ClipboardCheck size={14} className="text-cyan-600" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-900 truncate flex-1">
                              {ins.carModel}
                            </p>
                            <span
                              className={`text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
                                inspectionStatusColor[ins.status]
                              }`}
                            >
                              {inspectionStatusLabel[ins.status]}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const data = {
                                  order,
                                  inspection: ins,
                                };
                                sessionStorage.setItem(
                                  "inspectionReportData",
                                  JSON.stringify(data),
                                );
                                window.open(
                                  `${window.location.origin}${window.location.pathname}?reportId=${ins.id}`,
                                  "_blank",
                                );
                              }}
                              className="p-1 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors shrink-0"
                              title="Экспорт в PDF"
                            >
                              <Printer size={14} />
                            </button>
                            {isExpanded ? (
                              <ChevronUp
                                size={16}
                                className="text-gray-400 shrink-0"
                              />
                            ) : (
                              <ChevronDown
                                size={16}
                                className="text-gray-400 shrink-0"
                              />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {ins.year} г. · {formatInspectionPrice(ins.price)}
                          </p>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-4 pb-4 pt-0 border-t border-gray-100">
                          <div className="mt-3 text-xs text-gray-700 leading-relaxed whitespace-pre-wrap bg-white rounded-lg p-3 border border-gray-100">
                            {ins.report || "Нет комментария"}
                          </div>
                          {ins.link && (
                            <a
                              href={ins.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 mt-2 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                            >
                              <ExternalLink size={12} />
                              Смотреть объявление
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
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
                {formatDateFull(order.createdAt)}
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
                  {canArchive && !order.isArchived && (
                    <button
                      type="button"
                      onClick={handleArchive}
                      disabled={archiveOrder.isPending}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-amber-600 bg-white border border-amber-200 rounded-xl hover:bg-amber-50 hover:border-amber-300 transition-colors disabled:opacity-60"
                    >
                      <Archive size={16} />
                      {archiveOrder.isPending ? "Архивация..." : "В архив"}
                    </button>
                  )}
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
