export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-elevated rounded-lg" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="h-28 bg-elevated rounded-xl" />
        <div className="h-28 bg-elevated rounded-xl" />
      </div>
      <div className="space-y-3 pt-4">
        <div className="h-6 w-36 bg-elevated rounded" />
        <div className="h-16 bg-elevated rounded-lg" />
        <div className="h-16 bg-elevated rounded-lg" />
      </div>
    </div>
  );
}
