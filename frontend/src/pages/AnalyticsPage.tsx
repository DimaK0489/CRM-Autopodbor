import { useMemo } from "react";
import { useOrders } from "../hooks/useOrders";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const DONE_STATUSES: readonly string[] = ["CLOSED", "DONE"];
const WORK_STATUSES: readonly string[] = ["IN_PROGRESS", "INSPECTION", "DEAL"];

function isDone(status: string): boolean {
  return DONE_STATUSES.includes(status);
}

function isInWork(status: string): boolean {
  return WORK_STATUSES.includes(status);
}

const PIE_COLORS = [
  "#3b82f6",
  "#f59e0b",
  "#10b981",
  "#8b5cf6",
  "#ef4444",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function AnalyticsPage() {
  const { data: orders, isLoading, isError } = useOrders(true);

  const {
    totalRevenue,
    inWorkCount,
    conversion,
    revenueByMonth,
    carModelDistribution,
  } = useMemo(() => {
    if (!orders) {
      return {
        totalRevenue: 0,
        inWorkCount: 0,
        conversion: 0,
        revenueByMonth: [],
        carModelDistribution: [],
      };
    }

    const doneOrders = orders.filter((o) => isDone(o.status));
    const inWorkOrders = orders.filter((o) => isInWork(o.status));

    // Total revenue from done orders
    const totalRevenue = doneOrders.reduce(
      (sum, o) => sum + (o.budgetMax || 0),
      0,
    );

    // Conversion rate
    const conversion =
      orders.length > 0
        ? Math.round((doneOrders.length / orders.length) * 100)
        : 0;

    // Revenue grouped by month (only from done/closed orders)
    const monthMap = new Map<string, number>();
    doneOrders.forEach((o) => {
      if (!o.budgetMax) return;
      const date = new Date(o.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthMap.set(key, (monthMap.get(key) || 0) + o.budgetMax);
    });

    const revenueByMonth = Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, revenue]) => {
        const [year, m] = month.split("-");
        const label = new Date(+year, +m - 1).toLocaleDateString("ru-RU", {
          month: "short",
          year: "numeric",
        });
        return { month: label, revenue };
      });

    // Car model popularity
    const modelMap = new Map<string, number>();
    orders.forEach((o) => {
      const model = o.carModel?.trim();
      if (!model) return;
      modelMap.set(model, (modelMap.get(model) || 0) + 1);
    });

    const carModelDistribution = Array.from(modelMap.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([name, value]) => ({ name, value }));

    return {
      totalRevenue,
      inWorkCount: inWorkOrders.length,
      conversion,
      revenueByMonth,
      carModelDistribution,
    };
  }, [orders]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-20 text-red-500 font-medium">
        Ошибка загрузки данных аналитики
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      <h2 className="text-2xl font-bold text-gray-900">Финансовая аналитика</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm font-medium text-gray-500 mb-1">
            Общая выручка
          </p>
          <p className="text-3xl font-bold text-emerald-600">
            {formatCurrency(totalRevenue)}
          </p>
          <p className="text-xs text-gray-400 mt-1">по закрытым заявкам</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm font-medium text-gray-500 mb-1">
            Заявки в работе
          </p>
          <p className="text-3xl font-bold text-amber-600">{inWorkCount}</p>
          <p className="text-xs text-gray-400 mt-1">
            статусы: В работе / Осмотр / Сделка
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm font-medium text-gray-500 mb-1">Конверсия</p>
          <p className="text-3xl font-bold text-blue-600">{conversion}%</p>
          <p className="text-xs text-gray-400 mt-1">
            успешно закрытых от общего числа
          </p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Доходы по месяцам
        </h3>
        {revenueByMonth.length === 0 ? (
          <p className="text-gray-400 text-sm py-8 text-center">
            Нет данных для отображения
          </p>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value) => [
                    formatCurrency(Number(value)),
                    "Выручка",
                  ]}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                />
                <Bar
                  dataKey="revenue"
                  fill="#3b82f6"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Car Model Pie Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Популярность марок автомобилей
        </h3>
        {carModelDistribution.length === 0 ? (
          <p className="text-gray-400 text-sm py-8 text-center">
            Нет данных для отображения
          </p>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={carModelDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={50}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  labelLine
                >
                  {carModelDistribution.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${Number(value)} шт.`, name]}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  iconSize={10}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
