#!/bin/sh
# اجرای migrationهای Prisma قبل از شروع برنامه (چابکان Hook)
npx prisma migrate deploy
