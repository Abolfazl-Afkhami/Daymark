export function HabitForm() {
  return <form className="space-y-4">Habit Form</form>;
}

export function StreakCalendarGrid() {
  return <div>Streak Calendar Grid</div>;
}

export function ScheduleBadge({ schedule }: { schedule: string }) {
  return <span className="px-2 py-0.5 text-xs rounded bg-elevated">{schedule}</span>;
}

export * from './HabitCheckItem';
export * from './HabitCard';

