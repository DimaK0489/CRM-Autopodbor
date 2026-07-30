import { useEffect, useState } from "react";
import { Printer } from "lucide-react";
import type { Order, CarInspection, InspectionStatus } from "../types/types";
import { api } from "../services/api";

const INSPECTION_STATUS_LABEL: Record<InspectionStatus, string> = {
  RECOMMENDED: "РЕКОМЕНДОВАНО К ПОКУПКЕ",
  REJECTED: "ОТКЛОНЕНО",
  PENDING: "ОЖИДАЕТ РАССМОТРЕНИЯ",
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatMileage(value: number): string {
  return `${value.toLocaleString("ru-RU")} км`;
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

function getStatusBorderColor(status: InspectionStatus): string {
  switch (status) {
    case "RECOMMENDED":
      return "border-emerald-400";
    case "REJECTED":
      return "border-red-400";
    default:
      return "border-amber-400";
  }
}

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "loaded"; order: Order; inspection: CarInspection };

function loadData(): LoadState {
  // Try to read from sessionStorage first
  const storedData = sessionStorage.getItem("inspectionReportData");
  if (storedData) {
    sessionStorage.removeItem("inspectionReportData");
    try {
      const { order, inspection } = JSON.parse(storedData);
      if (order && inspection) {
        return { status: "loaded", order, inspection };
      }
    } catch {
      // Ignore parse errors, fall through to URL params
    }
  }

  // Fallback: try to fetch from URL params
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("orderId");
  const inspectionId = params.get("inspectionId");

  if (!orderId || !inspectionId) {
    return { status: "error", message: "Не удалось загрузить данные отчёта" };
  }

  // We need to fetch asynchronously — return loading state
  return { status: "loading" };
}

export default function InspectionReportPage() {
  const [state, setState] = useState<LoadState>(() => {
    const initial = loadData();
    // If we have a synchronous result, use it directly
    if (initial.status === "loaded" || initial.status === "error") {
      return initial;
    }
    return initial;
  });

  useEffect(() => {
    // Only fetch if we're still loading and didn't get data from sessionStorage
    // Check if we need async fetch
    const storedData = sessionStorage.getItem("inspectionReportData");
    if (storedData) {
      // Already handled in initial state — no need to fetch
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("orderId");
    const inspectionId = params.get("inspectionId");

    if (!orderId || !inspectionId) {
      return; // Error already set in initial state
    }

    let cancelled = false;

    api
      .get<Order[]>(`/orders?includeArchived=true`)
      .then((orders) => {
        if (cancelled) return;
        const foundOrder = orders.find((o) => o.id === orderId);
        if (!foundOrder) {
          setState({ status: "error", message: "Заявка не найдена" });
          return;
        }
        const foundInspection = foundOrder.inspections?.find(
          (i) => i.id === inspectionId,
        );
        if (!foundInspection) {
          setState({ status: "error", message: "Осмотр не найден" });
          return;
        }
        setState({
          status: "loaded",
          order: foundOrder,
          inspection: foundInspection,
        });
      })
      .catch(() => {
        if (!cancelled) {
          setState({ status: "error", message: "Ошибка загрузки данных" });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 text-lg font-medium mb-2">
            {state.message}
          </p>
          <button
            type="button"
            onClick={() => window.close()}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Закрыть окно
          </button>
        </div>
      </div>
    );
  }

  const { order, inspection } = state;
  const isRecommended = inspection.status === "RECOMMENDED";
  const isRejected = inspection.status === "REJECTED";

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white py-8 print:py-0">
      {/* Print button */}
      <button
        type="button"
        onClick={() => window.print()}
        className="print:hidden fixed bottom-6 right-6 bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 z-50"
      >
        <Printer size={20} />
        Сохранить в PDF / Печать
      </button>

      {/* Close button */}
      <button
        type="button"
        onClick={() => window.close()}
        className="print:hidden fixed top-6 right-6 bg-white text-gray-600 px-4 py-2 rounded-lg shadow-md font-medium hover:bg-gray-50 transition-colors border border-gray-200 z-50"
      >
        ✕ Закрыть
      </button>

      {/* A4 Report */}
      <div className="max-w-[210mm] mx-auto bg-white shadow-xl print:shadow-none min-h-[297mm] print:min-h-0 border border-gray-200 print:border-0">
        {/* Header */}
        <div className="border-b-4 border-blue-600 px-10 pt-10 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                ОТЧЕТ ОБ ОСМОТРЕ АВТОМОБИЛЯ
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                CRM Автоподбор · Профессиональный отбор автомобилей
              </p>
            </div>
            <div className="text-right">
              <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl ml-auto">
                CRM
              </div>
            </div>
          </div>
        </div>

        {/* Document info */}
        <div className="px-10 py-4 flex items-center justify-between text-xs text-gray-400 border-b border-gray-100">
          <span>Дата составления: {formatDateFull(inspection.createdAt)}</span>
          <span>ID осмотра: {inspection.id.slice(0, 8)}...</span>
        </div>

        {/* Content */}
        <div className="px-10 py-8 space-y-8">
          {/* Block 1: Основные данные */}
          <section>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 pb-2 border-b border-gray-200">
              Основные данные автомобиля
            </h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
                  Марка / Модель
                </p>
                <p className="text-base font-semibold text-gray-900">
                  {inspection.carModel}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
                  Год выпуска
                </p>
                <p className="text-base font-semibold text-gray-900">
                  {inspection.year} г.
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
                  Пробег
                </p>
                <p className="text-base font-semibold text-gray-900">
                  {order.carMileage !== null && order.carMileage !== undefined
                    ? formatMileage(order.carMileage)
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
                  Цена
                </p>
                <p className="text-base font-semibold text-gray-900">
                  {formatPrice(inspection.price)}
                </p>
              </div>
            </div>
          </section>

          {/* Block 2: Ссылка на объявление */}
          <section>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 pb-2 border-b border-gray-200">
              Ссылка на исходное объявление
            </h2>
            {inspection.link ? (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <a
                  href={inspection.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline text-sm break-all"
                >
                  {inspection.link}
                </a>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">Ссылка не указана</p>
            )}
          </section>

          {/* Block 3: Технический отчет */}
          <section>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 pb-2 border-b border-gray-200">
              Отчёт подборщика / Вердикт
            </h2>
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 min-h-[120px]">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {inspection.report || "Комментарий отсутствует"}
              </p>
            </div>
          </section>

          {/* Block 4: Финальный статус */}
          <section>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 pb-2 border-b border-gray-200">
              Решение по автомобилю
            </h2>
            <div
              className={`border-2 rounded-xl p-6 text-center ${getStatusBorderColor(inspection.status)}`}
            >
              <p
                className={`text-2xl font-bold tracking-tight ${
                  isRecommended
                    ? "text-emerald-700"
                    : isRejected
                      ? "text-red-700"
                      : "text-amber-700"
                }`}
              >
                {INSPECTION_STATUS_LABEL[inspection.status]}
              </p>
              {isRecommended && (
                <p className="text-sm text-emerald-600 mt-2 font-medium">
                  Данный автомобиль рекомендован к покупке по результатам
                  технической проверки
                </p>
              )}
              {isRejected && (
                <p className="text-sm text-red-600 mt-2 font-medium">
                  Данный автомобиль не рекомендован к покупке по результатам
                  технической проверки
                </p>
              )}
            </div>
          </section>

          {/* Client info footer */}
          <section className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-400">
              <div>
                <p className="font-medium">Клиент</p>
                <p className="text-gray-600">{order.clientName}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">Телефон</p>
                <p className="text-gray-600">{order.clientPhone}</p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-10 py-4 border-t-2 border-gray-200 text-center text-xs text-gray-400">
          <p>
            CRM Автоподбор · Данный отчёт сгенерирован автоматически и не
            является официальным документом
          </p>
          <p className="mt-1">
            {new Date().toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
