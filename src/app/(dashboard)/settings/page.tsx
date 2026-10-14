export default function SettingsPage() {
  return (
    <main className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Settings & Preferences</h1>
      </header>
      <section className="p-6 rounded-lg bg-surface border border-border-subtle space-y-4">
        <h2 className="text-lg font-semibold">Preferences</h2>
        <p className="text-sm text-text-muted">Configure categories, language, calendar, and backups.</p>
      </section>
    </main>
  );
}
