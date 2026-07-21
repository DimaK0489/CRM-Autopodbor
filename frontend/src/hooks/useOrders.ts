import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type { Order, OrderStatus } from "../types";

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
    }) => api.post<Order>("/orders", data),
    onSuccess: (newOrder) => {
      queryClient.setQueryData<Order[]>(ORDERS_KEY, (old) =>
        old ? [...old, newOrder] : [newOrder],
      );
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
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(ORDERS_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_KEY });
    },
  });
}
