import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "../services/api";
import type { Order, OrderStatus } from "../types/types";

const ORDERS_KEY = ["orders"] as const;

export function useOrders() {
  return useQuery({
    queryKey: ORDERS_KEY,
    queryFn: () => api.get<Order[]>("/orders"),
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      clientName: string;
      clientPhone: string;
      budgetMax: number;
      requirements: string;
      carModel?: string;
      carYear?: number;
      carMileage?: number;
    }) => api.post<Order>("/orders", data),
    onSuccess: (newOrder) => {
      toast.success("Заявка успешно создана");
      queryClient.setQueryData<Order[]>(ORDERS_KEY, (old) =>
        old ? [...old, newOrder] : [newOrder],
      );
    },
    onError: () => {
      toast.error("Ошибка при создании заявки");
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      api.patch<Order>(`/orders/${id}`, { status }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ORDERS_KEY });
      const previous = queryClient.getQueryData<Order[]>(ORDERS_KEY);

      queryClient.setQueryData<Order[]>(ORDERS_KEY, (old) => {
        if (!old) return old;
        return old.map((o) => (o.id === id ? { ...o, status } : o));
      });

      return { previous };
    },
    onSuccess: (_data, variables) => {
      const statusLabel: Record<OrderStatus, string> = {
        NEW: "Новый",
        IN_PROGRESS: "В работе",
        INSPECTION: "Осмотр",
        DEAL: "Сделка",
        CLOSED: "Закрыто",
      };
      toast.success(`Статус изменён на «${statusLabel[variables.status]}»`);
    },
    onError: (_err, _vars, context) => {
      toast.error("Ошибка при изменении статуса");
      if (context?.previous) {
        queryClient.setQueryData(ORDERS_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_KEY });
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Omit<Order, "id" | "createdAt" | "status">>;
    }) => api.patch<Order>(`/orders/${id}`, data),
    onSuccess: () => {
      toast.success("Заявка успешно обновлена");
      queryClient.invalidateQueries({ queryKey: ORDERS_KEY });
    },
    onError: () => {
      toast.error("Ошибка при обновлении заявки");
    },
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete<Order>(`/orders/${id}`),
    onSuccess: () => {
      toast.success("Заявка удалена");
      queryClient.invalidateQueries({ queryKey: ORDERS_KEY });
    },
    onError: () => {
      toast.error("Ошибка при удалении заявки");
    },
  });
}
