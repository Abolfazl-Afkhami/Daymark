export function HabitCheckRow({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-md">
      <span>{name}</span>
    </div>
  );
}

export function DailyProgressCard() {
  return <div className="p-4 border rounded-md">Daily Progress</div>;
}

export function QuickSessionWidget() {
  return <div className="p-4 border rounded-md">Quick Session Widget</div>;
}
