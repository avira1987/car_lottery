
# لاتاری - پلتفرم قرعه‌کشی خودرو

پلتفرم کامل قرعه‌کشی خودرو با سیستم بازی، کیف پول و پنل مدیریت.

## ویژگی‌ها

- ✅ سیستم احراز هویت (JWT)
- ✅ کیف پول و تراکنش‌های مالی
- ✅ خرید بلیط با تخفیف پلکانی
- ✅ سیستم شانس و مصرف آن
- ✅ قرعه‌کشی با RNG امن
- ✅ گردونه شانس
- ✅ ماشین اسلاید (حالت لایو و خودکار)
- ✅ سیستم زیرمجموعه‌گیری
- ✅ پنل مدیریت کامل
- ✅ رابط کاربری فارسی (RTL)

## تکنولوژی‌ها

### Backend
- NestJS
- PostgreSQL + Prisma
- Socket.io (WebSocket)
- JWT Authentication

### Frontend
- Next.js 14 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- next-intl (فارسی‌سازی)
- Socket.io Client

## نصب و راه‌اندازی

### پیش‌نیازها

**حداقل نیازمندی‌ها:**
- Node.js 18+
- npm یا yarn

**اختیاری (برای استفاده از Docker):**
- Docker & Docker Compose

**یا (برای استفاده بدون Docker):**
- PostgreSQL (نصب شده به صورت محلی)

### راه‌اندازی سریع (ویندوز)

فایل **`run.bat`** را اجرا کنید. این فایل به‌صورت خودکار:
- ✅ Docker را تشخیص می‌دهد و در صورت وجود از آن استفاده می‌کند
- ✅ اگر Docker نباشد، از PostgreSQL محلی استفاده می‌کند
- ✅ در صورت نبودن `backend/.env`، آن را از `backend/.env.example` می‌سازد
- ✅ وابستگی‌های npm را نصب می‌کند (در صورت نیاز)
- ✅ Prisma Client را تولید می‌کند
- ✅ Migration های دیتابیس را اجرا می‌کند
- ✅ بک‌اند را در پورت 3001 راه‌اندازی می‌کند
- ✅ فرانت‌اند را در پورت 3000 راه‌اندازی می‌کند

```cmd
run.bat
```

یا دوبار کلیک روی فایل `run.bat`

**نکات مهم:**

1. **اگر Docker دارید:** فایل به‌صورت خودکار از Docker استفاده می‌کند و PostgreSQL و Redis را راه‌اندازی می‌کند.

2. **اگر Docker ندارید:** 
   - مطمئن شوید PostgreSQL نصب و در حال اجرا است
   - یک دیتابیس ایجاد کنید (مثلاً `latari_db`)
   - فایل `backend/.env` را ویرایش کنید و `DATABASE_URL` را تنظیم کنید:
     ```env
     DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
     ```

بعد از اجرا، وب‌سایت در آدرس زیر در دسترس خواهد بود:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

### راه‌اندازی دستی

#### راه‌اندازی Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

#### راه‌اندازی Frontend

```bash
cd frontend
npm install
npm run dev
```

#### راه‌اندازی Database

```bash
docker-compose up -d
```

## تنظیمات

فایل `.env` در backend را ایجاد کنید:

```env
DATABASE_URL="postgresql://latari_user:latari_password@localhost:5432/latari_db?schema=public"
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d
PORT=3001
FRONTEND_URL=http://localhost:3000
```

## API Endpoints

### Auth
- `POST /auth/register` - ثبت‌نام
- `POST /auth/login` - ورود
- `GET /auth/me` - اطلاعات کاربر

### Wallet
- `GET /wallet/balance` - موجودی
- `POST /wallet/deposit` - شارژ
- `POST /wallet/withdraw` - برداشت
- `GET /wallet/transactions` - تاریخچه

### Tickets
- `POST /tickets/buy` - خرید بلیط
- `GET /tickets/my-tickets` - بلیط‌های من

### Lottery
- `GET /lottery` - لیست قرعه‌کشی‌ها
- `POST /lottery/enter` - شرکت در قرعه‌کشی

### Games
- `POST /wheel/spin` - چرخش گردونه
- `POST /slide/play` - بازی ماشین اسلاید

### Admin
- `GET /admin/dashboard` - آمار کلی
- `POST /admin/lottery` - ایجاد قرعه‌کشی
- `POST /admin/lottery/:id/draw` - قرعه‌کشی

## ساختار پروژه

```
latari/
├── backend/
│   ├── src/
│   │   ├── modules/        # ماژول‌های Backend
│   │   ├── common/        # Guards, Decorators
│   │   └── main.ts
│   └── prisma/
│       └── schema.prisma
├── frontend/
│   ├── app/               # صفحات Next.js
│   ├── components/        # کامپوننت‌های React
│   └── lib/               # Utilities
└── docker-compose.yml
```

## استقرار در چابکان

برای استقرار روی هاست ابری چابکان، فایل [CHABKAN_DEPLOYMENT.md](./CHABKAN_DEPLOYMENT.md) را مطالعه کنید.

**نکته امنیتی:** فایل `.env` در Git commit نمیشود. متغیرهای حساس را در Environment Variables پنل چابکان تنظیم کنید.

## مجوز

این پروژه برای استفاده شخصی و تجاری آزاد است.
