<div align="center">

# Daymark ⏱️

**سیستم جامع تله‌متری زمان، مدیریت عادت‌ها، پروژه‌های مهندسی و خزانه دانش شخصی**  
*Personal Time-Telemetry, Habit Tracking, Engineering Project Management & Knowledge Vault*

[![Version](https://img.shields.io/badge/version-v2.1.0-blue.svg)](https://github.com/Abolfazl-Afkhami/Daymark/releases)
[![Next.js](https://img.shields.io/badge/Next.js-14%20(App%20Router)-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6.svg)](https://www.typescriptlang.org/)
[![SQLite](https://img.shields.io/badge/SQLite-WAL%20%2B%20Drizzle%20ORM-003B57.svg)](https://orm.drizzle.team/)
[![Tests](https://img.shields.io/badge/Tests-Vitest-6E9F18.svg)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

[**🇮🇷 مستندات کامل فارسی**](#-معرفی-پروژه) · [**🇺🇸 English Documentation**](#-english-documentation) · [**📐 مشخصات فنی (SPECIFICATION.md)**](./SPECIFICATION.md)

</div>

---

## 📌 معرفی پروژه

**Daymark** یک داشبورد بهره‌وری تک‌کاربره، **Local-First** (مبتنی بر ذخیره‌سازی محلی بدون وابستگی به کلود) و موبایل‌محور است که برای نیازهای واقعی یک دانش‌آموز/دانشجوی علوم پایه (ریاضی و فیزیک) و مهندس نرم‌افزار/هوش مصنوعی طراحی و توسعه یافته است.

برخلاف ابزارهای عمومی مدیریت تسک که یا بیش از حد ساده هستند و یا درگیر پیچیدگی‌های تیمی و سازمانی می‌شوند، Daymark روی **اندازه‌گیری دقیق کار عمیق (Deep Work)**، **پیوستگی عادت‌ها**، **پیشبرد پروژه‌های مهندسی** و **تثبیت دانش علمی (مرور با فاصله و تحلیل تست/آزمون)** تمرکز دارد. تمام داده‌ها روی سیستم شخصی کاربر در پایگاه‌داده SQLite با پیکربندی `WAL` ذخیره می‌شوند تا سرعت پاسخ‌دهی آنی و مالکیت کامل داده‌ها تضمین شود.

---

## ✨ قابلیت‌ها و ماژول‌های کلیدی

### ۱. میز فرمان روزانه (Today — Mission Control)
- **نوار پیوستگی (Continuity Strip):** نمایش وضعیت فعالیت روزهای اخیر و استریک کلی در یک نگاه.
- **تشخیص هوشمند روزهای ثبت‌نشده (Retroactive Gap Detector):** شناسایی خودکار روزهایی که فراموش کرده‌اید لاگ بزنید (`gap-detector`) با امکان ثبت گذشته‌نگر (Retroactive Logging) یا رد کردن مجاز (Skip/Exemption) برای جلوگیری از تخریب ناعادلانه استریک‌ها.
- **سکوی پرتاب سریع (Quick Launchpad):** شروع سریع تایمر تمرکز، ثبت عادت یا ایجاد تسک جدید بدون جابه‌جایی بین صفحات.
- **کارت تسک‌های فعال (Today Tasks Card):** تجمیع تسک‌های باز از پروژه‌های در حال اجرا برای تمرکز روی اولویت‌های روز.

### ۲. مهندسی عادت‌ها و استریک‌های منعطف (Habits Engine)
- **پشتیبانی از دو مدل عادت:**
  - **بولین (Boolean):** انجام شد / نشد (مثل ورزش روزانه).
  - **کمّی (Quantitative):** مبتنی بر مقدار هدف و واحد شمارش (مثل مطالعه ۳۰ صفحه کتاب یا ۶۰ دقیقه کدنویسی).
- **سیستم معافیت و استراحت (Skip / Exemption):** امکان ثبت روزهای مرخصی، بیماری یا امتحانات به‌عنوان `Skipped` بدون شکسته شدن زنجیره استریک (`streaks.ts`).
- **الگوهای تکرار متنوع:** روزانه، روزهای خاص هفته یا اهداف دفعات هفتگی (`recurrence.ts`).

### ۳. تایمر تمرکز و تله‌متری کار عمیق (Focus & Time Telemetry)
- **تایمر دقیق جلسات تمرکز (`FocusTimer`):** ثبت جلسات کار عمیق (Pomodoro یا زمان آزاد) همراه با بازخورد صوتی (`focus-audio.ts`).
- **همگام‌سازی اتمیک با اهداف و پروژه‌ها:** اتصال مستقیم هر جلسه تمرکز به یک هدف (Goal) یا پروژه (Project) مشخص؛ با اتمام جلسه، زمان صرف‌شده به‌صورت خودکار به پیشرفت هدف مرتبط اضافه می‌شود.
- **تشخیص تداخل زمانی (`overlap.ts`):** جلوگیری از ثبت جلسات همپوشان در تاریخچه فعالیت‌ها.

### ۴. خزانه دانش، مرور با فاصله و مدیریت آزمون (Knowledge Vault & Study Engine)
- **سیستم مرور با فاصله مبتنی بر الگوریتم SM-2 (`SpacedRepetitionDeck`):** ساخت فلش‌کارت‌های علمی و فنی (فرمول‌ها، مفاهیم الگوریتمی، نکات درسی) و زمان‌بندی خودکار دفعات مرور بر اساس کیفیت یادآوری (امتیاز ۰ تا ۵ در موتور `study-engine.ts`).
- **مدیریت آزمون‌های آزمایشی و تست‌زنی مبحثی (`ExamAndPracticeManager`):** ثبت نتایج آزمون‌های چنددرسی و جلسات تست‌زنی، محاسبه دقیق درصد خام (با اعمال فرمول نمره منفی استاندارد) و رصد نقاط ضعف و قوت در دروس مختلف.

### ۵. مدیریت اهداف و پروژه‌های مهندسی (Goals & Projects)
- **اهداف کلان و خرد (`/goals`):** تعریف اهداف زمان‌دار با شاخص‌های عددی، دسته‌بندی رنگ‌بندی‌شده و رصد درصد پیشرفت.
- **پروژه‌ها و چک‌لیست تسک‌ها (`/projects`):** مدیریت پروژه‌های نرم‌افزاری یا مطالعاتی با ساختار چک‌لیست (`TaskChecklist`)، وضعیت پروژه (فعال، متوقف، تکمیل‌شده) و پیوند به جلسات تمرکز.

### ۶. داشبورد تحلیل عملکرد (Analytics & Telemetry)
- **نقشه حرارتی فعالیت‌ها (`ActivityHeatmap`):** نمایش گرافیکی پیوستگی فعالیت‌ها در طول سال (مشابه گراف مشارکت‌های GitHub).
- **نمودارهای تحلیلی (`AnalyticsChartsClient`):** تحلیل توزیع ساعت‌های تمرکز به تفکیک دسته‌بندی (تحصیلی، هوش مصنوعی، برنامه‌نویسی، رشد فردی)، نرخ تکمیل عادت‌ها و سرعت پیشبرد اهداف.

### ۷. پالت دستورات سریع و تجربه کاربری (Command Palette & UI)
- **پالت دستورات (`Ctrl+K` / `⌘K`):** ناوبری آنی بین صفحات، تغییر تم، تغییر زبان و اجرای دستورات متنی سریع از طریق `command-parser.ts` با تشخیص خودکار سیستم‌عامل کاربر.
- **موتور چندتم بدون پرش تصویر (Zero-FOUC Multi-Theme Engine):** پشتیبانی از تم‌های متنوع (Light، Dark، Sepia، OLED و ...) با تزریق مستقیم متغیرهای CSS به ریشه DOM پیش از رندر صفحه.
- **موتور تقویم دوگانه و دوزبانه کامل (Jalali & Gregorian + RTL/LTR):** پشتیبانی بومی و قطعی از تقویم **شمسی (جلالی)** و **میلادی** به همراه انتخابگر تاریخ اختصاصی (`DatePickerPopover` / `DatePickerDropdown`) و چیدمان دوطرفه کامل برای زبان فارسی (`RTL`) و انگلیسی (`LTR`).

### ۸. مالکیت داده، پشتیبان‌گیری و یکپارچگی دیتابیس
- **پشتیبان‌گیری و بازیابی ایمن (`/api/backup` & `/api/restore`):** خروجی گرفتن کامل از کل دیتابیس به فرمت `JSON` و بازیابی اطلاعات با اعتبارسنجی سخت‌گیرانه اسکیما توسط **Zod**.
- **حذف ایمن رابطه‌ای (`delete-actions.ts`):** مدیریت حذف اهداف، پروژه‌ها و دسته‌بندی‌ها با حفظ یکپارچگی ارجاعات دیتابیس (Relational Integrity) و جلوگیری از ایجاد رکوردهای یتیم (Orphaned Records).

---

## 🛠️ تکنولوژی‌های به‌کار رفته (Tech Stack)

| لایه | تکنولوژی / ابزار | توضیح و نقش در معماری |
| :--- | :--- | :--- |
| **Framework** | Next.js 14 (App Router) + React 18 | معماری ترکیبی Server Components و Server Actions |
| **Language** | TypeScript (Strict Mode) | فعال بودن `strict: true` و `noUncheckedIndexedAccess` برای ایمنی کامل نوع‌ها |
| **Database** | SQLite (`better-sqlite3`) | ذخیره‌سازی محلی در حالت **WAL (Write-Ahead Logging)** با الگوی Singleton |
| **ORM** | Drizzle ORM | مدیریت تایپ‌سیف کوئری‌ها و اسکیمای رابطه‌ای |
| **Styling** | Tailwind CSS | طراحی واکنش‌گرا (Mobile-First)، پشتیبانی از RTL/LTR و سیستم تم مبتنی بر متغیرهای CSS |
| **Charts & UI** | Recharts + Lucide Icons | مصورسازی داده‌های تحلیلی و آیکون‌های رابط کاربری |
| **Calendar** | `jalaali-js` + Custom Civil Date | محاسبات دقیق تقویم شمسی و میلادی بدون خطای Timezone Drift |
| **Validation** | Zod | اعتبارسنجی ورودی‌های Server Actions و فایل‌های پشتیبان |
| **Testing** | Vitest | تست‌های واحد (Unit Tests) برای منطق دامنه، استریک‌ها، تقویم و موتور مطالعه |

---

## 🚀 راهنمای نصب و راه‌اندازی (Installation & Quick Start)

### پیش‌نیازها
- **Node.js** نسخه `18.17` یا بالاتر (پیشنهاد: نسخه `20 LTS`)
- **pnpm** (پیشنهادی) یا `npm`
- ابزارهای کامپایل بومی (در صورت نیاز برای بیلد شدن پکیج `better-sqlite3` روی سیستم‌عامل شما)

### ۱. دریافت مخزن (Clone)
```bash
git clone https://github.com/Abolfazl-Afkhami/Daymark.git
cd Daymark
```

### ۲. نصب وابستگی‌ها
```bash
pnpm install
```
*(اگر از npm استفاده می‌کنید: `npm install`)*

### ۳. مقداردهی اولیه پایگاه‌داده (Database Seed)
برای ایجاد فایل دیتابیس SQLite، ساخت جداول و افزودن ۴ دسته‌بندی پایه زندگی (مطالعات تحصیلی، هوش مصنوعی، برنامه‌نویسی، رشد فردی):
```bash
node scripts/seed.js
```

### ۴. اجرای سرور توسعه (Development)
```bash
pnpm dev
```
سپس مرورگر خود را باز کرده و به آدرس `http://localhost:3000` بروید.

### ۵. بیلد نسخه پروداکشن (Production Build)
برای استفاده روزمره با حداکثر سرعت و بدون سربار محیط توسعه:
```bash
pnpm build
pnpm start
```

### ۶. اجرای تست‌های واحد (Unit Tests)
برای اطمینان از صحت عملکرد موتور استریک، تقویم، الگوریتم SM-2 و تشخیص تداخل جلسات:
```bash
pnpm test
```

---

## 📖 راهنمای استفاده روزمره (Workflow Guide)

1. **شروع روز با `/today` (میز فرمان):**
   - هر روز را با صفحه Today شروع کنید. اگر روز قبل فراموش کرده باشید عادت‌هایتان را ثبت کنید، بنر Retroactive Gap بالای صفحه ظاهر می‌شود تا وضعیت روزهای جاافتاده را مشخص کنید.
   - عادت‌های روزانه خود را تیک بزنید یا مقدار کمّی آنها را وارد کنید.

2. **ثبت جلسات کار عمیق در `/focus`:**
   - پیش از شروع مطالعه یا کدنویسی، وارد بخش Focus شوید، هدف یا پروژه مرتبط را انتخاب کنید و تایمر را بزنید. پس از پایان جلسه، زمان کار شما ثبت شده و پیشرفت هدف مربوطه به‌روزرسانی می‌شود.

3. **مرور علمی و ثبت تست در `/vault`:**
   - فلش‌کارت‌های درسی یا فنی خود را در بخش Spaced Repetition مرور کنید تا الگوریتم SM-2 زمان مرور بعدی را بر اساس تسلط شما تنظیم کند.
   - پس از هر نوبت تست‌زنی یا آزمون آزمایشی، تعداد صحیح، غلط و نزده را در بخش Exam & Practice Manager ثبت کنید تا درصد دقیق (با نمره منفی) و روند پیشرفتتان محاسبه شود.

4. **استفاده از پالت دستورات سریع (`Ctrl + K` یا `⌘ + K`):**
   - در هر جای برنامه، کلیدهای `Ctrl + K` (در مک `⌘ + K`) را فشار دهید تا بدون نیاز به ماوس بین صفحات جابه‌جا شوید، تم برنامه را عوض کنید یا دستورات سریع را اجرا کنید.

5. **پشتیبان‌گیری منظم در `/settings`:**
   - از بخش Settings > Backup & Restore می‌توانید در هر لحظه یک فایل پشتیبان JSON از تمام داده‌های خود دانلود کنید و در سیستم یا فضای ابری شخصی‌تان نگه دارید.

---

## 📂 ساختار معماری پروژه (Project Structure)

پروژه بر اساس معماری Modular Monolith با تفکیک دقیق منطق دامنه (`domain`) از لایه کاربرد (`application`) و رابط کاربری (`components` / `app`) طراحی شده است:

```text
Daymark/
├── scripts/
│   └── seed.js                # اسکریپت ساخت جداول و مقداردهی اولیه دیتابیس
├── src/
│   ├── app/                   # مسیریابی Next.js App Router
│   │   ├── (dashboard)/       # صفحات اصلی داشبورد
│   │   │   ├── today/         # میز فرمان روزانه (Mission Control)
│   │   │   ├── habits/        # مدیریت و جزئیات عادت‌ها
│   │   │   ├── focus/         # تایمر تمرکز و تاریخچه جلسات
│   │   │   ├── goals/         # مدیریت اهداف کلان و خرد
│   │   │   ├── projects/      # مدیریت پروژه‌ها و چک‌لیست تسک‌ها
│   │   │   ├── vault/         # خزانه دانش، فلش‌کارت‌های SM-2 و مدیریت آزمون
│   │   │   ├── analytics/     # نقشه حرارتی و نمودارهای تحلیلی
│   │   │   └── settings/      # تنظیمات تم، زبان، تقویم، دسته‌بندی و پشتیبان‌گیری
│   │   └── api/
│   │       ├── backup/route.ts # اندپوینت خروجی گرفتن از کل دیتابیس (JSON)
│   │       └── restore/route.ts # اندپوینت بازیابی ایمن با اعتبارسنجی Zod
│   ├── domain/                # هسته منطق دامنه (Pure TypeScript - بدون وابستگی به UI/DB)
│   │   ├── __tests__/domain.test.ts # تست‌های واحد منطق دامنه (Vitest)
│   │   ├── analytics/metrics.ts # محاسبات متریک‌های بهره‌وری و امتیازدهی
│   │   ├── calendar/          # منطق Civil Date و تبدیل تقویم جلالی/میلادی
│   │   ├── category/constants.ts # ثوابت دسته‌بندی‌های پایه
│   │   ├── cli/command-parser.ts # پارسر دستورات متنی سریع در Command Palette
│   │   ├── habits/            # موتور محاسبه استریک، تکرارپذیری و تکمیل عادت
│   │   ├── sessions/overlap.ts # الگوریتم تشخیص همپوشانی زمانی جلسات تمرکز
│   │   └── study/study-engine.ts # الگوریتم مرور با فاصله SM-2 و محاسبات درصد آزمون
│   ├── application/           # لایه سرویس‌ها و Next.js Server Actions
│   │   ├── actions/           # اکشن‌های سرور (Habits, Goals, Projects, Vault, Delete...)
│   │   └── services/          # سرویس‌های کاربردی (Gap Detector, Backup, Study...)
│   ├── db/                    # لایه داده و پایگاه‌داده
│   │   ├── client.ts          # اتصال Singleton به SQLite با فعال‌سازی WAL Mode
│   │   ├── schema.ts          # تعریف جداول در Drizzle ORM
│   │   ├── schema.sql         # اسکیمای خام SQL
│   │   └── seed.sql           # داده‌های پایه اولیه
│   ├── components/            # کامپوننت‌های ماژولار رابط کاربری
│   └── lib/                   # ابزارهای جانبی (i18n، تقویم، صدا، تم، اعتبارسنجی Zod)
├── SPECIFICATION.md           # سند کامل مشخصات فنی و مدل‌های ریاضی سیستم
├── vitest.config.ts           # پیکربندی تست‌های واحد
└── package.json
```

---

## 🇺🇸 English Documentation

### Overview
**Daymark** is a single-user, local-first personal time-telemetry, habit-tracking, and knowledge management dashboard built to measure deep work, academic studies, and software engineering execution.

Instead of relying on cloud-hosted SaaS tools with high latency and fragmented workflows, Daymark runs locally on top of Next.js 14 (App Router) and an embedded SQLite database configured in Write-Ahead Logging (WAL) mode. It is designed with a clean Modular Monolith architecture where core domain rules (streak math, timezone-agnostic civil dates, SM-2 spaced repetition, exam scoring, and session overlap detection) are strictly decoupled from the UI and persistence layers.

### Key Engineering Highlights
- **Pure Domain Layer (`src/domain/`):** Deterministic business logic written in strict TypeScript (`noUncheckedIndexedAccess`), unit-tested with Vitest.
- **Civil Date & Dual-Calendar Engine:** Prevents timezone drift across habit logs by storing canonical `YYYY-MM-DD` civil dates while supporting instant runtime switching between Gregorian and Jalali (Solar Hijri) calendars with native custom date pickers.
- **Retroactive Gap Detection (`gap-detector.ts`):** Automatically detects unlogged historical days and surfaces a mission-control banner on `/today`, allowing retroactive logging or explicit streak exemptions (`Skipped`) without corrupting streak continuity.
- **Atomic Focus Telemetry:** Deep work sessions logged via the `FocusTimer` synchronize atomically with linked Goals and Projects, preventing overlapping session intervals (`overlap.ts`).
- **Knowledge Vault & SM-2 Study Engine (`study-engine.ts`):** Built-in SuperMemo-2 (SM-2) spaced repetition flashcard scheduler alongside a multi-subject mock exam and practice test analyzer (supporting negative-marking percentage calculations).
- **Zero-FOUC Multi-Theme Architecture:** Supports multiple visual themes (Light, Dark, Sepia, OLED) injected prior to hydration, alongside full bidirectional layout (RTL for Persian / LTR for English) and an OS-aware Command Palette (`Ctrl+K` / `⌘K`).
- **Validated Data Portability:** Full database export and atomic restore via `/api/backup` and `/api/restore`, guarded by strict Zod schema validation and relational safe-deletion handlers (`delete-actions.ts`).

### Quick Start (English)

```bash
# 1. Clone the repository
git clone https://github.com/Abolfazl-Afkhami/Daymark.git
cd Daymark

# 2. Install dependencies
pnpm install

# 3. Initialize & seed the local SQLite database
node scripts/seed.js

# 4. Run the development server
pnpm dev

# 5. Run domain unit tests
pnpm test
```

For deep architectural specifications, database schemas, and formal streak rules, see [SPECIFICATION.md](./SPECIFICATION.md).

---

## 📄 License
Released under the [MIT License](./LICENSE). Engineered by [Abolfazl Afkhami](https://github.com/Abolfazl-Afkhami).
