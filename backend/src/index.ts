import "dotenv/config";
import express from "express";
import cors from "cors";
import ordersRouter from "./routes/orders";
import authRouter from "./routes/auth";

const app = express();
const PORT = process.env.PORT || 3001;

// CORS — разрешаем запросы с фронтенда
app.use(
  cors({
    origin: process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(",").map((s) => s.trim())
      : ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  }),
);

// Парсинг JSON тела запроса
app.use(express.json());

// Роуты
app.use("/api/auth", authRouter);
app.use("/api/orders", ordersRouter);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
