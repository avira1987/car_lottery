# راهنمای استقرار در چابکان

## نکات امنیتی مهم

- **فایل `.env` هرگز در Git commit نشود** (در `.gitignore` قرار دارد)
- رمز دیتابیس و JWT را **فقط در Environment Variables پنل چابکان** تنظیم کنید
- از رمزهای قوی و تصادفی برای پروداکشن استفاده کنید

## متغیرهای محیطی مورد نیاز در چابکان

برای سرویس NestJS/Docker، این متغیرها را در پنل چابکان تنظیم کنید:

| متغیر | توضیح |
|-------|-------|
| `DATABASE_URL` | رشته اتصال PostgreSQL به فرمت: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE` |
| `PORT` | پورت سرویس (معمولاً خودکار تنظیم میشود) |
| `FRONTEND_URL` | آدرس فرانت‌اند (مثال: `https://yourdomain.com`) |
| `JWT_SECRET` | کلید رمزنگاری JWT |
| `JWT_REFRESH_SECRET` | کلید refresh token |

اطلاعات اتصال PostgreSQL را از پنل سرویس PostgreSQL چابکان (hub.chabokan.net) دریافت کنید.

## روش‌های استقرار

- **CLI:** `chabok login` و سپس `chabok deploy`
- **Git:** clone از repository و ریستارت سرویس
- **FTP:** برای پروژه‌های بزرگتر از 100MB

مستندات کامل: https://docs.chabokan.net/
