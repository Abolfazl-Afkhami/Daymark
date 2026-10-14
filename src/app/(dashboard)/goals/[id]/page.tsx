interface GoalDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function GoalDetailPage({ params }: GoalDetailPageProps) {
  const { id } = await params;
  return (
    <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Goal Details</h1>
      <p className="text-sm text-text-muted">Goal ID: {id}</p>
    </main>
  );
}
