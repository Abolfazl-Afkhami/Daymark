export default function TodayPage() {
  return (
    <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Today</h1>
      </header>

      {/* Summary Strip */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-surface border border-border-subtle">
          <div className="text-sm text-text-muted">Today's Habits</div>
          <div className="text-2xl font-semibold mt-1">0 / 0 (0%)</div>
        </div>
        <div className="p-4 rounded-lg bg-surface border border-border-subtle">
          <div className="text-sm text-text-muted">Focused Time Today</div>
          <div className="text-2xl font-semibold mt-1">0h 0m · 0 questions</div>
        </div>
      </section>

      {/* Today's Scheduled Habits List */}
      <section className="p-6 rounded-lg bg-surface border border-border-subtle text-center py-12">
        <p className="text-text-muted">
          No habits scheduled for today. Create your first habit or load your starter template.
        </p>
      </section>
    </main>
  );
}
