import Link from 'next/link';
import { FileQuestion, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="w-14 h-14 rounded-full bg-elevated text-text-muted flex items-center justify-center mb-4">
        <FileQuestion className="w-7 h-7" />
      </div>
      <h2 className="text-xl font-bold text-text-main">صفحه یا داده مورد نظر یافت نشد</h2>
      <p className="text-sm text-text-muted mt-2 max-w-md">
        صفحه‌ای که به دنبال آن بودید وجود ندارد یا آیدی واردشده معتبر نمی‌باشد.
      </p>
      <Link
        href="/today"
        className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white font-medium text-sm hover:opacity-95 transition-opacity"
      >
        <ArrowRight className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
        <span>بازگشت به داشبورد امروز</span>
      </Link>
    </div>
  );
}
