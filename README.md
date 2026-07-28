# 🚗 CRM Система для Автоподбора

Современное **SPA-приложение** для управления заявками на подбор автомобилей. Включает интерактивную **Kanban-доску**, просмотр и редактирование карточек, систему мобильной адаптации и удобную фильтрацию.

---

## 🔗 Живые ссылки

| Компонент                      | Ссылка                                       |
| ------------------------------ | -------------------------------------------- |
| 🌐 **Frontend** (GitHub Pages) | [https://github.io](https://github.io)       |
| ⚙️ **Backend** (Render)        | [https://onrender.com](https://onrender.com) |

---

## 🛠️ Стек технологий

### Frontend

| Технология                                                           | Назначение                      |
| -------------------------------------------------------------------- | ------------------------------- |
| [React](https://react.dev) + [Vite](https://vite.dev)                | Фреймворк и сборщик             |
| [TypeScript](https://www.typescriptlang.org)                         | Типизация                       |
| [Tailwind CSS](https://tailwindcss.com) v4                           | Стилизация                      |
| [TanStack React Query](https://tanstack.com/query)                   | Управление серверным состоянием |
| [React DnD (@hello-pangea/dnd)](https://github.com/hello-pangea/dnd) | Drag-and-drop на Kanban-доске   |
| [Lucide React](https://lucide.dev)                                   | Иконки                          |
| [Sonner](https://sonner.emilkowal.ski)                               | Toast-уведомления               |

### Backend

| Технология                                                       | Назначение            |
| ---------------------------------------------------------------- | --------------------- |
| [Node.js](https://nodejs.org) + [Express](https://expressjs.com) | Сервер                |
| [TypeScript](https://www.typescriptlang.org)                     | Типизация             |
| [Prisma ORM](https://www.prisma.io)                              | Работа с базой данных |
| [SQLite](https://www.sqlite.org) (через Turso/libSQL)            | База данных           |
| [bcrypt](https://github.com/kelektiv/node.bcrypt.js)             | Хеширование паролей   |
| [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)       | JWT-аутентификация    |

---

## ✨ Основной функционал

- ✅ **Kanban-доска** — полноценная доска с колонками статусов и drag-and-drop для перемещения заявок.
- 📱 **Мобильная адаптация** — переключение колонок табами, удобное меню профиля, оптимизированные кнопки под сенсорное управление.
- 📝 **Просмотр и редактирование заявок** — модальное окно с автомобильной спецификой (Марка/Модель, Год выпуска, Пробег, Бюджет).
- 🔍 **Поиск и фильтрация** — живой поиск по клиенту / модели автомобиля и фильтр по максимальному бюджету.
- 🔔 **Toast-уведомления** — всплывающие уведомления на ключевые действия (создание, редактирование, удаление заявки).
- 🔐 **Аутентификация** — регистрация и вход с JWT-токенами.

---

## 🚀 Локальный запуск проекта

### 1. Клонирование репозитория

```bash
git clone https://github.com/DimaK0489/CRM-Autopodbor.git
cd CRM-Autopodbor
```

### 2. Запуск backend

```bash
cd backend
npm install
npx prisma db push
npm run dev
```

Сервер будет запущен по адресу `http://localhost:5000` (порт по умолчанию).

### 3. Запуск frontend

Откройте новый терминал и выполните:

```bash
cd frontend
npm install
npm run dev
```

Фронтенд будет доступен по адресу `http://localhost:5173`.

> **Примечание:** В проекте используется SQLite, поэтому дополнительная настройка базы данных не требуется — все данные хранятся в файле `backend/dev.db`.

---

## 📁 Структура монорепозитория

```
CRM-Autopodbor/
├── backend/                # Backend-часть (Express + Prisma)
│   ├── prisma/             # Prisma schema и миграции
│   └── src/                # Исходный код (маршруты, middleware)
├── frontend/               # Frontend-часть (React + Vite)
│   └── src/
│       ├── components/     # Компоненты (KanbanBoard, Modal, Card)
│       ├── pages/          # Страницы (Login, Register)
│       ├── hooks/          # React-хуки (useAuth, useOrders)
│       ├── services/       # API-клиент и Query Client
│       ├── context/        # Auth-контекст
│       └── types/          # TypeScript-типы
├── render.yaml             # Конфигурация для деплоя на Render
└── README.md               # Этот файл
```

---

## 📄 Лицензия

Проект распространяется под лицензией **ISC**.
