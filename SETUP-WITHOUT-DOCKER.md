# راه‌اندازی بدون Docker

اگر Docker ندارید یا می‌خواهید از PostgreSQL محلی استفاده کنید، این راهنما را دنبال کنید.

## پیش‌نیازها

1. **PostgreSQL نصب شده** - دانلود از: https://www.postgresql.org/download/windows/
2. **Node.js 18+** - دانلود از: https://nodejs.org/

## مراحل راه‌اندازی

### 1. نصب PostgreSQL

- PostgreSQL را دانلود و نصب کنید
- در حین نصب، رمز عبور برای کاربر `postgres` تنظیم کنید
- پورت پیش‌فرض: `5432`

### 2. ایجاد دیتابیس

دو روش برای ایجاد دیتابیس:

#### روش 1: استفاده از pgAdmin
1. pgAdmin را باز کنید
2. به سرور PostgreSQL متصل شوید
3. راست کلیک روی "Databases" → "Create" → "Database"
4. نام دیتابیس را `latari_db` بگذارید
5. روی "Save" کلیک کنید

#### روش 2: استفاده از Command Line
```cmd
psql -U postgres
```

سپس در psql:
```sql
CREATE DATABASE latari_db;
\q
```

### 3. تنظیم DATABASE_URL

فایل `backend\.env` را باز کنید و `DATABASE_URL` را تغییر دهید:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/latari_db"
```

**مثال‌ها:**
- اگر رمز عبور شما `mypassword123` است:
  ```
  DATABASE_URL="postgresql://postgres:mypassword123@localhost:5432/latari_db"
  ```

- اگر از کاربر دیگری استفاده می‌کنید:
  ```
  DATABASE_URL="postgresql://username:password@localhost:5432/latari_db"
  ```

### 4. اجرای پروژه

```cmd
run.bat
```

## عیب‌یابی

### خطای Authentication failed

**مشکل:** رمز عبور یا نام کاربری اشتباه است

**راه حل:**
1. رمز عبور PostgreSQL خود را بررسی کنید
2. مطمئن شوید که نام کاربری درست است (معمولاً `postgres`)
3. `DATABASE_URL` را در `backend\.env` بررسی کنید

### خطای Database does not exist

**مشکل:** دیتابیس ایجاد نشده است

**راه حل:**
1. دیتابیس را ایجاد کنید (مرحله 2 بالا)
2. نام دیتابیس در `DATABASE_URL` را بررسی کنید

### خطای Connection refused

**مشکل:** PostgreSQL در حال اجرا نیست

**راه حل:**
1. Windows Services را باز کنید (Win+R → services.msc)
2. سرویس PostgreSQL را پیدا کنید
3. روی "Start" کلیک کنید

### بررسی اتصال

برای تست اتصال به PostgreSQL:

```cmd
psql -U postgres -d latari_db
```

اگر متصل شدید، یعنی تنظیمات درست است.

## نکات مهم

- رمز عبور PostgreSQL را در `DATABASE_URL` قرار دهید
- مطمئن شوید PostgreSQL قبل از اجرای `run.bat` در حال اجرا است
- اگر از کاربر دیگری غیر از `postgres` استفاده می‌کنید، مطمئن شوید که دسترسی‌های لازم را دارد
