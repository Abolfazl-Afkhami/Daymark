interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;
  return (
    <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Project View</h1>
      <p className="text-sm text-text-muted">Project ID: {id}</p>
    </main>
  );
}
