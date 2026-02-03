import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Vazir } from './fonts';
import Navbar from '@/components/layout/Navbar';
import ToastContainer from '@/components/ui/ToastContainer';
import "./globals.css";

export const metadata: Metadata = {
  title: "لاتاری - قرعه‌کشی خودرو",
  description: "پلتفرم قرعه‌کشی خودرو با سیستم بازی و کیف پول",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();

  return (
    <html lang="fa" dir="rtl">
      <body className={`${Vazir.variable} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <Navbar />
          {children}
          <ToastContainer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
