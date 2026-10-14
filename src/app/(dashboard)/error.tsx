'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="w-14 h-14 rounded-full bg-status-missed/10 text-status-missed flex items-center justify-center mb-4">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <h2 className="text-xl font-bold text-text-main">خطایی رخ داده است</h2>
      <p className="text-sm text-text-muted mt-2 max-w-md">
        متأسفانه در بارگذاری این صفحه مشکلی پیش آمده است. می‌توانید دوباره تلاش کنید.
      </p>
      <button
        onClick={() => reset()}
        className="mt-6 flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white font-medium text-sm hover:opacity-95 transition-opacity"
      >
        <RefreshCw className="w-4 h-4" />
        <span>تلاش مجدد</span>
      </button>
    </div>
  );
}
