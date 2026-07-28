import { useState } from "react";
import { DragDropContext, Droppable, type DropResult } from "@hello-pangea/dnd";
import { User, Plus, Search } from "lucide-react";
import type { OrderStatus } from "../types/types";
import { useOrders, useUpdateOrderStatus } from "../hooks/useOrders";
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
    </div>
  );
}
