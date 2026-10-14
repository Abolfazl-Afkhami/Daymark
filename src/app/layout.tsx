import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Daymark - Personal Habit Tracking & Productivity Dashboard',
  description: 'Single-user, mobile-first personal habit tracking and productivity dashboard',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" className="h-full">
      <body className="min-h-full bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-50">
        {children}
      </body>
    </html>
  );
}
