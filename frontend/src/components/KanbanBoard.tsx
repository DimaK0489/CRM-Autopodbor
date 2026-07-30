import { useState } from "react";
import { DragDropContext, Droppable, type DropResult } from "@hello-pangea/dnd";
import { User, Plus, Search, Archive, X } from "lucide-react";
import type { OrderStatus } from "../types/types";
import {
  useOrders,
  useUpdateOrderStatus,
  useArchivedOrders,
} from "../hooks/useOrders";
import {
  COLUMNS,
  columnColors,
  columnHeaders,
} from "../common/kanban-constants";
import KanbanCard from "./KanbanCard";
import AddOrderModal from "./AddOrderModal";
import OrderDetailsModal from "./OrderDetailsModal";
import type { Order } from "../types/types";

export default function KanbanBoard() {
  const { data: orders = [], isLoading, isError } = useOrders();
  const updateStatus = useUpdateOrderStatus();
  const [modalOpen, setModalOpen] = useState(false);
  const [mobileColumn, setMobileColumn] = useState<OrderStatus>("NEW");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [maxBudgetFilter, setMaxBudgetFilter] = useState<number | "">("");
  const [showArchive, setShowArchive] = useState(false);
  const { data: archivedOrders = [], isLoading: isArchivedLoading } =
    useArchivedOrders();

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

  const filteredOrders = orders.filter((o) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        o.clientName.toLowerCase().includes(q) ||
        o.requirements.toLowerCase().includes(q) ||
        (o.carModel && o.carModel.toLowerCase().includes(q));
      if (!matchesSearch) return false;
    }
    if (maxBudgetFilter !== "") {
      if (o.budgetMax > maxBudgetFilter) return false;
    }
    return true;
  });

  function getColumnOrders(status: OrderStatus) {
    return filteredOrders.filter((o) => o.status === status);
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
          <button
            type="button"
            onClick={() => setShowArchive(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 hover:border-amber-300 transition-colors shrink-0"
          >
            <Archive size={16} />
            <span className="hidden sm:inline">Архив</span>
          </button>
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

      {/* Archive modal */}
      {showArchive && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowArchive(false);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden animate-fade-in flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Archive size={20} className="text-amber-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Архив заявок
                  </h2>
                  <p className="text-xs text-gray-500">
                    {archivedOrders.length} заявок в архиве
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowArchive(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 p-6">
              {isArchivedLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full" />
                </div>
              ) : archivedOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <Archive size={48} className="mb-3 opacity-30" />
                  <p className="text-sm font-medium">
                    В архиве пока нет заявок
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-3 px-2 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                          Клиент
                        </th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                          Телефон
                        </th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-500 text-xs uppercase tracking-wider hidden sm:table-cell">
                          Авто
                        </th>
                        <th className="text-right py-3 px-2 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                          Бюджет
                        </th>
                        <th className="text-center py-3 px-2 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                          Статус
                        </th>
                        <th className="text-right py-3 px-2 font-semibold text-gray-500 text-xs uppercase tracking-wider hidden sm:table-cell">
                          Дата
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {archivedOrders.map((archivedOrder) => (
                        <tr
                          key={archivedOrder.id}
                          className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => {
                            setSelectedOrder(archivedOrder);
                            setShowArchive(false);
                          }}
                        >
                          <td className="py-3 px-2 font-medium text-gray-900">
                            {archivedOrder.clientName}
                          </td>
                          <td className="py-3 px-2 text-gray-600">
                            {archivedOrder.clientPhone}
                          </td>
                          <td className="py-3 px-2 text-gray-600 hidden sm:table-cell">
                            {archivedOrder.carModel || "—"}
                          </td>
                          <td className="py-3 px-2 text-right font-medium text-gray-900">
                            {new Intl.NumberFormat("ru-RU", {
                              style: "currency",
                              currency: "USD",
                              maximumFractionDigits: 0,
                            }).format(archivedOrder.budgetMax)}
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className="inline-block px-2 py-0.5 text-[10px] font-medium rounded-full bg-gray-100 text-gray-600">
                              {archivedOrder.status}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right text-gray-500 text-xs hidden sm:table-cell">
                            {new Date(
                              archivedOrder.createdAt,
                            ).toLocaleDateString("ru-RU")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
