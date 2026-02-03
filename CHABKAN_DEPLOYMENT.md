# راهنمای استقرار در چابکان

## نکات امنیتی مهم

- **فایل `.env` هرگز در Git commit نشود** (در `.gitignore` قرار دارد)
- رمز دیتابیس و JWT را **فقط در Environment Variables پنل چابکان** تنظیم کنید
- از رمزهای قوی و تصادفی برای پروداکشن استفاده کنید

## فرآیند خودکار چابکان

طبق [مستندات چابکان](https://docs.chabokan.net/features/console/)، **نصب پکیج‌ها و دستورات دیپلوی به صورت خودکار اجرا می‌شوند** — نیازی به اجرای دستی `npm install` در کنسول نیست.

### Hook برای Migration دیتابیس

فایل `backend/chabok-pre-start.sh` قبل از هر اجرای برنامه، به صورت خودکار `prisma migrate deploy` را اجرا می‌کند. نیازی به اجرای دستی migration در کنسول نیست.

## متغیرهای محیطی مورد نیاز

برای سرویس Nest در پنل چابکان تنظیم کنید:

| متغیر | توضیح |
|-------|-------|
| `DATABASE_URL` | رشته اتصال PostgreSQL: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE` |
| `PORT` | پورت سرویس (معمولاً خودکار) |
| `FRONTEND_URL` | آدرس فرانت‌اند (بعد از deploy) |
| `JWT_SECRET` | کلید رمزنگاری JWT |
| `JWT_REFRESH_SECRET` | کلید refresh token |

اطلاعات اتصال را از پنل PostgreSQL چابکان دریافت کنید.

## روش‌های استقرار

- **CLI (پیشنهادی):** `chabok login` → `cd backend` → `chabok deploy`
- **Git:** clone و ریستارت سرویس
- **FTP:** برای پروژه‌های بیش از 100MB

مستندات: https://docs.chabokan.net/
