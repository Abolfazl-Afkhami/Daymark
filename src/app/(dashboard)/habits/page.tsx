export default function HabitsPage() {
  return (
    <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Habits Directory</h1>
      </header>
      <section className="p-6 rounded-lg bg-surface border border-border-subtle text-center py-12">
        <p className="text-text-muted">No habits found. Click 'Add Habit' to start.</p>
      </section>
    </main>
  );
}
