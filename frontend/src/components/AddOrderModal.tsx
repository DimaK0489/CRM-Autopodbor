import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { useCreateOrder } from "../hooks/useOrders";

export interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AddOrderModal({ open, onClose }: Props) {
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
