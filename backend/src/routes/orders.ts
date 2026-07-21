import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

// Все маршруты заказов требуют авторизации
router.use(authMiddleware);

// GET /api/orders — получить свои заявки
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// POST /api/orders — создать новую заявку (привязанную к пользователю)
router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const { clientName, clientPhone, budgetMax, requirements } = req.body;

    if (!clientName || !clientPhone) {
      res
        .status(400)
        .json({ error: "clientName and clientPhone are required" });
      return;
    }

    const order = await prisma.order.create({
      data: {
        clientName,
        clientPhone,
        budgetMax: budgetMax ?? 0,
        requirements: requirements ?? "",
        userId: req.user!.id,
      },
    });

    res.status(201).json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// PATCH /api/orders/:id — обновить заявку (только свою)
router.patch("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { clientName, clientPhone, budgetMax, requirements, status } =
      req.body;

    // Проверяем, что заказ принадлежит пользователю
    const existing = await prisma.order.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!existing) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    // Собираем только переданные поля для обновления
    const data: Record<string, unknown> = {};
    if (clientName !== undefined) data.clientName = clientName;
    if (clientPhone !== undefined) data.clientPhone = clientPhone;
    if (budgetMax !== undefined) data.budgetMax = budgetMax;
    if (requirements !== undefined) data.requirements = requirements;
    if (status !== undefined) data.status = status;

    if (Object.keys(data).length === 0) {
      res.status(400).json({ error: "No fields to update" });
      return;
    }

    const order = await prisma.order.update({
      where: { id },
      data,
    });

    res.json(order);
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ error: "Failed to update order" });
  }
});

export default router;
