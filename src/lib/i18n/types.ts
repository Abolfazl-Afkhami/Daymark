// src/lib/i18n/types.ts

export type Locale = 'fa' | 'en';

export interface Dictionary {
  locale: Locale;
  nav: {
    today: string;
    habits: string;
    focus: string;
    vault: string;
    goals: string;
    projects: string;
    analytics: string;
    settings: string;
    brandSubtitle: string;
  };
  common: {
    save: string;
    cancel: string;
    delete: string;
    confirmDelete: string;
    archive: string;
    unarchive: string;
    edit: string;
    add: string;
    close: string;
    search: string;
    active: string;
    completed: string;
    archived: string;
    partial: string;
    skipped: string;
    missed: string;
    unlogged: string;
    loading: string;
    success: string;
    error: string;
    day: string;
    days: string;
    hour: string;
    hours: string;
    minute: string;
    minutes: string;
    questions: string;
    today: string;
    yesterday: string;
    tomorrow: string;
    week: string;
  };
  today: {
    title: string;
    subtitle: string;
    quickFocus: string;
    quickPractice: string;
    quickNote: string;
    quickGoals: string;
    habitsProgressCard: string;
    focusTimeCard: string;
    readyToLog: string;
    scheduledHabits: string;
    noHabitsToday: string;
    defineFirstHabit: string;
    unloggedAlertTitle: string;
    unloggedHabitDesc: string;
    unloggedStudyDesc: string;
    logRetroactive: string;
    sm2DueTitle: string;
    lifeAreasTitle: string;
  };
  habits: {
    title: string;
    subtitle: string;
    newHabit: string;
    binary: string;
    quantitative: string;
    schedule: string;
    target: string;
    noHabitsYet: string;
  };
  focus: {
    title: string;
    subtitle: string;
    startFocus: string;
    resumeFocus: string;
    pauseFocus: string;
    stopAndSave: string;
    focusSound: string;
    categoryLabel: string;
    projectLabel: string;
    goalLabel: string;
    questionsLabel: string;
    notesLabel: string;
    recentSessionsTitle: string;
    noSessionsYet: string;
  };
  vault: {
    title: string;
    subtitle: string;
    tabReviews: string;
    tabNotes: string;
    tabExams: string;
    tabPractice: string;
    searchNotesPlaceholder: string;
    addNoteTitle: string;
    addExamTitle: string;
    addPracticeTitle: string;
    taraz: string;
    percentage: string;
    cityRank: string;
    countryRank: string;
  };
  goals: {
    title: string;
    subtitle: string;
    newGoal: string;
    deadline: string;
    progressFrom: string;
    addBatch: string;
    setExact: string;
  };
  projects: {
    title: string;
    subtitle: string;
    newProject: string;
    tasksTitle: string;
    addTaskPlaceholder: string;
    noProjectsYet: string;
    priorityLow: string;
    priorityMedium: string;
    priorityHigh: string;
    priorityCritical: string;
  };
  settings: {
    title: string;
    subtitle: string;
    generalSettings: string;
    themeTitle: string;
    themeSubtitle: string;
    languageLabel: string;
    calendarLabel: string;
    rolloverLabel: string;
    rolloverDesc: string;
    saveSettings: string;
    categoriesTitle: string;
    backupTitle: string;
  };
}
