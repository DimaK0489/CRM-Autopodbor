import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

// Все маршруты заказов требуют авторизации
router.use(authMiddleware);

// GET /api/orders — получить активные заявки (с осмотрами)
// ?includeArchived=true — вернуть все заявки (включая архивные) для аналитики
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const includeArchived = req.query.includeArchived === "true";

    const where: Record<string, unknown> = { userId: req.user!.id };
    if (!includeArchived) {
      where.isArchived = false;
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { inspections: true },
    });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// GET /api/orders/archived — получить только заархивированные заявки
router.get("/archived", async (req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.id, isArchived: true },
      orderBy: { createdAt: "desc" },
      include: { inspections: true },
    });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching archived orders:", error);
    res.status(500).json({ error: "Failed to fetch archived orders" });
  }
});

// POST /api/orders — создать новую заявку (привязанную к пользователю)
router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const {
      clientName,
      clientPhone,
      budgetMax,
      requirements,
      carModel,
      carYear,
      carMileage,
    } = req.body;

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
        carModel: carModel ?? null,
        carYear: carYear ?? null,
        carMileage: carMileage ?? null,
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
    const {
      clientName,
      clientPhone,
      budgetMax,
      requirements,
      status,
      carModel,
      carYear,
      carMileage,
    } = req.body;

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
    if (carModel !== undefined) data.carModel = carModel;
    if (carYear !== undefined) data.carYear = carYear;
    if (carMileage !== undefined) data.carMileage = carMileage;
    if (req.body.isArchived !== undefined)
      data.isArchived = req.body.isArchived;

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

// DELETE /api/orders/:id — удалить заявку (только свою)
router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const existing = await prisma.order.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!existing) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    await prisma.order.delete({ where: { id } });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ error: "Failed to delete order" });
  }
});

// ---- Осмотры (inspections) ----

// POST /api/orders/:orderId/inspections — добавить осмотр
router.post(
  "/:orderId/inspections",
  async (req: AuthRequest, res: Response) => {
    try {
      const orderId = req.params.orderId as string;

      const existing = await prisma.order.findFirst({
        where: { id: orderId, userId: req.user!.id },
      });

      if (!existing) {
        res.status(404).json({ error: "Order not found" });
        return;
      }

      const { carModel, year, price, link, report, status } = req.body;

      if (!carModel || !year || !price || !report) {
        res
          .status(400)
          .json({ error: "carModel, year, price and report are required" });
        return;
      }

      const inspection = await prisma.carInspection.create({
        data: {
          carModel,
          year: Number(year),
          price: Number(price),
          link: link ?? null,
          report,
          status: status ?? "PENDING",
          orderId,
        },
      });

      res.status(201).json(inspection);
    } catch (error) {
      console.error("Error creating inspection:", error);
      res.status(500).json({ error: "Failed to create inspection" });
    }
  },
);

// GET /api/orders/:orderId/inspections — получить все осмотры заявки
router.get("/:orderId/inspections", async (req: AuthRequest, res: Response) => {
  try {
    const orderId = req.params.orderId as string;

    const existing = await prisma.order.findFirst({
      where: { id: orderId, userId: req.user!.id },
    });

    if (!existing) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    const inspections = await prisma.carInspection.findMany({
      where: { orderId },
      orderBy: { createdAt: "desc" },
    });

    res.json(inspections);
  } catch (error) {
    console.error("Error fetching inspections:", error);
    res.status(500).json({ error: "Failed to fetch inspections" });
  }
});

export default router;
